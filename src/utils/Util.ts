import { searchKeyType, SmallZukan } from "@/app/page";
import { Zukan } from "@/datas/zukan-list";
import { PDet } from "@/func/functions";

/**
 * #### なんこれ
 */
export const isSameSearchKey = (left: searchKeyType, right: searchKeyType): boolean =>
  left.cId === right.cId && left.unixTime === right.unixTime;

/**
 * #### なんこれ
 * - leftがPDet型,rightがZukan型に固定されているのは技術不足によるもの
 * @param left
 * @param right
 */
export const isSamePokemonPDandZ = (left: PDet, right: Zukan): boolean =>
  left.pokemonIdx === parseInt(right.id) && left.sugataIdx === parseInt(right.sugata ?? "0");

/**
 * #### なんこれ
 * @param sZukan
 * @param zukan
 * @returns
 */
export const isSamePokemonSZandZ = (sZukan: SmallZukan, zukan: Zukan): boolean =>
  sZukan.id === Number(zukan.id) && sZukan.sugata === Number(zukan.sugata ?? "00");
