import type { Element, Root, RootContent } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

function isImgElement(node: RootContent): node is Element {
  return node.type === 'element' && node.tagName === 'img';
}

function isWhitespaceText(node: RootContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

// 2枚の画像を縦写真ペアとして扱いたいとき、Markdownのtitle記法で ![alt](url "vertical") のように付与する
const PORTRAIT_MARKER = 'vertical';

function hasPortraitMarker(node: Element): boolean {
  return node.properties.title === PORTRAIT_MARKER;
}

function stripPortraitMarker(node: Element): void {
  if (node.properties.title === PORTRAIT_MARKER) {
    delete node.properties.title;
  }
}

// PORTRAIT_MARKER付き画像がちょうど2枚の<p>だけimage-gridにまとめる (title属性はツールチップ化を防ぐため出力前に除去する)
const rehypeImageGrid: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'p') {
      return;
    }

    const isImagesOnly = node.children.every((child) => isImgElement(child) || isWhitespaceText(child));
    const images = node.children.filter(isImgElement);

    if (!isImagesOnly) {
      return;
    }

    const isPortraitPair = images.length === 2 && images.every(hasPortraitMarker);
    images.forEach(stripPortraitMarker);

    if (!isPortraitPair) {
      return;
    }

    node.tagName = 'div';
    node.properties = {
      ...node.properties,
      className: ['image-grid'],
    };
    node.children = images;
  });
};

export default rehypeImageGrid;
