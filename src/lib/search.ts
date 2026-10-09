interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    thumb?: string;
    date?: string;
    category?: string;
  };
}

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

interface Pagefind {
  init: () => Promise<void>;
  options: (options: { excerptLength?: number }) => Promise<void>;
  debouncedSearch: (term: string, options?: object, debounceMs?: number) => Promise<PagefindSearchResponse | null>;
}

export interface SearchController {
  input: HTMLInputElement;
  run: (term: string) => Promise<void>;
}

const MAX_RESULTS = 20;

// インデックスは astro build 後に pagefind が dist/ へ生成するため、実行時にURLで読み込む
// import() を直接書くとViteがpreload処理で包み、Astroがインライン化したscriptでは __VITE_PRELOAD__ が未置換のまま残って実行時エラーになる
const importPagefind = new Function('return import("/pagefind/pagefind.js")') as () => Promise<Pagefind>;

let pagefindPromise: Promise<Pagefind | null> | undefined;

function loadPagefind(): Promise<Pagefind | null> {
  pagefindPromise ??= importPagefind()
    .then(async (module) => {
      await module.options({ excerptLength: 40 });
      await module.init();
      return module;
    })
    .catch(() => null);
  return pagefindPromise;
}

function renderResult(template: HTMLTemplateElement, data: PagefindResultData): HTMLLIElement | null {
  const fragment = template.content.cloneNode(true);
  if (!(fragment instanceof DocumentFragment)) return null;
  const item = fragment.querySelector('li');
  const link = fragment.querySelector('a');
  const image = fragment.querySelector('img');
  const meta = fragment.querySelector('.search-result-meta');
  const title = fragment.querySelector('.search-result-title');
  const excerpt = fragment.querySelector('.search-result-excerpt');
  if (!item || !link || !image || !meta || !title || !excerpt) return null;

  link.href = data.url;
  // heroImageのない記事は、記事カードと同じく枠だけを残して画像を表示しない
  if (data.meta.thumb) {
    image.src = data.meta.thumb;
  } else {
    image.remove();
  }
  meta.textContent = [data.meta.category, data.meta.date].filter(Boolean).join(' / ');
  title.textContent = data.meta.title ?? '';
  // Pagefindの抜粋は本文をエスケープ済みで、<mark>だけを含む
  excerpt.innerHTML = data.excerpt;
  return item;
}

export function createSearch(root: HTMLElement): SearchController | null {
  const form = root.querySelector('[data-search-form]');
  const input = root.querySelector('[data-search-input]');
  const status = root.querySelector('[data-search-status]');
  const list = root.querySelector('[data-search-results]');
  const emptyState = root.querySelector('[data-search-empty]');
  const noResults = root.querySelector('[data-search-no-results]');
  const template = root.querySelector('[data-search-result-template]');
  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !status ||
    !list ||
    !emptyState ||
    !noResults ||
    !(template instanceof HTMLTemplateElement)
  ) {
    return null;
  }

  const run = async (term: string): Promise<void> => {
    const query = term.trim();
    emptyState.classList.toggle('hidden', query !== '');
    if (!query) {
      noResults.classList.add('hidden');
      list.replaceChildren();
      status.textContent = '';
      return;
    }

    const pagefind = await loadPagefind();
    if (!pagefind) {
      status.textContent = 'Search is available after build (npm run build && npm run preview).';
      return;
    }

    const response = await pagefind.debouncedSearch(query, {}, 200);
    // より新しい入力で置き換えられた検索はnullが返る
    if (!response) return;

    const results = await Promise.all(response.results.slice(0, MAX_RESULTS).map((result) => result.data()));
    if (input.value.trim() !== query) return;

    const items = results
      .map((data) => renderResult(template, data))
      .filter((item): item is HTMLLIElement => item !== null);
    list.replaceChildren(...items);
    const count = response.results.length;
    noResults.classList.toggle('hidden', count !== 0);
    status.textContent = count === 0 ? '' : `${count} ${count === 1 ? 'result' : 'results'}`;
  };

  input.addEventListener('input', () => void run(input.value));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    input.blur();
  });

  return { input, run };
}
