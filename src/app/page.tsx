"use client";
import CheckIcon from "@mui/icons-material/Check";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CloseIcon from "@mui/icons-material/Close";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { Zukan, zukanList } from "@/datas/zukan-list";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stringify } from "querystring";
import { extractMotimonoInfoFromPokemon, Motimono, PDet } from "@/func/functions";
import { appendSonotaIfNeed, calculateRoughRateFromPdetList } from "@/func/functions-calc";
import { itemList } from "@/datas/motimono-list";
import { ButtonGroup, Icon, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Button } from "@mui/base";
import { ToHiragana } from "@/utils/Converter";
import { isSamePokemonSZandZ, isSamePokemonPDandZ, isSameSearchKey } from "@/utils/Util";
/**
 * #### 検索キー情報型
 * - シーズンキーとUNIX時間
 * - これをAPIに投げるとランキング情報を取得できる
 */
export type searchKeyType = { cId: string; unixTime: string };

/**
 * #### APIから取得したランキングの取得データ用の型
 * - 図鑑番号と姿だけを持つ最低限の型
 */
export type SmallZukan = { id: number; sugata: number };

/**
 *  #### ステート制御用の型定義
 * - 初期状態="DEFAULT" 要検索処理="SHOULD_CALCULATE" 検索完了="CALCULATED"の区分値文字列
 */
type calculateStatus = "DEFAULT" | "SHOULD_CALCULATE" | "CALCULATED";

