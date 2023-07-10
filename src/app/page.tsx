"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { Zukan, zukanList } from "@/datas/zukan-list";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const Page = () => {
  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const hoge: Zukan[] = zukanList;

  const zukanMenuList = (): React.JSX.Element[] =>
    zukanList.map((zukan) => (
      <MenuItem key={zukan.id} value={zukan.id}>
        {zukan.name}
      </MenuItem>
    ));

  const zukanMenuListOPTION = (): React.JSX.Element[] =>
    zukanList.map((zukan) => (
      <option key={zukan.id} value={zukan.id}>
        {zukan.name}
      </option>
    ));

  const makeLabelFromZukanList = () => {
    return zukanList.map((x) => {
      return { label: x.name, value: x.id };
    });
  };

  const autocompleteChange = (
    x: React.SyntheticEvent<Element, Event>,
    newValue: { label: string; value: string } | null
  ) => {
    console.log("<<<autocompleteChange>>>");
    console.log(x);
    console.log(newValue);
  };

  const autocompleteSelect = (x: React.SyntheticEvent<HTMLDivElement, Event>) => {
    // console.log("`<<<autocompleteSelect>>>`");
    // console.log(x.target);
  };

  return (
    <>
      <FormControl size="small">
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Age"
          onChange={handleChange}
        >
          {zukanMenuList()}
        </Select>
      </FormControl>

      {/* ネイティブ↓↓ */}
      <FormControl size="small">
        <Select native value={age} onChange={handleChange}>
          {zukanMenuListOPTION()}
        </Select>
      </FormControl>

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={makeLabelFromZukanList()}
        sx={{ width: 300 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="１匹目XX"
            InputProps={{
              ...params.InputProps,
              startAdornment: params.inputProps.value !== "" && (
                <>
                  {console.log(typeof params.inputProps.value)}
                  {console.log("~~~~~~~~~")}
                  {console.log(params.inputProps.value)}
                  {console.log("----------")}
                  {console.log(params)}
                  {console.log("----------")}

                  <InputAdornment position="start" disableTypography={true}>
                    {/* TODO：対応した画像を取得する */}
                    <img alt="" src={`/pokemon/icon${params.inputProps.value}_f00_s0.png`} />
                  </InputAdornment>
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {/* TODO：対応した画像を取得する */}

            <InputAdornment position="start" disableTypography={true}>
              <img alt="" src={`/pokemon/icon${option.value}_f00_s0.png`} style={{ height: 35 }} />
            </InputAdornment>
            {option.label}
          </li>
        )}
        onChange={(x, newValue) => autocompleteChange(x, newValue)}
        onSelect={(y) => autocompleteSelect(y)}
      />
    </>
  );
};

export default Page;
