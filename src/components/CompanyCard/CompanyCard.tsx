import React from 'react';
import './CompanyCard.scss';

function CompanyCard() {
  return (
    <div className="Company-card">
      <div className="Company-card-img-wrapper">
        {/* <img className="Company-card-img" ref="" /> */}
      </div>

      <div className="Company-card-body">
        <span className="Company-card-title">東北電力株式会社</span>

        <ul className="Company-card-tips-wrapper">
          <li className="Company-card-tips">・苫小牧市 新明町</li>
          <li className="Company-card-tips">・年収400万円～800万円</li>
          <li className="Company-card-tips">・正社員</li>
        </ul>

        <p className="Company-card-desc">昭和２６年の創立から「東北の繁栄なくして当社の発展なし」という基本的な考え方が脈々と受け継がれており、東北地域を代表する企業として地域活性化に資する活動を多彩に展開しています。</p>
      </div>
    </div>
  );
}

export default CompanyCard;
