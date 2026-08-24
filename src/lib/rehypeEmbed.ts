import type { Element, Root, RootContent } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { getLinkCard, type LinkCardData } from './linkCard';

// ```embed\nhttps://...\n``` のコードフェンスをYouTube埋め込み、リンクカードに変換する
const EMBED_LANGUAGE_CLASS = 'language-embed';

function findCodeChild(pre: Element): Element | undefined {
  return pre.children.find((child): child is Element => child.type === 'element' && child.tagName === 'code');
}

function isEmbedBlock(node: RootContent): node is Element {
  if (node.type !== 'element' || node.tagName !== 'pre') {
    return false;
  }
  const code = findCodeChild(node);
  if (!code) {
    return false;
  }
  const className = code.properties.className;
  return Array.isArray(className) && className.includes(EMBED_LANGUAGE_CLASS);
}

function getBlockText(pre: Element): string {
  const code = findCodeChild(pre);
  if (!code) {
    return '';
  }
  return code.children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('')
    .trim();
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

function extractYouTubeId(url: URL): string | null {
  if (!YOUTUBE_HOSTS.has(url.hostname)) {
    return null;
  }
  if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1) || null;
  }
  if (url.pathname === '/watch') {
    return url.searchParams.get('v');
  }
  const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
  return match ? match[1] : null;
}

function buildYouTubeEmbed(videoId: string): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['embed-youtube'] },
    children: [
      {
        type: 'element',
        tagName: 'iframe',
        properties: {
          src: `https://www.youtube.com/embed/${videoId}`,
          title: 'YouTube video player',
          loading: 'lazy',
          referrerPolicy: 'strict-origin-when-cross-origin',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
        },
        children: [],
      },
    ],
  };
}

function buildLinkCard(data: LinkCardData): Element {
  const bodyChildren: Element[] = [
    {
      type: 'element',
      tagName: 'span',
      properties: { className: ['embed-link-card-title'] },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['embed-link-card-title-text'] },
          children: [{ type: 'text', value: data.title }],
        },
      ],
    },
  ];

  if (data.description) {
    bodyChildren.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['embed-link-card-description'] },
      children: [{ type: 'text', value: data.description }],
    });
  }

  bodyChildren.push({
    type: 'element',
    tagName: 'span',
    properties: { className: ['embed-link-card-site'] },
    children: [{ type: 'text', value: data.url }],
  });

  const children: Element[] = [];
  if (data.image) {
    children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['embed-link-card-image'] },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['embed-link-card-image-frame'] },
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { src: data.image, alt: '', loading: 'lazy' },
              children: [],
            },
          ],
        },
      ],
    });
  }
  children.push({
    type: 'element',
    tagName: 'span',
    properties: { className: ['embed-link-card-body'] },
    children: bodyChildren,
  });

  return {
    type: 'element',
    tagName: 'a',
    properties: {
      href: data.url,
      className: ['embed-link-card'],
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    },
    children,
  };
}

const rehypeEmbed: Plugin<[], Root> = () => async (tree) => {
  const targets: { node: Element; index: number; siblings: RootContent[] }[] = [];

  visit(tree, 'element', (node, index, parent) => {
    if (parent && typeof index === 'number' && isEmbedBlock(node)) {
      targets.push({ node, index, siblings: parent.children });
    }
  });

  for (const { node, index, siblings } of targets) {
    const raw = getBlockText(node);

    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      // 不正なURLはコードブロックのまま残す
      continue;
    }

    const youtubeId = extractYouTubeId(url);
    const replacement = youtubeId ? buildYouTubeEmbed(youtubeId) : buildLinkCard(await getLinkCard(url.href));

    siblings[index] = replacement;
  }
};

export default rehypeEmbed;
