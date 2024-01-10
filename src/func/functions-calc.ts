// import { PDet, PDet1, Pattern, ResultPattern, ResultPatternByPoke } from ;

import { Pattern, PDet, PDet1, ResultPattern, ResultPatternByPoke } from "./functions";

/**
 * #### 図鑑番号の配列を受け取り、各情報を返す
 * //TODO:姿対応　　とくに、ウーラオス、パンプジン等選出時わからんやつ対応
 * @param tgtIdList
 * @param pDetList
 * @returns
 */
export const getPDetailListFromTgtIdList = (tgtIdList: number[], pDetList: PDet[]): PDet[] =>
  tgtIdList.map((id) => pDetList.find((x) => x.pokemonIdx === id)!);

/**
 * #### 持ち物が10個ある場合に、持ち物「その他」を追加する
 * - 他の持ち物の確率を引いた残りの値を確率に設定、最低値1(0.1%)
 * @param x
 * @returns
 */
export const appendSonotaIfNeed = (x: PDet): PDet => {
  // 持ち物IDが10件無いやつは他のアイテムを持っていないのでそのまま返す
  if (x.motimonoList.length < 10) return x;

  // 持ち物ID9999があるやつは既に追加済みなのでそのまま返す（念のため）
  if (x.motimonoList.some((x) => x.id === 9999)) return x;

  const sonotaValue = x.motimonoList.reduce((left, x) => left - x.val, 1000);
  return {
    pokemonIdx: x.pokemonIdx,
    sugataIdx: x.sugataIdx,
    motimonoList: [
      ...x.motimonoList,
      { id: 9999, val: sonotaValue > 0 ? sonotaValue : 1, hasThis: "UNKNOWN", caluculatedVal: undefined },
    ],
  };
};

/**
 * #### PDetリストを受け取り、持ち物一つずつ（PDet1型）の二次元配列を返す
 * - ポケモン単位でまとめられた二次元配列
 * @param tgtPokeList
 * @returns
 */
export const divideBy1Item = (tgtPokeList: PDet[]): PDet1[][] =>
  tgtPokeList.map((pDet) =>
    pDet.motimonoList.map(
      (motimono): PDet1 => ({ pokemonIdx: pDet.pokemonIdx, sugataIdx: pDet.sugataIdx, motimono: motimono })
    )
  );

/**
 * ※Rough Only
 * #### PDet1を出現数なしのPattern型に変換する
 * @param pDet1List
 * @returns
 */
const toPatternRough = (pDet1List: PDet1[]): Pattern => ({ PDet1List: [...pDet1List] });

/**
 * #### 組み合わせ上妥当なパターンのみTrueを返す
 * @param pattern
 * @returns
 */
export const isValidPattern = (pattern: Pattern) => {
  const itemList = pattern.PDet1List.map((pokemon) => pokemon.motimono.id);
  return itemList.every(
    (item) => item === 9999 || (item !== 9999 && itemList.indexOf(item) === itemList.lastIndexOf(item))
  );
};

/**
 * #### 組み合わせ上妥当なパターンのみTrueを返す
 * @param pattern
 * @returns
 */
export const isValidPatternXXXX = (pattern: Pattern): boolean =>
  // 選択した組み合わせの各ポケモンのアイテムのうち、id=9999以外で重複しているものがあれば妥当ではない
  pattern.PDet1List.map((pokemon) => pokemon.motimono.id).every(
    (itemId, _, itemList) => itemId === 9999 || itemList.indexOf(itemId) === itemList.lastIndexOf(itemId)
  );

/**
 *
 * @param x
 * @param y
 * @returns
 */
export const isMatch = (x: PDet1, y: PDet1) =>
  x.pokemonIdx === y.pokemonIdx && x.sugataIdx === y.sugataIdx && x.motimono.id === y.motimono.id;

/**
 * ※Rough Only
 * #### なんこれ
 * @param tgtPokemonFlatList
 * @param validPatternList
 * @param validCount
 * @returns
 */
export const getResultPatternListRough = (
  tgtPokemonFlatList: PDet1[][],
  validPatternList: Pattern[],
  validCount: number
): ResultPatternByPoke[] =>
  tgtPokemonFlatList.map(
    (pDet1List): ResultPatternByPoke => ({
      resultPatternList: toResultPatternList(pDet1List, validPatternList, validCount),
    })
  );

