// set:htmlで<script>に埋め込むため、タイトル等に含まれる</script>や<!--でタグが閉じないよう<をエスケープする
// <はJSONの文字列エスケープなので、検索エンジンが読む値は元のまま変わらない
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
