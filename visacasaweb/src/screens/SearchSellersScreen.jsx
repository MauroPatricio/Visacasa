import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';


import Product from '../components/Product';
import CategoriesFilter from '../components/CategoriesFilter';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        sellers: Array.isArray(action.payload.sellers) ? action.payload.sellers : [],
        page: action.payload.page,
        pages: action.payload.pages,
        countSellers: action.payload.countSellers,
      };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SearchSellersScreen() {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('query') || 'all';
  const price = searchParams.get('price') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const order = searchParams.get('order') || 'newest';
  const page = searchParams.get('page') || 1;
  const province = searchParams.get('province') || 'all';
  const { t } = useTranslation();

  const [{ loading, error, sellers, pages, countSellers }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      sellers: [], // Initialize as empty array
      pages: 0,
      countSellers: 0
    });

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `api/users/sellers?page=${page}`
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchSearchData();
  }, [category, order, page, price, query, rating, province]);

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    return `/sellers?page=${filterPage}`;
  };

  return (
    <div className="search-sellers-premium min-vh-100" style={{ background: '#f8fafc', paddingTop: '100px', paddingBottom: '60px' }}>
      <Helmet>
        <title>Pesquisar fornecedores - Visacasa</title>
      </Helmet>

      <div className="container-fluid px-lg-5">
        {/* Premium Page Header */}
        <div className="text-center mb-5">
          <h1 className="h1-premium mb-3">Pesquisa de fornecedores</h1>
          <p className="text-muted-premium">Encontre os melhores fornecedores de materiais de construção</p>
        </div>

        <Row>
          {/* Premium Sidebar */}
          <Col lg={3} className="mb-4">
            <div className="premium-sidebar-card" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              position: 'sticky',
              top: '100px'
            }}>
              <CategoriesFilter />
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={9}>
            {loading ? (
              <div className="text-center py-5">
                <LoadingBox />
              </div>
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : (
              <>
                {/* Results Header */}
                <div className="results-header mb-4 p-4" style={{
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h5 className="mb-0" style={{ color: 'var(--slate-900)', fontWeight: '700' }}>
                      {countSellers === 0 ? '0' : countSellers} Resultado(s) encontrado(s)
                    </h5>
                  </div>
                </div>

                {/* No Results Message */}
                {sellers.length === 0 && (
                  <div className="text-center py-5">
                    <MessageBox>{t('suppliersnotfound')}</MessageBox>
                  </div>
                )}

                {/* Premium Sellers Grid */}
                <Row className="g-4">
                  {sellers.map((seller) => (
                    <Col key={seller._id} xs={12} sm={6} lg={4} xl={3}>
                      <Product seller={seller} />
                    </Col>
                  ))}
                </Row>

                {/* Premium Pagination */}
                {pages > 1 && (
                  <div className="pagination-premium mt-5" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {[...Array(pages).keys()].map((x) => (
                      <Link
                        key={x + 1}
                        to={getFilterUrl({ page: x + 1 })}
                        style={{ textDecoration: 'none' }}
                      >
                        <Button
                          className={Number(page) === x + 1 ? 'btn-page-active' : 'btn-page'}
                          style={{
                            background: Number(page) === x + 1 ? 'var(--primary-gradient)' : 'white',
                            color: Number(page) === x + 1 ? 'white' : 'var(--slate-700)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 18px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: Number(page) === x + 1
                              ? '0 10px 15px -3px rgba(232, 90, 79, 0.4)'
                              : '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          {x + 1}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      <style>{`
        .search-sellers-premium {
          position: relative;
        }
        .premium-sidebar-card h6 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 16px;
        }
        .btn-page:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
          background: var(--slate-100) !important;
        }
        .results-header h5 {
          font-family: 'Outfit', sans-serif;
        }
        @media (max-width: 992px) {
          .premium-sidebar-card {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
