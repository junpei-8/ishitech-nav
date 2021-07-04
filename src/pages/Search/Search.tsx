import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createUrlSearchParams } from '../../common';
import CompanyCard from '../../components/CompanyCard';
import { Company } from '../../components/CompanyCard/CompanyCard';

import firebase from 'firebase/app';
import { firestore } from '../../firebase'

import './Search.scss';
import { ngramWithReplacer } from '../../common/ngram';

type Query = firebase.firestore.Query<firebase.firestore.DocumentData>;

const YEAR = 2021;
function searchCompanyData(params: {[key: string]: string}): Promise<Company[]> {
  let query = firestore.collection('companies-' + YEAR)as Query;

  Object.keys(params).forEach(key => {
    const baseWord = params[key];
    const searchWords = ngramWithReplacer(2, baseWord);

    searchWords.forEach((word) => {
      query = query.where(`searchToken.${key}.${word}`, '==', true);
    })
  });

  return query.limit(20).get()
    .then((result) => {
      const companies: Company[] = [];

      result.forEach(res => companies.push(res.data() as Company))

      return companies;
    })
}

function Search() {
  const location = useLocation();
  const [companies, setCompanies] = useState<Company[]>([]);

  const [selectedCompany, setSelectedCompany]  = useState<Company>();

  useEffect(() => {
    const params = createUrlSearchParams(location.search);
    searchCompanyData(params).then(result => setCompanies(result));
  }, [location])

  const onClickCompanyCard = (data: Company) => {
    // dataを search-pdf-previewer に表示させる
    setSelectedCompany(data);
  }

  return (
    <div className="Search">
      {
        selectedCompany ?
          <div className="Search-pdf-previewer">
            <img src={`https://storage.googleapis.com/ishitech-nav.appspot.com/2021/${selectedCompany.id}.pdf`} alt="company-data" />
          </div>
          : null
      }
      { companies.map(data => <CompanyCard onClick={onClickCompanyCard} data={data} key={data.id}></CompanyCard>) }
    </div>
  );
}

export default Search;