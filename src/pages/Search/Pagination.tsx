import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { DB_LIMIT } from '../../environment';

function createMaxPage(dataSize: number): number {
  const limit = DB_LIMIT;
  return ((dataSize - dataSize % limit) / limit) + 1;
}

type Buttons = [number, number, number, number, number];

interface Props {
  page: number;
  dataSize: number;
}
const Pagination = React.memo(({ page, dataSize }: Props) => {
  const [buttons, setButtons] = useState<Buttons>([] as any);

  useEffect(() => {
    if (!dataSize) { return; }
    const maxPage = createMaxPage(dataSize);

    if (page >= maxPage - 2) {
      maxPage > 4
        ? setButtons([maxPage - 4, maxPage - 3, maxPage - 2, maxPage - 1, maxPage])
        : setButtons([...Array(maxPage)].map((_, i) => i + 1) as Buttons);

    } else {
      page > 3
        ? setButtons([page - 2, page - 1, page, page + 1, page + 2])
        : setButtons([1, 2, 3, 4, 5]);
    }
  }, [page, dataSize])

  const history = useHistory();
  const select = (value: number) => {
    history.push(`/search/${value}` + history.location.search);
  }

  const skipToFirst = () => {
    history.push(`/search/1` + history.location.search);
  }

  const skipToEnd = () => {
    history.push(`/search/${createMaxPage(dataSize)}` + history.location.search);
  };

  const buttonClassName = (value: number): string => {
    let className = 'Search-pagination-button';
    if (value === page) {
      className += ' Search-pagination-button-active';
    }
    return className;
  }

  return (
    dataSize
    ?
      <div className="Search-pagination">
        <button className="Search-pagination-button" onClick={skipToFirst}>
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>
        </button>

        { buttons.map((value) => <button className={buttonClassName(value)} onClick={() => select(value)} key={value}>{ value }</button>)}

        <button className="Search-pagination-button"onClick={skipToEnd}>
          <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="16px" viewBox="0 0 24 24" width="16px" fill="#000000"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12"/></g></svg>
        </button>
      </div>
    : null
  );
});

export default Pagination;
