import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyCard from '../../components/CompanyCard';
// import './Search.scss';

function Search() {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
  }, [location])

  return (
    // <div>Search</div
    <CompanyCard />
  );
}

export default Search;