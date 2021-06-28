import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import './App.scss';
import SearchField from './components/SearchField';

const HomePage = lazy(() => import('./pages/Home/Home'));
const SearchPage = lazy(() => import('./pages/Search/Search'));

// FallbackのタイミングでしかURLのリスナーを追加できないっぽい？
function Fallback() {
  // const history = useHistory();
  // useEffect(() => {
  //   history.listen((event) => console.log(event));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (<div></div>);
}

function App() {

  return (
    <div className="App">
      <header className="Root-header">
        <nav className="Root-header-nav">
          <div className="Root-header-nav-logo-wrapper">
            {/* <img src="https://drive.google.com/uc?export=view&id=1faoG_sosIy9uA_NZLUjoI7lFcAXPDvVh" className="logo"/> */}
          </div>
          <div className="Root-header-nav-anchors">
            <span className="Root-header-nav-anchor">HOME</span>
            <span className="Root-header-nav-anchor">ABOUT SITE</span>
            <span className="Root-header-nav-anchor">UPDATE LOG</span>
            <span className="Root-header-nav-anchor">NEWS</span>
          </div>
        </nav>
      </header>

      <Router>
        <main className="Root-main">
          {/* ここにはポータルか何かを用意してルートごとに任意のコンテンツを表示する必要があるが、一旦別のやつぶち込む */}
          <section className="Root-main-top">
            <SearchField />
          </section>

          <Suspense fallback={<Fallback />}>
            <Switch>
              <Route exact path="/" component={HomePage}></Route>
              <Route path="/search" component={SearchPage}></Route>
            </Switch>
          </Suspense>
        </main>
      </Router>

      <footer className="Root-footer"></footer>
    </div>
  );
}

export default App;
