import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import './Search.scss';
import { useHistory } from 'react-router-dom';
import { Company } from '../../components/CompanyCard/CompanyCard';

import CompanyCard from '../../components/CompanyCard';

import firebase from 'firebase/app';
import { firestore } from '../../firebase'

import { ngramWithReplacer } from '../../common/ngram';
import { DB_LIMIT, YEAR } from '../../environment';

import { ReactHistory } from '../../global';
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

interface DatabaseRef {
  query: Query;
  snapshot?: QuerySnapshot;
}

let previousLocation: ReactHistory['location'] = {} as any;
function Search() {
  const reRender = useReducer(() => ({}), {})[1] as () => void

  const [companyCards, _setCompanyCards] = useState<(JSX.Element[]) | null>([]);
  const addCompanies = (snapshot: QuerySnapshot | null, reset?: boolean) => {
    if (snapshot) {
      databaseRef.current.snapshot = snapshot;
      if (snapshot.empty) {
        hasFetchedLastCompany.current = true;
        reRender();
        return;
      }

      const Card = CompanyCard;
      const newCards: JSX.Element[] = [];

      // ループ回数を1回減らすため -1 している
      const docs = snapshot.docs;
      const docsLen = docs.length - 1;

      let i = 0;
      while(i < docsLen) {
        const data = docs[i].data() as Company;
        newCards.push(<Card onClick={displayPdf} data={data} key={data.id}></Card>);
        i++;
      }
  
      const lastData = docs[i].data() as Company;

      // ex) (15 + 1) < 16
      if (i + 1 < DB_LIMIT) {
        hasFetchedLastCompany.current = true;
        newCards.push(<Card onClick={displayPdf} data={lastData} key={lastData.id}></Card>)

      } else {
        newCards.push(<Card onClick={displayPdf} data={lastData} key={lastData.id} ref={observedCompanyCardRef} />)
      }

      reset
        ? _setCompanyCards(newCards)
        : _setCompanyCards((cards) => (cards || []).concat(newCards));

    } else {
      _setCompanyCards(null) // Not-matched ページを表示
    }
  }

  const [selectedCompany, _setSelectedCompany]  = useState<Company | null>(null);
  const setSelectedCompany = (value: Company | null) => {
    _setSelectedCompany(value);
    selectedCompanyRef.current = value;
  }

  const [hasFetchedCompanies, setHasFetchedCompanies] = useState<boolean>(false);
  const hasFetchedLastCompany = useRef<boolean>(false);
  // const [hasFetchedLastCompany, setHasFetchedLastCompany] = useState<boolean>(false);
  
  const selectedCompanyRef = useRef<Company | null>(null);
  const databaseRef = useRef<DatabaseRef>({} as any);

  const observedCompanyCardRef = useRef<HTMLDivElement>(null);
  const companyCardIntersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const history = useHistory();
  // onMounted
  useEffect(() => {
    // observer代入処理
    const IntersectionObs = IntersectionObserver;
    if (IntersectionObs) {
      companyCardIntersectionObserverRef.current =
        new IntersectionObs((entries, observer) => {
          const event = entries[0];
          if (event.isIntersecting) {
            observer.disconnect();
            addNextCompanies();
          }
        });
    }

    previousLocation = {} as any;
    const onChangeHistory = () => {
      const prevLocation: ReactHistory['location'] = previousLocation;
      const currLocation = previousLocation = history.location;
    
      if (currLocation.search !== prevLocation.search) {
        window.scrollTo({ top: 0 }); // setCompanies([]);
        hasFetchedLastCompany.current = false;
        setHasFetchedCompanies(false);

        const dbLimit = DB_LIMIT;
  
        const query = databaseRef.current.query = 
          getCompanyDataQuery(new URLSearchParams(currLocation.search));
        
        query.limit(dbLimit).get()
          .then(snapshot => {
            setHasFetchedCompanies(true);
            snapshot.empty
              ? addCompanies(null, true)
              : addCompanies(snapshot, true);
          })
      }
  
      if (currLocation.hash !== prevLocation.hash) {
        const hash = currLocation.hash.slice(1);
        if (hash) {
          if (!selectedCompanyRef.current) {
            firestore.collection(`companies-${YEAR}`).doc(hash).get()
              .then(snapshot => {
                const data = snapshot.data() as Company;
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

    onChangeHistory();
    const unsubscribe = history.listen(onChangeHistory);

    return () => {
      document.body.style.removeProperty('overflow');
      unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const obsRef = companyCardIntersectionObserverRef.current;
    const cardRef = observedCompanyCardRef.current;
    if (obsRef && cardRef && !hasFetchedLastCompany.current) {
      obsRef.observe(cardRef);
    }
  }, [companyCards]);

  const addNextCompanies = () => {
    const dbRef = databaseRef.current;
    const dbLimit = DB_LIMIT;
    const prevSnapshot = dbRef.snapshot;

    if (prevSnapshot && !hasFetchedLastCompany.current) {
      setHasFetchedCompanies(false);
      dbRef.query.startAfter(prevSnapshot.docs[dbLimit - 1]).limit(dbLimit).get()
        .then(snapshot => {
          setHasFetchedCompanies(true);
          addCompanies(snapshot);
        });
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
      {
        companyCards
          ? companyCards
          : <div className="Search-not-matched">
              <h2 className="Search-not-matched-heading">(´・ω・`)</h2>
              <span className="Search-not-matched-comment">検索結果が見つかりませんでした</span>
            </div>
      }
      <div className="Company-card Search-shadow-card"></div>
      <div className="Company-card Search-shadow-card"></div>

      <div className="Search-footer">
        {
          hasFetchedLastCompany.current
            ? null
            : hasFetchedCompanies
              ? companyCardIntersectionObserverRef.current
                ? null
                : <button className="Search-footer-button" onClick={addNextCompanies}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="56px" viewBox="0 0 24 24" width="56px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                  </button>
              : <div className="Search-footer-progress-spinner"></div>
        }
      </div>

      <PdfPreviewer company={selectedCompany} closeEvent={removeHash} />
    </div>
  );
}

export default Search;