/**
 * #### カナ→かな変換
 * @param str 変換したいカタカナ
 * @returns ひらがな文字列
 * */
export const ToHiragana = (str: string): string =>
  str.replace(/[\u30a1-\u30f6]/g, (match: string): string => String.fromCharCode(match.charCodeAt(0) - 0x60));
