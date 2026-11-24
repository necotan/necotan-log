/**
 * ダイアログ以外のページ全体を inert にし、Tab や支援技術がダイアログの裏へ抜けないようにする。
 * ダイアログを開いた直後に呼び、閉じるときに戻り値の関数を呼んで元に戻すこと。
 * フォーカスの移動と復帰はダイアログごとに戻し先が違うため、呼び出し側で行う。
 */
export function inertOutside(dialog: HTMLElement): () => void {
  const inertElements: HTMLElement[] = [];
  // ダイアログ自身の祖先を inert にすると中身ごと操作できなくなるため、祖先の兄弟だけに付ける
  let node: HTMLElement = dialog;
  while (node.parentElement && node !== document.body) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      sibling.inert = true;
      inertElements.push(sibling);
    }
    node = node.parentElement;
  }

  return () => {
    inertElements.forEach((element) => {
      element.inert = false;
    });
  };
}
