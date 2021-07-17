import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Search.scss';
import { useHistory } from 'react-router-dom';
import { Company } from '../../components/CompanyCard/CompanyCard';

import CompanyCard from '../../components/CompanyCard';

import firebase from 'firebase/app';
import { firestore } from '../../firebase'

import { ngramWithReplacer } from '../../common/ngram';
import { DB_LIMIT, YEAR } from '../../environment';

import { ReactHistory } from '../../global';
import Pagination from './Pagination';
import PdfPreviewer from './PdfPreviewer';

type Query = firebase.firestore.Query<firebase.firestore.DocumentData>;
type QuerySnapshot =  firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;

function getCompanyDataQuery(params: URLSearchParams): Query {
  let query = firestore.collection('companies-' + YEAR) as Query;

  params.forEach((value, key) => {
    const searchWords = ngramWithReplacer(2, value);

    searchWords.forEach((word) => {
      query = query.where(`searchToken.${key}.${word}`, '==', true);
    })
  });

  return query;
}

function createCompanies(snapshot: QuerySnapshot): Company[] {
  const companies: Company[] = [];
  snapshot.forEach(result => companies.push(result.data() as any))
  return companies;
}

function createStartAtIndex(page: number, dataSize: number): number {
  const limit = DB_LIMIT;
  const selectedSize = (page - 1) * limit;
  const size = dataSize - 1;

  return selectedSize > size
    ? (size - size % limit)
    : selectedSize;
}


interface DatabaseRef {
  query: Query;
  snapshot?: QuerySnapshot;
}

let previousLocation: ReactHistory['location'] = {} as any;
function Search() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, _setSelectedCompany]  = useState<Company | null>(null);
  const [paginationProps, setPaginationProps] = useState<React.ComponentProps<typeof Pagination>>({} as any);
  
  const selectedCompanyRef = useRef<Company | null>(null);
  const databaseRef = useRef<DatabaseRef>({} as any);

  const history = useHistory();

  // onMounted
  useEffect(() => {
    previousLocation = {} as any;
    onChangeHistory();
    const unsubscribe = history.listen(onChangeHistory);

    return () => {
      document.body.style.removeProperty('overflow');
      unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedCompany = (value: Company | null) => {
    _setSelectedCompany(value);
    selectedCompanyRef.current = value;
  }

  const onChangeHistory = () => {
    const prevLocation: ReactHistory['location'] = previousLocation;
    const currLocation = previousLocation = history.location;

    const dbRef = databaseRef.current;
    const dbLimit = DB_LIMIT;

    if (currLocation.search !== prevLocation.search) {
      window.scrollTo({ top: 0 });
      const page = parseFloat(currLocation.pathname.split('/')[2]);
      const query = dbRef.query =
        getCompanyDataQuery(new URLSearchParams(currLocation.search));

      query.get()
        .then(snapshot => {
          dbRef.snapshot = snapshot;

          console.log(snapshot.docs.length)

          const dataSize = snapshot.size;
          setPaginationProps({page, dataSize});

          if (dataSize) {
            const startAtIndex = createStartAtIndex(page, snapshot.size);
            query.startAt(snapshot.docs[startAtIndex]).limit(dbLimit).get()
              .then(res => setCompanies(createCompanies(res)))

          } else {
            setCompanies([]);
          }
        })
      
      // ID(page数)のみの変更（つまりQueryは作成済み）
    } else if (currLocation.pathname !== prevLocation.pathname) {
      window.scrollTo({ top: 0 });
      const snapshot = dbRef.snapshot;
      if (snapshot) {
        const dataSize = snapshot.size;
        if (!dataSize) { return; }

        const page = parseFloat(currLocation.pathname.split('/')[2]);      
        setPaginationProps({ page, dataSize });

        const startAtIndex = createStartAtIndex(page, snapshot.size);
        dbRef.query.startAt(snapshot.docs[startAtIndex]).limit(dbLimit).get()
          .then(res => setCompanies(createCompanies(res)));
      }
    }

    if (currLocation.hash !== prevLocation.hash) {
      const hash = currLocation.hash.slice(1);
      if (hash) {
        if (!selectedCompanyRef.current) {
          firestore.collection(`companies-${YEAR}`).doc(hash).get()
            .then(result => {
              const data = result.data() as Company;
              data
                ? setSelectedCompany(data)
                : removeHash();
            })
        }
  
      } else {
        setSelectedCompany(null);
      }
    }
  }

  const removeHash = useCallback(() => {
    const location = history.location;

    // 一番初めにアクセスされた場合、key=undefined となる性質を利用
    location.key
      ? history.goBack()
      : history.replace(location.pathname + location.search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // dataを search-pdf-previewer に表示させる
    const displayPdf = useCallback((data: Company) => {
      setSelectedCompany(data);
      const location = history.location;
      history.push(location.pathname + location.search + '#' + data.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className="Search">
      { companies.map(data => <CompanyCard onClick={displayPdf} data={data} key={data.id}></CompanyCard>) }
      <div className="Company-card Search-shadow-card"></div>
      <div className="Company-card Search-shadow-card"></div>

      <Pagination {...paginationProps} />
      <PdfPreviewer company={selectedCompany} closeEvent={removeHash} />
    </div>
  );
}

export default Search;