const Page = () => {
  const [latestSingleKeys, setLatestSingleKeys] = useState<searchKeyType>(
    typeof window !== "undefined" && localStorage.getItem("single-keys")
      ? (JSON.parse(localStorage.getItem("single-keys") ?? "") as searchKeyType)
      : { cId: "0", unixTime: "9999" }
  );
  const [singlePdetailList, setSinglePdetailList] = useState<PDet[]>(
    typeof window !== "undefined" && localStorage.getItem("single-pdetail-list")
      ? (JSON.parse(localStorage.getItem("single-pdetail-list") ?? "") as PDet[])
      : []
  );

  const [singleUsedRankingList, setSingleUsedRankingList] = useState<SmallZukan[]>(
    typeof window !== "undefined" && localStorage.getItem("single-used-ranking-list")
      ? (JSON.parse(localStorage.getItem("single-used-ranking-list") ?? "") as SmallZukan[])
      : []
  );

  // const [latestDoubleKeys, setLatestDoubleKeys] = useState<searchKeyType>(
  //   typeof window !== "undefined" && localStorage.getItem("double-keys")
  //     ? (JSON.parse(localStorage.getItem("double-keys") ?? "") as searchKeyType)
  //     : { cId: "0", unixTime: "9999" }
  // );
  // const [doublePdetailList, setDoublePdetailList] = useState<PDet[]>(
  //   typeof window !== "undefined" && localStorage.getItem("double-pdetail-list")
  //     ? (JSON.parse(localStorage.getItem("double-pdetail-list") ?? "") as PDet[])
  //     : []
  // );

  /**
   * #### なんこれ
   * - 初期状態="DEFAULT" 要検索処理="SHOULD_CALCULATE" 検索完了="CALCULATED"の区分値文字列
   * - HACK:FIXME:検索処理の制御のために仕方なく書いてるが、多分ダサい
   */
  const [calculatedStatus, setCalculatedStatus] = useState<calculateStatus>("DEFAULT");

  const [selectedPDetailList, setSelectedPDetailList] = useState<(PDet | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  /**
   * #### 全ての図鑑から取得できたデータを表示するようにフィルターを掛けている？
   */
  const filteredSingleZukanList = useMemo(
    () =>
      zukanList
        .filter((zukan: Zukan) =>
          singlePdetailList.some((pdet: PDet) => isSamePokemonPDandZ(pdet, zukan) && pdet.motimonoList.length > 0)
        )
        .sort((first, second) => {
          const firstRank: number =
            singleUsedRankingList.findIndex((x) => isSamePokemonSZandZ(x, first)) ?? first.id + 10000;

          const secondRank: number =
            singleUsedRankingList.findIndex((x) => isSamePokemonSZandZ(x, second)) ?? second.id + 10000;

          const firstValue = firstRank !== -1 ? firstRank : parseInt(first.id) + 10000;
          const secondValue = secondRank !== -1 ? secondRank : parseInt(second.id) + 10000;

          return firstValue - secondValue;

          // if (firstValue > secondValue) {
          //   return 1;
          // } else if (firstValue < secondValue) {
          //   return -1;
          // } else {
          //   return 0;
          // }
        }),
    [singlePdetailList, singleUsedRankingList]
  );

  console.log(filteredSingleZukanList);

  // /**
  //  * #### カナ→かな変換
  //  * @param str 変換したいカタカナ
  //  * @returns ひらがな文字列  */
  // const ToHiragana = (str: string): string =>
  //   str.replace(/[\u30a1-\u30f6]/g, (match: string): string => String.fromCharCode(match.charCodeAt(0) - 0x60));

  /**
   * #### 最新の検索用キー取得
   */
  const getKey = useCallback(async () => {
    console.log("getKey Is Called");

    await axios
      .get("https://any-rating.com/api/getkey/")
      .then((response) => {
        console.log("getKey THEN");
        console.log(response.data);
        const dataList = Object.keys(response.data.list).map((key) => response.data.list[key]);

        const seasonInfo = dataList.slice(-1)[0];
        const singleInfo: [string, any] = Object.entries(seasonInfo).find((key) => seasonInfo[key[0]].rule === 0)!;

        const newSingleKeys: searchKeyType = { cId: singleInfo[0], unixTime: String(singleInfo[1].ts2) };

        // localStrageへの保持と,State更新

        if (isSameSearchKey(latestSingleKeys, newSingleKeys) && singlePdetailList.length !== 0) {
          // 現在のキーと完全一致していれば何もしない;
          console.log("現在のキーと完全一致しているので何もしない");
          return;
        }

        console.log("キーが異なっていたのでセット");

        localStorage.setItem("single-keys", JSON.stringify(newSingleKeys));
        setLatestSingleKeys(newSingleKeys);
      })
      .catch((x) => {
        console.log(x);
      });

    console.log("geKey End");
  }, [latestSingleKeys, singlePdetailList]);

  useEffect(() => {
    console.log("副作用関数が実行されました！-");

    getKey();
    console.log("^-^");
  }, []);

  /**
   * #### details取得
   */
  const getPDetails = useCallback(async (singleCId: string, SingleUnixTime: string) => {
    console.log("getKey Is Called");

    await axios
      .get(`https://any-rating.com/api/getpdetails/?cid=${singleCId}&ut=${SingleUnixTime}`)
      .then((response) => {
        console.log("getKey THEN");
        console.log(response.data);

        const pugeraXXXX: string[] = response.data.split("|||");

        let pugeraJSonPersed: any[] = [];

        pugeraXXXX.forEach((x) => {
          pugeraJSonPersed.push(...Object.entries(JSON.parse(x)));
        });

        const singleMotimonoNEW: PDet[] = pugeraJSonPersed
          .flatMap((x) => extractMotimonoInfoFromPokemon(x[1], x[0]))
          .map((pDet) => appendSonotaIfNeed(pDet));

        console.log("===============================================");
        console.log(JSON.stringify(singleMotimonoNEW));
        console.log("===============================================");

        localStorage.setItem("single-pdetail-list", JSON.stringify(singleMotimonoNEW));
        setSinglePdetailList((_prev) => singleMotimonoNEW);
      })
      .catch((x) => {
        console.log(x);
      });

    await axios
      .get(`https://any-rating.com/api/getusedranking/?cid=${singleCId}&ut=${SingleUnixTime}&x=12345`)
      .then((response) => {
        console.log("getKey THEN");
        console.log(response.data);

        const pugeraXXXX: SmallZukan[] = response.data.map((x: any): SmallZukan => ({ id: x.id, sugata: x.form }));

        localStorage.setItem("single-used-ranking-list", JSON.stringify(pugeraXXXX));
        setSingleUsedRankingList((_prev) => pugeraXXXX);
      })
      .catch((x) => {
        console.log(x);
      });

    console.log("geKey End");
  }, []);

  useEffect(() => {
    console.log("キー変わった実行されました！-");

    console.log("^-^");

    if (latestSingleKeys.cId && latestSingleKeys.unixTime) {
      getPDetails(latestSingleKeys.cId, latestSingleKeys.unixTime);
    }

    // ※各ルールの検索用のキーが拾える！！
    console.log("キー変わった！");
  }, [latestSingleKeys.cId, latestSingleKeys.unixTime]);

  // const makeLabelFromZukanList = () => {
  //   return zukanList.map((x) => {
  //     return { label: x.name, value: x.id, sugata: x.sugata };
  //   });
  // };

  useEffect(() => {
    // if (selectedPDetailList.some((x) => x === undefined)) {
    if (selectedPDetailList.includes(undefined)) {
      console.log("全指定してないので計算しない");
      return;
    }
    if (calculatedStatus === "CALCULATED") {
      console.log("計算済なので計算しない");
      return;
    }
    console.log("計算します");

    const newCalculatedList = calculateRoughRateFromPdetList(selectedPDetailList as PDet[]);

    // setSelectedPDetailList((prev)=>calculateRoughRateFromPdetList(prev))
    setSelectedPDetailList(newCalculatedList);
    setCalculatedStatus("CALCULATED");
  }, [calculatedStatus, selectedPDetailList]);

  /**
   * #### AutoComplete入力値変更時イベント
   * @param x
   * @param newValue
   * @param index
   */
  const autocompleteChange = (x: React.SyntheticEvent<Element, Event>, newValue: Zukan | null, index: number) => {
    console.log("<<<autocompleteChange>>>");

    const newData = structuredClone(selectedPDetailList);
    newData[index] = getPDetByZukan(newValue) ?? undefined;
    setSelectedPDetailList(newData);
  };

  /**
   * #### 持ち物のラジオボタンを押下した時のイベント
   *
   * @param event
   * @param value 変更した値、変更前と同じ場合はnullが来るのでガード
   * @param pDet
   * @param moti
   * @returns
   */
  const changeMotimonoRadio = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    value: boolean | "UNKNOWN" | null,
    pDet: PDet,
    moti: Motimono
  ) => {
    // 値がnull(=変更なし)なら何もしない
    if (value === null) {
      return;
    }

    // 今のデータをコピー
    const newData = structuredClone(selectedPDetailList);

    // コピーしたデータの中から今叩いたポケモン（の、アイテム一覧）を特定
    const updateTargetMotimonoList = newData.find(
      (x) => x?.pokemonIdx === pDet.pokemonIdx && x?.sugataIdx === pDet.sugataIdx
    )!.motimonoList;

    if (value === true) {
      // true選択時
      // ￣￣￣￣￣￣￣
      // 該当項目をTrueにして、他の値はすべてFalseにする
      updateTargetMotimonoList.forEach((x) => {
        x.id === moti.id ? (x.hasThis = true) : (x.hasThis = false);
      });

      if (moti.id !== 9999) {
        // その他「以外」のアイテムをTrueにした場合は、
        // さらに、他のポケモンの同じ持ち物は確定でFalseになる
        newData
          .filter((x) => !(x?.pokemonIdx === pDet.pokemonIdx && x?.sugataIdx === pDet.sugataIdx))
          .forEach((x) => {
            // ちがうポケモンの同一アイテムを特定
            const sameMotimonoOfOtherPokemon = x?.motimonoList.find((x) => x.id === moti.id);
            if (sameMotimonoOfOtherPokemon) {
              sameMotimonoOfOtherPokemon.hasThis = false;
            }
          });
      }
    } else {
      // false,UNKNOWN選択時
      // ￣￣￣￣￣￣￣￣￣￣￣
      // それ以外(false,UNKNOWN)を選択した場合は該当項目をその値にして、他の値は触らない
      updateTargetMotimonoList.forEach((x) => (x.id === moti.id ? (x.hasThis = value) : undefined));
    }

    setSelectedPDetailList(newData);
    setCalculatedStatus("SHOULD_CALCULATE");

    // console.log(a.target);
  };

  const getPDetByZukan = (zukan: Zukan | null): PDet | undefined => {
    if (zukan === null) {
      return undefined;
    }
    return singlePdetailList.find(
      (pdet) => pdet.pokemonIdx === parseInt(zukan.id) && pdet.sugataIdx === parseInt(zukan.sugata ?? "0")
    );
  };
  const getKeyFromName = (pokeName: string): string => {
    const target = filteredSingleZukanList.find((x) => x.name === pokeName);

    return target ? `${target.id}_f${target.sugata ?? "00"}` : "";
  };

  const getMotimonoFromId = (id: number) => itemList.find((item) => item.id == id);

  /**
   * #### 選択項目用のフィルタ
   * - 名前、ひらがな名前、英語名に対応*/
  const filterOptions = createFilterOptions({
    stringify: (option: Zukan) =>
      option.name + ToHiragana(option.name) + option.en + option.type1 + option.type2 + option.type1,
  });

  return (
    <>
      {/* {selectedPokemonList.map((x) => {
        return x?.name ?? "aaa";
      })}
      <ToggleButtonGroup exclusive>
        <Button>aa</Button>
        <Button>ss</Button>
        <Button>dd</Button>
      </ToggleButtonGroup> */}

      {selectedPDetailList.map((pDet, idx) => {
        return (
          <Paper sx={{ padding: 1, margin: 1 }} variant="outlined" key={idx}>
            <Autocomplete
              size="small"
              // ここの??optionいる？
              getOptionLabel={(option) => option.name ?? option}
              disablePortal
              id="combo-box-demo"
              // options={makeLabelFromZukanList()}
              options={filteredSingleZukanList}
              filterOptions={filterOptions}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // □■□■□■□■
                  label={`${idx + 1}匹目`}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: params.inputProps.value !== "" && (
                      <InputAdornment position="start" disableTypography={true}>
                        {/* TODO：選択したポケモンに対応した画像を取得する */}
                        <img
                          alt=""
                          src={`/pokemon/icon${getKeyFromName(params.inputProps.value as string)}_s0.png`}
                          style={{ height: 35 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={`${option.id}-{${option.sugata ?? "00"}}`}>
                    {/* TODO：対応した画像を取得する */}

                    <img
                      alt=""
                      src={`/pokemon/icon${option.id}_f${option.sugata ?? "00"}_s0.png`}
                      style={{ height: 35 }}
                      key={`${option.id}-{${option.sugata ?? "00"}}`}
                    />
                    {option.name}
                  </li>
                );
              }}
              // □■□■□■□■
              onChange={(x, newValue) => autocompleteChange(x, newValue, idx)}
              // onSelect={(y) => autocompleteSelect(y)}
            />
            <div>
              {/* □■□■□■□■ */}
              {pDet?.motimonoList.map((moti) => {
                const tgtMotimono = getMotimonoFromId(moti.id);
                return (
                  <Paper key={moti.id}>
                    [{tgtMotimono?.name} - {moti.val} - {moti.caluculatedVal ?? "未"}]
                    {/* <ToggleButtonGroup value={moti.hasThis} exclusive size="small" onChange={hoge}> */}
                    <ToggleButtonGroup
                      value={moti.hasThis}
                      exclusive
                      size="small"
                      onChange={(event, value) => changeMotimonoRadio(event, value, pDet, moti)}
                    >
                      <ToggleButton color="success" value={true} size="small">
                        <CheckIcon color="success" fontSize="inherit" />
                      </ToggleButton>
                      <ToggleButton color="info" value="UNKNOWN" size="small">
                        <QuestionMarkIcon color="info" fontSize="inherit" />
                      </ToggleButton>
                      <ToggleButton color="error" value={false} size="small">
                        <CloseIcon color="error" fontSize="inherit" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Paper>
                );
              })}
            </div>
          </Paper>
        );
      })}
    </>
  );
};

export default Page;
