import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControl, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import '../styles/SearchBox.css';

export default function SearchBox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const searchHandler = (e) => {
    e.preventDefault();
    navigate(query ? `search?query=${query}` : '/search');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="search-box-container mx-lg-4 flex-grow-1">
      <form onSubmit={searchHandler}>
        <div className="position-relative">
          <span className="search-icon-wrapper">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <FormControl
            type="text"
            name="query"
            id="query"
            className="search-input-premium"
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchproducts')}
            aria-label="Pesquisar Produtos"
          />
          <Button
            className="search-button-premium"
            type="submit"
            id="button-search"
          >
            {t('search')}
          </Button>
        </div>
      </form>
    </div>
  );
}
