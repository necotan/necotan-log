import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// カメラが付ける連番のファイル名 (DSCF9935、IMG_9040、DSC01234、_DSC0123 など)
const CAMERA_FILE_NAME = /^_?[A-Za-z]{2,5}[_-]?\d{3,6}$/;

// 記事タイトルがh1のため、本文はh2から始める
const TITLE_HEADING_LEVEL = 1;

// 記事の書き方の誤りをビルドエラーにする
const rehypeArticleCheck: Plugin<[], Root> = () => (tree, file) => {
  let previousLevel = TITLE_HEADING_LEVEL;

  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'img') {
      const alt = String(node.properties.alt ?? '').trim();
      // ファイル名のaltはスクリーンリーダーがそのまま読み上げるため、空のaltより悪い
      if (CAMERA_FILE_NAME.test(alt)) {
        file.fail(`画像の alt がファイル名 (${alt}) です。空にするか、写真の説明を書いてください`, node);
      }
      return;
    }

    const level = /^h([1-6])$/.exec(node.tagName)?.[1];
    if (!level) {
      return;
    }
    const currentLevel = Number(level);
    if (currentLevel > previousLevel + 1) {
      file.fail(`見出しレベルが h${previousLevel} から h${currentLevel} に飛んでいます`, node);
    }
    previousLevel = currentLevel;
  });
};

export default rehypeArticleCheck;
