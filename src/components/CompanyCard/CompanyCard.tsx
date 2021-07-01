import React from 'react';
import './CompanyCard.scss';

export interface Company {
  name: string;
  desc: string;
  area: string;
  basicSalary: number;
  thumbnail: string;
  imgPath: string;
  searchToken: {
    keyword: {[key: string]: true},
    job: {[key: string]: true},
    area: {[key: string]: true},
  }
}

function CompanyCard({data}: {data: Company}) {
  return (
    <div className="Company-card">
      <span className="Company-card-title">{data.name}</span>

      <ul className="Company-card-tips-wrapper">
        <li className="Company-card-tips">・{data.area}</li>
        <li className="Company-card-tips">・月収 {data.basicSalary}万円</li>
      </ul>

      <p className="Company-card-desc">{data.desc}</p>
    </div>
  );
}

export default CompanyCard;
