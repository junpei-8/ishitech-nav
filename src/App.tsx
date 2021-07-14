import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import SearchField from './components/SearchField';

const HomePage = lazy(() => import('./pages/Home/Home'));
const SearchPage = lazy(() => import('./pages/Search/Search'));

function App() {
  return (
    <div className="App">
      <Router>
        <main className="Root-main">
          {/* ここにはポータルか何かを用意してルートごとに任意のコンテンツを表示する必要があるが、一旦別のやつぶち込む */}
          <section className="Root-main-top">
            <SearchField />
          </section>

          <Suspense fallback={null}>
            <Switch>
              <Route exact path="/" component={HomePage}></Route>
              <Route path="/search/:id" component={SearchPage}></Route>
            </Switch>
          </Suspense>
        </main>
      </Router>

      <footer className="Root-footer">
        
      </footer>
    </div>
  );
}

export default App;