/**
 * ※Rough Only
 * #### なんこれ
 * @param tgtPokemonFlatList
 * @param validPatternList
 * @param validCount
 * @returns
 */
export const getResultPatternListRoughXXXX = (
  tgtPokemonFlatList: PDet1[][],
  validPatternList: Pattern[],
  validCount: number
): ResultPattern[] =>
  tgtPokemonFlatList
    .map((pDet1List): ResultPattern[] => toResultPatternList(pDet1List, validPatternList, validCount))
    .flat();

/**
 *
 * @param pDet1List
 * @param validPatternList
 * @param validCount
 * @returns
 */
const toResultPatternList = (pDet1List: PDet1[], validPatternList: Pattern[], validCount: number): ResultPattern[] =>
  pDet1List.map(
    (pDet1): ResultPattern => ({ ...pDet1, percentage: getPercentage(validPatternList, pDet1, validCount) })
  );

/**
 *
 * @param validPatternList
 * @param pDet1
 * @param validCount
 * @returns
 */
const getPercentage = (validPatternList: Pattern[], pDet1: PDet1, validCount: number) =>
  parseFloat(((validPatternList.filter((pattern) => isIncluded(pattern, pDet1)).length * 100) / validCount).toFixed(2));

/**
 *
 * @param pattern
 * @param pDet1
 * @returns
 */
const isIncluded = (pattern: Pattern, pDet1: PDet1) =>
  pattern.PDet1List.some((pDet1inPattern) => isMatch(pDet1inPattern, pDet1));

/**
 * ※Rough Only
 * #### 任意の数ランダムにパターンを拾ってくる
 * @param tgtPokemonFlatList
 * @param count
 * @returns
 */
export const getRandomValidPesultList = (tgtPokemonFlatList: PDet1[][], count: number) => {
  const validResult: Pattern[] = [];
  while (validResult.length < count) {
    //  ランダムに１組のパターンを取得
    const random1 = toPatternRough(tgtPokemonFlatList.map((x) => pickRandom1Ptn(x)!));
    // 妥当なら結果リストに追加
    if (isValidPattern(random1)) validResult.push(random1);
  }
  return validResult;
};

/**
 * #### ランダムに1件の組み合わせを取得
 * //TODO:こっちに妥当な組み合わせが出るまで回す処理を置くべきな気がする
 * @param poke
 * @returns
 */
const pickRandom1Ptn = (poke: PDet1[]): PDet1 | undefined => {
  // 確定している持ち物があるか確認、あればそれを返す
  const selectedPoke = poke.find((x) => x.motimono.hasThis === true);

  if (selectedPoke !== undefined) {
    return selectedPoke;
  }

  // 確定で持っていないアイテム以外を抽出しながら確率通りにアイテムを取得
  const totalWeight = poke.reduce((sum, x) => (x.motimono.hasThis !== false ? sum + x.motimono.val : sum), 0);

  const randkey = Math.random() * totalWeight;
  let s = 0;
  for (const p of poke) {
    // 確定で持っていない持ち物は無視

    if (p.motimono.hasThis === false) continue;

    s += p.motimono.val;
    if (randkey < s) return p;
  }
};

export const calculateRoughRateFromPdetList = (tgtPokeList: PDet[]): PDet[] => {
  const tgtPokemonFlatList = divideBy1Item(tgtPokeList);

  // 任意の数ランダムにパターンを拾ってくる
  const validResult: Pattern[] = getRandomValidPesultList(tgtPokemonFlatList, 100000);

  const patternByPokeAndItems: ResultPattern[] = getResultPatternListRoughXXXX(
    tgtPokemonFlatList,
    validResult,
    validResult.length
  );

  // return patternByPokeAndItems;

  const newPokeList = structuredClone(tgtPokeList);

  newPokeList.forEach((pdet) => {
    pdet.motimonoList.forEach((moti) => {
      const newValue =
        patternByPokeAndItems.find(
          (x) => x.pokemonIdx === pdet.pokemonIdx && x.sugataIdx === pdet.sugataIdx && x.motimono.id === moti.id
        )?.percentage ?? 0;

      moti.caluculatedVal = Math.round(newValue * 10);
    });
  });

  return newPokeList;
};
