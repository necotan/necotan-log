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

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractMeta(html: string, names: string[]): string | null {
  for (const name of names) {
    const propertyFirst = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`,
      'i'
    );
    const contentFirst = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`,
      'i'
    );
    const match = html.match(propertyFirst) ?? html.match(contentFirst);
    if (match?.[1]) {
      return decodeEntities(match[1]);
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

// OGP情報を取得し.cache/link-cards.jsonに永続化する
// 取得失敗時はURLをタイトルとするフォールバックを返す(非キャッシュ)
export async function getLinkCard(url: string): Promise<LinkCardData> {
  const store = loadCache();
  const cached = store[url];
  if (cached) {
    return cached;
  }

  let promise = pending.get(url);
  if (!promise) {
    promise = fetchLinkCard(url).catch((): LinkCardData => ({ url, title: url, description: '', image: null }));
    pending.set(url, promise);
  }

  const data = await promise;
  if (data.title !== url) {
    store[url] = data;
    saveCache();
  }
  return data;
}
