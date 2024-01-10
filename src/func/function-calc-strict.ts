// import { PDet1, Pattern, ResultPattern, ResultPatternByPoke } from "./calc";
import { isMatch, isValidPattern } from "./functions-calc.js";
import { Pattern, PDet1, ResultPattern, ResultPatternByPoke } from "./functions.js";

/**
 * ※Strict Only
 * #### Calculates "Cartesian Product" sets.
 * - パフォーマンスの都合上手続き的記述
 * @param args
 * @returns
 */
export const cartesianProductProdedual = <T>(...args: T[][]) => {
  const r: T[][] = [];
  const max = args.length - 1;
  const helper = (arr: T[], i: number) => {
    for (let j = 0, l = args[i].length; j < l; j++) {
      const a = arr.slice(0); // clone arr
      a.push(args[i][j]);
      if (i == max) r.push(a);
      else helper(a, i + 1);
    }
  };
  helper([], 0);
  return r;
};

/**
 * ※Strict Only
 * #### 選択したポケモンをまとめたPDet1リストを出現数undefinedのPattern型に変換する
 * @param pDet1List
 * @returns
 */
export const toPatternWithoutCount = (pDet1List: PDet1[]): Pattern => {
  return { PDet1List: [...pDet1List], existCount: undefined };
};

/**
 * ※Strict Only
 * #### すべての出現パターンを受け取り、
 * - 組み合わせ上妥当なものだけに絞り込み,
 * - 各持ち物の確率をかけあわせて出現数を設定して返却
 * @param allPatternList
 * @returns
 */
export const getAllPossiblePatternList = (allPatternList: Pattern[]): Pattern[] =>
  allPatternList
    .filter((pattern) => isValidPattern(pattern))
    .map((pattern): Pattern => ({ ...pattern, existCount: calcExistCount(pattern) }));

/**
 * ※Strict Only
 * #### Patternを受け取り、各持ち物の確率の積を返す
 * @param pattern
 * @returns
 */
const calcExistCount = (pattern: Pattern) => pattern.PDet1List.reduce((sum3, hoge) => sum3 * hoge.motimono.val, 1);

/**
 * ※Strict Only
 * #### すべての出現パターンに出現数をかけあわせて合算した合計数を返す
 * - すごい数字になるので、状況によっては重いのでおそらくStrictは廃止する。。。。
 * @param patternList
 * @returns
 */
export const getAllPossiblePatternCount = (patternList: Pattern[]) =>
  patternList.reduce((product, pattern) => {
    const crntPatternMotiValues = pattern.PDet1List.map((poke) => poke.motimono.val);
    return product + crntPatternMotiValues.reduce((sum2, x) => sum2 * x);
  }, 0);

/**
 * ※Strict Only
 * #### 最終的な持ち物ごとの出現確率を返す
 * - 重いのでおそらくStrictは廃止する。。。。
 * @param tgtPokemonFlatList
 * @param allPossiblePatternList
 * @param allPossiblePatternCount
 * @returns
 */
export const getResultPatternList = (
  tgtPokemonFlatList: PDet1[][],
  allPossiblePatternList: Pattern[],
  allPossiblePatternCount: number
): ResultPatternByPoke[] =>
  tgtPokemonFlatList.map(
    (poke): ResultPatternByPoke => ({
      resultPatternList: poke.map(
        (pokeMoti): ResultPattern => ({
          ...pokeMoti,
          percentage: parseFloat(
            ((getCurrentExistCount(allPossiblePatternList, pokeMoti) * 100) / allPossiblePatternCount).toFixed(2)
          ),
        })
      ),
    })
  );

/**
 *
 * @param allPossiblePatternList
 * @param pokeMoti
 * @returns
 */
const getCurrentExistCount = (allPossiblePatternList: Pattern[], pokeMoti: PDet1) =>
  allPossiblePatternList
    .filter((pattern) => pattern.PDet1List.some((m) => isMatch(m, pokeMoti)))
    .reduce((sum4, mm) => sum4 + (mm.existCount ?? 0), 0);
