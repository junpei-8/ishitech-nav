import React from 'react';
import './SearchField.scss';

import { useHistory } from 'react-router';
import { searchToken, SearchToken } from '../../di/search-token';

function SearchField() {
  const onChangeInputValue = (event: React.ChangeEvent<HTMLInputElement>, key: keyof SearchToken['inputted']) => {
    const value = event.target.value;
    searchToken.inputted[key] = value;
  }

  const reactHistory = useHistory();
  const search = () => {
    const token = searchToken;

    let currQuery = '';
    // Object.keys(token).forEach(key => { ... })
    (Object.keys(token.inputted) as (keyof SearchToken['inputted'])[]).forEach((key) => {
      const param = token.inputted[key];
      if (param) {
        currQuery = `${currQuery}&${key}=${param}`;
      }
    });

    // 先頭の`&`を取り除く
    currQuery = currQuery.slice(1);
    
    // 通常検索も絞り込みも存在しない場合
    token.isEmpty = !currQuery && !token.narrowDown;

    console.log(currQuery);

    if (currQuery !== token.query) {
      reactHistory.push('/search/?' + currQuery);
      token.query = currQuery;
    }
  }

  return (
    <div className="Search-field">
      <h1 className="Search-field-title">あなたの『働きたい』がきっと見つかる</h1>
      <div className="Search-field-input-field">
        <input className="Search-field-input" type="text" onChange={event => onChangeInputValue(event, 'keyword')} name="keyword" placeholder="キーワード（会社名 など）" />
        <span className="Search-field-input-divider"></span>
        <input className="Search-field-input" type="text" onChange={event => onChangeInputValue(event, 'job')} name="job" placeholder="職種（電気工事 など）" />
        <span className="Search-field-input-divider"></span>
        <input className="Search-field-input" type="text" onChange={event => onChangeInputValue(event, 'area')} name="area" placeholder="地域" />
        <button className="Search-field-search-button" onClick={search}>
          <svg className="Search-field-search-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </button>
      </div>
    </div>
  )
}

export default SearchField;
