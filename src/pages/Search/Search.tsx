import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createUrlSearchParams } from '../../common';
import CompanyCard from '../../components/CompanyCard';
import { Company } from '../../components/CompanyCard/CompanyCard';
import firebase from 'firebase/app'

import './Search.scss';
import { ngram } from '../../common/ngram-factory';

type Query = firebase.firestore.Query<firebase.firestore.DocumentData>;
const store = firebase.firestore();
function searchCompanyData(params: {[key: string]: string}): Promise<Company[]> {
  let query = store.collection('companies')as Query;

  Object.keys(params).forEach(key => {
    const baseWord = params[key];
    const searchWords = ngram(2, baseWord);

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

  useEffect(() => {
    const params = createUrlSearchParams(location.search);
    searchCompanyData(params).then(result => setCompanies(result));
  }, [location])

  return (
    <div className="Search">
      { companies.map(data => <CompanyCard data={data} key={data.imgPath}></CompanyCard>)}
    </div>
  );
}

export default Search;