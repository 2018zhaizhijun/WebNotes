import { Input } from "antd";
import { SearchProps } from "antd/es/input/Search";
import React, { useCallback, useEffect, useState } from "react";

const { Search } = Input;

interface SearchCompProps {}

const SearchComp: React.FC<SearchCompProps> = () => {
  const onSearch: SearchProps["onSearch"] = useCallback((value, _e, info) => {
    console.log(info?.source, value);
  }, []);

  return (
    <>
      <Search
        placeholder="user / url / keywords"
        onSearch={onSearch}
        style={{ width: 200 }}
      />
    </>
  );
};

export default SearchComp;
