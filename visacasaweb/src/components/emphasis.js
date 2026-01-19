import axios from 'axios';
import React, { useContext, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { getError, truncateString } from '../utils';
import { useReducer } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useTranslation } from 'react-i18next';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'ITEMS_REQUEST':
      return { ...state, loadingPopular: true };

    case 'ITEMS_SUCCESS':
      return { ...state, loadingPopular: false, popularItems: action.payload.orders };

    case 'ITEMS_FAIL':
      return { ...state, loadingPopular: false };

    default:
      return state;
  }
};

export default function Emphasis() {

  const { t } = useTranslation();

  const [{ popularItems, loadingPopular }, dispatch] = useReducer(reducer, {
    loadingPopular: true,
    error: '',
  });

  const { state } = useContext(Store);

  const { changelng } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'ITEMS_REQUEST' });
        const { data } = await axios.get('/api/orders/popularitems');
        dispatch({ type: 'ITEMS_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'ITEMS_FAIL', payload: getError(err) });
      }
    };
    if (loadingPopular) {
      fetchData();
    }
  }, [loadingPopular]);


  return (
    <Container className="my-5">
      {popularItems && popularItems.length !== 0 && (
        <div className="d-flex align-items-baseline mb-4">
          <h2 className="fw-bold me-3" style={{ color: 'var(--text-dark)' }}>
            {t('featuredproducts')}
          </h2>
          <div className="flex-grow-1" style={{ height: '2px', background: 'var(--primary-gradient)', opacity: 0.3 }}></div>
        </div>
      )}

      <div className="emphasis-banner position-relative overflow-hidden rounded-4 shadow-lg">
        <img
          className="img-fluid w-100 h-100 object-fit-cover transition-slow"
          src="acompanheseuspedidos.png"
          alt="Visacasa Banner"
        />
        <div className="banner-overlay d-flex align-items-center justify-content-center p-4">
          <div className="text-center text-white">
            <h3 className="display-6 fw-bold mb-2">{t('banner_title', 'Tudo para a sua Obra')}</h3>
            <p className="lead mb-0">{t('banner_subtitle', 'Qualidade e Confiança em cada detalhe')}</p>
          </div>
        </div>
      </div>

      <style>{`
        .emphasis-banner {
          height: 350px;
          border: 4px solid white;
        }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2), rgba(0,0,0,0.6));
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .emphasis-banner:hover .banner-overlay {
          opacity: 1;
        }
        .emphasis-banner:hover img {
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .emphasis-banner {
            height: 200px;
          }
        }
      `}</style>
    </Container>
  );
}
