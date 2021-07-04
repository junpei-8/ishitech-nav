import React from 'react';
import './CompanyCard.scss';

export interface Company {
  id: string;
  name: string;
  area: string;
  job: string;
  basicSalary: number;
  searchToken: {
    keyword: {[key: string]: true},
    job: {[key: string]: true},
    area: {[key: string]: true},
  }
}

interface Props {
  data: Company,
  onClick: (data: Company) => any;
}
function CompanyCard({data, onClick}: Props) {
  const clickHandler = () => {
    onClick(data);
  }

  return (
    <div className="Company-card" onClick={clickHandler}>
      <span className="Company-card-title">{data.name}</span>

      <ul className="Company-card-tips-wrapper">
        <li>地域：　</li>
        <li>就業形態：　{ data.job }</li>
        <li>基本給：　{ (data.basicSalary + '').substring(0, 2) }万円</li>
      </ul>

    </div>
  );
}

export default CompanyCard;
