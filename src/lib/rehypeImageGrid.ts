import type { Element, Root, RootContent } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

function isImgElement(node: RootContent): node is Element {
  return node.type === 'element' && node.tagName === 'img';
}

function isWhitespaceText(node: RootContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

/**
 * 画像だけで構成された<p>を検出し、画像が2枚以上あれば、<div class="image-grid">にまとめてミニグリッド表示にする
 * Astro内部のrehypeImagesは<img>のtagNameを保ったままpropertiesだけ、差し替えるため、tagNameで判定するこの処理はプラグインの実行順に関係なく機能する
 */
const rehypeImageGrid: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'p') {
      return;
    }

    const isImagesOnly = node.children.every((child) => isImgElement(child) || isWhitespaceText(child));
    const images = node.children.filter(isImgElement);

    if (!isImagesOnly || images.length < 2) {
      return;
    }

    node.tagName = 'div';
    node.properties = {
      ...node.properties,
      className: ['image-grid'],
      dataCount: images.length,
    };
    node.children = images;
  });
};

export default rehypeImageGrid;
