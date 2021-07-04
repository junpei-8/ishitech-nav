import React, { useEffect, useState } from 'react';
import './SearchField.scss';

import { useHistory } from 'react-router';
import { createUrlSearchParams, punctuationReplacer, spaceReplacer } from '../../common';
// import { searchToken, SearchToken } from '../../di/search-token';

// const SEARCH_TOKEN_PARAMS = ['keyword', 'job', 'area'];
type OnChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface InputtedSearchToken {
  keyword: string,
  job: string,
  area: string
}

function SearchField() {
  const [inputtedSearchToken, setSearchToken] =
    useState<InputtedSearchToken>({
      keyword: '',
      job: '',
      area: ''
    });


  const reactHistory = useHistory();
  useEffect(() => {
    setSearchToken({
      ...inputtedSearchToken,
      ...createUrlSearchParams(reactHistory.location.search) as any
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChangeInputValue = (event: OnChangeEvent, key: keyof InputtedSearchToken) => {
    const value = event.target.value;
    setSearchToken({...inputtedSearchToken, [key]: value });
  }

  const search = () => {
    const token = inputtedSearchToken;

    let query = '';
    // Object.keys(token).forEach(key => { ... })
    (Object.keys(token) as (keyof InputtedSearchToken)[]).forEach((key) => {
      const param = token[key];
      if (param) {
        query = `${query}&${key}=${spaceReplacer(punctuationReplacer(param))}`;
      }
    });

    // 先頭の`&`を取り除く => 記号を半角スペースへ変換 => 両端のスペースを削除し、連続したスペースと全角スペースを半角スペースへ変換する
    query = query.slice(1).replace(/ /g, '+');
    reactHistory.push('/search?' + query);
  }

  return (
    <div className="Search-field">
      <h1 className="Search-field-title">あなたの『働きたい』がきっと見つかる</h1>
      <div className="Search-field-input-field">
        <input
          className="Search-field-input" type="text"  name="keyword" 
          value={inputtedSearchToken.keyword}
          onChange={event => onChangeInputValue(event, 'keyword')}
          placeholder="キーワード（会社名 など）"
        />
          <span className="Search-field-input-divider"></span>
        <input
          className="Search-field-input" type="text" name="job"
          value={inputtedSearchToken.job}
          onChange={event => onChangeInputValue(event, 'job')}
          placeholder="職種（電気工事 など）"
        />
          <span className="Search-field-input-divider"></span>
        <input
          className="Search-field-input" type="text" name="area"
          value={inputtedSearchToken.area}
          onChange={event => onChangeInputValue(event, 'area')}
          placeholder="地域"
        />

        <button className="Search-field-search-button" onClick={search}>
          <svg className="Search-field-search-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </button>
      </div>
    </div>
  )
}

export default SearchField;
