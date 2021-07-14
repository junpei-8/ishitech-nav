import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Search.scss';
import { useHistory } from 'react-router-dom';
import { Company } from '../../components/CompanyCard/CompanyCard';

import CompanyCard from '../../components/CompanyCard';

import firebase from 'firebase/app';
import { firestore } from '../../firebase'

import { ngramWithReplacer } from '../../common/ngram';
import { DB_LIMIT, YEAR } from '../../environment';

import { Document, Page, pdfjs } from 'react-pdf';
import { ReactHistory } from '../../global';
import SearchPagination from './SearchPagination';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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

interface PdfDownloader {
  xmlHttpRequest?: XMLHttpRequest | null,
  anchor?: HTMLAnchorElement | null
}

interface DatabaseRef {
  query: Query;
  snapshot?: QuerySnapshot;
}

let previousLocation: ReactHistory['location'] = {} as any;
function Search() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, _setSelectedCompany]  = useState<Company | null>();
  const [paginationProps, setPaginationProps] = useState<React.ComponentProps<typeof SearchPagination>>({} as any);
  
  const selectedCompanyRef = useRef<Company | null>(null);
  const databaseRef = useRef<DatabaseRef>({} as any);
  const pdfDownloader = useRef<PdfDownloader>({});
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

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

    if (value) {
      document.body.style.overflow = 'hidden';

      const downloaderRef = pdfDownloader.current;
      const xhr = downloaderRef.xmlHttpRequest = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (downloaderRef.xmlHttpRequest) {
          const anchor: HTMLAnchorElement = document.createElement('a') as any;
          anchor.href = URL.createObjectURL(xhr.response);
          anchor.setAttribute('download', `${value.id}.pdf`);
          downloaderRef.anchor = anchor;
        }
      };
      xhr.open('GET', `https://storage.googleapis.com/ishitech-nav.appspot.com/${YEAR}/${value.id}.pdf`);
      xhr.send();

    } else {
      document.body.style.removeProperty('overflow');

      const downloaderRef = pdfDownloader.current;
      downloaderRef.xmlHttpRequest = null;
      downloaderRef.anchor = null;
    }
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

  const removeHash = () => {
    const location = history.location;

    // 一番初めにアクセスされた場合、key=undefined となる性質を利用
    location.key
      ? history.goBack()
      : history.replace(location.pathname + location.search);
  };

  // dataを search-pdf-previewer に表示させる
  const displayPdf = useCallback((data: Company) => {
    setSelectedCompany(data);
    const location = history.location;
    history.push(location.pathname + location.search + '#' + data.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeCanvas = (value: number) => {
    const canvasRef = pdfCanvasRef.current;
    if (canvasRef) {
      if (value) {
        const styleRef = canvasRef.style;
        const currHeight = parseFloat(styleRef.height);
        styleRef.height = currHeight + value + '%';

      } else {
        canvasRef.style.height = '100%';
      }
    };
  };

  const openNewPdfPage = () => {
    window.open(`https://storage.googleapis.com/ishitech-nav.appspot.com/${YEAR}/${selectedCompany!.id}.pdf`, '_blank')
  }

  const onRenderCanvas = () => {
    const canvasRef = pdfCanvasRef.current!;
    canvasRef.style.height = '100%';
    canvasRef.addEventListener('click', (e) => e.stopPropagation());
  };

  return (
    <div className="Search">
      { companies.map(data => <CompanyCard onClick={displayPdf} data={data} key={data.id}></CompanyCard>) }
      <div className="Company-card Search-shadow-card"></div>
      <div className="Company-card Search-shadow-card"></div>
      <SearchPagination {...paginationProps} />

      {
        selectedCompany ?
          <div className="Search-pdf-previewer">
            <div className="Search-pdf-previewer-header">
              <button className="Search-pdf-previewer-header-button" onClick={removeHash}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
              </button>

              <div className="Search-pdf-previewer-header-button-container">
                <button className="Search-pdf-previewer-header-button" onClick={() => pdfDownloader.current.anchor?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"/></g></svg>
                </button>
                <button className="Search-pdf-previewer-header-button" onClick={openNewPdfPage}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                </button>
              </div>
            </div>

            <Document
              className="Search-pdf-preview"
              file={`https://storage.googleapis.com/ishitech-nav.appspot.com/${YEAR}/${selectedCompany.id}.pdf`}
            >
              <Page
                onClick={removeHash}
                className="Search-pdf-preview-page"
                renderTextLayer={false} renderAnnotationLayer={false} pageNumber={1}
                canvasRef={pdfCanvasRef} onLoadSuccess={onRenderCanvas}
              />
            </Document>

            <div className="Search-pdf-previewer-footer">
              <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(-20)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>
              </button>

                <span className="Search-pdf-previewer-footer-divider"></span>

              <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(0)}>
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><g><rect fill="none" height="32" width="32"/><rect fill="none" height="32" width="32"/><rect fill="none" height="32" width="32"/></g><g><g/><path d="M12,5V1L7,6l5,5V7c3.31,0,6,2.69,6,6s-2.69,6-6,6s-6-2.69-6-6H4c0,4.42,3.58,8,8,8s8-3.58,8-8S16.42,5,12,5z"/></g></svg>
              </button>

                <span className="Search-pdf-previewer-footer-divider"></span>

              <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(20)}>
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><g><rect fill="none" height="32" width="32"/></g><g><g><path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z"/></g></g></svg>
              </button>
            </div>
          </div>
          : null
      }
    </div>
  );
}

export default Search;