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
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
      };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SearchOnSaleScreen() {
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

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      products: [], // Initialize as empty array
      pages: 0,
      countProducts: 0
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `api/products/onsale?page=${page}`
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
    return `/onsale?page=${filterPage}`;
  };

  return (
    <div className="search-onsale-premium min-vh-100" style={{ background: '#f8fafc', paddingTop: '100px', paddingBottom: '60px' }}>
      <Helmet>
        <title>Produtos em Promoção - Visacasa</title>
      </Helmet>

      <div className="container-fluid px-lg-5">
        {/* Premium Page Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <span style={{ fontSize: '3rem' }}>🔥</span>
            <h1 className="h1-premium mb-0">Produtos em Promoção</h1>
          </div>
          <p className="text-muted-premium">Aproveite as melhores ofertas em materiais de construção</p>
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
                      🎯 {countProducts === 0 ? '0' : countProducts} Produto(s) em promoção
                    </h5>
                    <p className="mb-0 mt-2 small text-muted">Confira abaixo todas as ofertas especiais</p>
                  </div>
                </div>

                {/* No Results Message */}
                {products.length === 0 && (
                  <div className="text-center py-5">
                    <MessageBox>Produtos em promoção não encontrados</MessageBox>
                  </div>
                )}

                {/* Premium Products Grid */}
                <Row className="g-4">
                  {products.map((product) => (
                    <Col key={product._id} xs={12} sm={6} lg={4} xl={3}>
                      <Product product={product} />
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
        .search-onsale-premium {
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
