import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';


const HomePage = lazy(() => import('./pages/Home/Home'));
const SearchPage = lazy(() => import('./pages/Search/Search'));

function App() {
  return (
    <div className="App">
      <header className="Route-header">
      </header>

      <Router>
        <main className="Route-main">
          <Suspense fallback={null}>
            <Switch>
              <Route exact path="/" component={HomePage}></Route>
              <Route path="/search" component={SearchPage}></Route>
            </Switch>
          </Suspense>
        </main>
      </Router>

      <footer className="Route-footer"></footer>
    </div>
  );
}

export default App;
