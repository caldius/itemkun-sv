// import { PDet } from "./calc.js";
// import { appendSonotaIfNeed } from "./functions-calc.js";

import { appendSonotaIfNeed } from "./functions-calc";

/**
 * #### 持ち物型
 */
export type Motimono = { id: number; val: number; hasThis: boolean | "UNKNOWN"; caluculatedVal: number | undefined };

/**
 * #### ポケモン情報型
 */
export type PDet = { pokemonIdx: number; sugataIdx: number; motimonoList: Motimono[] };

/**
 * #### ポケモン情報型（アイテム1つ
 */
export type PDet1 = { pokemonIdx: number; sugataIdx: number; motimono: Motimono };

/**
 * #### パターン型　1PT分（基本は６件）のPDet1と、それが発生する件数を持つ
 */
export type Pattern = { PDet1List: PDet1[]; existCount?: number };

/**
 * #### 結果パターン型　種族、姿、持ち物、確率（全てのあり得るパターン中のこのパターンがあり得る確率）
 */
export type ResultPattern = { pokemonIdx: number; sugataIdx: number; motimono: Motimono; percentage: number };

/**
 * #### １匹分の結果パターン（持ち物ごとの保持率）を持つ
 */
export type ResultPatternByPoke = { resultPatternList: ResultPattern[] };

/**
 * なんこれ
 * @param chunk
 * @returns
 */
export const extractMotimonoInfoFromPDetailChunk = (chunk: any) => {
  return Object.keys(chunk)
    .flatMap((pokemonIdx) => extractMotimonoInfoFromPokemon(chunk[pokemonIdx], pokemonIdx))
    .map((pDet) => appendSonotaIfNeed(pDet));
  // return Object.keys(chunk).flatMap((pokemonIdx) => extractMotimonoInfoFromPokemon(chunk[pokemonIdx], pokemonIdx));XX
};

/**
 * なんこれ
 * @param pokemon
 * @param pokemonIdx
 * @returns
 */
export const extractMotimonoInfoFromPokemon = (pokemon: any, pokemonIdx: string): PDet[] => {
  // return Object.keys(pokemon).flatMap((sugataIdx) => {
  return Object.keys(pokemon).map((sugataIdx) => {
    return {
      pokemonIdx: parseInt(pokemonIdx),
      sugataIdx: parseInt(sugataIdx),
      motimonoList: pokemon[sugataIdx].temoti.motimono.map((moti: any): Motimono => {
        return {
          id: parseInt(moti.id),
          val: parseInt(moti.val.replace(".", "")),
          hasThis: "UNKNOWN",
          caluculatedVal: undefined,
        };
      }),
      // val: parseInt(pokemon[sugataIdx].temoti.motimono.val.replace(".", "")),
    };
  });
};
