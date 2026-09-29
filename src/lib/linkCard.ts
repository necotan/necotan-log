import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface LinkCardData {
  url: string;
  title: string;
  description: string;
  image: string | null;
}

const CACHE_FILE = path.resolve('.cache/link-cards.json');
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = 'Mozilla/5.0 (compatible; necotan-log-bot/1.0; +https://necotan-log.com)';

let cache: Record<string, LinkCardData> | null = null;
const pending = new Map<string, Promise<LinkCardData>>();

function loadCache(): Record<string, LinkCardData> {
  if (!cache) {
    cache = readCacheFile();
  }
  return cache;
}

function readCacheFile(): Record<string, LinkCardData> {
  if (!existsSync(CACHE_FILE)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(): void {
  if (!cache) {
    return;
  }
  mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// 1回のreplaceで処理し、&amp;lt;のような二重デコードを防ぐ
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole: string, ref: string): string => {
    if (ref.startsWith('#')) {
      const isHex = ref[1] === 'x' || ref[1] === 'X';
      const codePoint = isHex ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : whole;
    }
    return NAMED_ENTITIES[ref] ?? whole;
  });
}

// contentの値は開きと同じクォートで閉じる(content="necotan's log"をアポストロフィで切らない)
// 値に開きのクォートを含めないことで、別の<meta>タグをまたいだマッチを防ぐ
function extractMeta(html: string, names: string[]): string | null {
  for (const name of names) {
    const propertyFirst = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=(["'])((?:(?!\\1)[\\s\\S])*)\\1`,
      'i'
    );
    const contentFirst = new RegExp(
      `<meta[^>]+content=(["'])((?:(?!\\1)[\\s\\S])*)\\1[^>]+(?:property|name)=["']${name}["']`,
      'i'
    );
    const match = html.match(propertyFirst) ?? html.match(contentFirst);
    if (match?.[2]) {
      return decodeEntities(match[2]);
    }
  }
  return null;
}

function resolveImageUrl(image: string | null, baseUrl: string): string | null {
  if (!image) {
    return null;
  }
  try {
    return new URL(image, baseUrl).href;
  } catch {
    return null;
  }
}

async function fetchLinkCard(url: string): Promise<LinkCardData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) {
      throw new Error(`unexpected status ${res.status}`);
    }
    const resolvedUrl = res.url || url;
    const html = await res.text();

    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const titleTagText = decodeEntities(titleTagMatch?.[1]?.trim() ?? '');
    const title = extractMeta(html, ['og:title', 'twitter:title']) ?? (titleTagText || url);
    const description = extractMeta(html, ['og:description', 'twitter:description']) ?? '';
    const image = resolveImageUrl(extractMeta(html, ['og:image', 'twitter:image']), resolvedUrl);

    return { url: resolvedUrl, title, description, image };
  } finally {
    clearTimeout(timeout);
  }
}

// タイムアウトはAbortErrorになるため秒数を明示し、fetch failedは原因を付け足す
function describeFetchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  if (error.name === 'AbortError') {
    return `timeout after ${FETCH_TIMEOUT_MS}ms`;
  }
  if (error.cause instanceof Error) {
    return `${error.message}: ${error.cause.message}`;
  }
  return error.message;
}

// OGP情報を取得し.cache/link-cards.jsonに永続化する
// 取得失敗時は警告をログに出し、URLをタイトルとするフォールバックを返す
export async function getLinkCard(url: string): Promise<LinkCardData> {
  const store = loadCache();
  const cached = store[url];
  if (cached) {
    return cached;
  }

  let promise = pending.get(url);
  if (!promise) {
    promise = fetchLinkCard(url).catch((error: unknown): LinkCardData => {
      console.warn(`[linkCard] OGPの取得に失敗しました: ${url} (${describeFetchError(error)})`);
      return { url, title: url, description: '', image: null };
    });
    pending.set(url, promise);
  }

  const data = await promise;
  if (data.title !== url) {
    store[url] = data;
    saveCache();
  }
  return data;
}
