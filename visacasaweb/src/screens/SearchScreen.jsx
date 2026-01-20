import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
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

export default function SearchScreen() {
  const navigate = useNavigate();
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
    const fetchSearchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}&province=${province}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchSearchData();
  }, [category, order, page, price, query, rating, province]);

  const getFilterUrl = (filter) => {
    const filterCategory = filter.category || category;
    const filterProvince = filter.province || province;
    const filterQuery = filter.query || query;
    const filterPrice = filter.price || price;
    const filterRating = filter.rating || rating;
    const filterOrder = filter.order || order;
    const filterPage = filter.page || page;
    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${filterOrder}&page=${filterPage}&province=${filterProvince}`;
  };

  return (
    <div className="search-premium min-vh-100" style={{ background: '#f8fafc', paddingTop: '100px', paddingBottom: '60px' }}>
      <Helmet>
        <title>{t('searchproducts')} - Visacasa</title>
      </Helmet>

      <div className="container-fluid px-lg-5">
        {/* Premium Page Header */}
        <div className="text-center mb-5">
          <h1 className="h1-premium mb-3">{t('searchproducts')}</h1>
          <p className="text-muted-premium">Encontre os melhores produtos para sua construção</p>
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
                {/* Results Header with Filters & Sort */}
                <div className="results-header mb-4 p-4" style={{
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h5 className="mb-2" style={{ color: 'var(--slate-900)', fontWeight: '700' }}>
                        {countProducts === 0 ? '0' : countProducts} {t('resultfound')}
                      </h5>
                      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                        {query !== 'all' && (
                          <span className="filter-badge">🔍 {query}</span>
                        )}
                        {category !== 'all' && products && products[0] && products[0].category && (
                          <span className="filter-badge">📂 {products[0].category.name}</span>
                        )}
                        {province !== 'all' && products && products[0] && products[0].province && (
                          <span className="filter-badge">📍 {products[0].province.name}</span>
                        )}
                        {price !== 'all' && (
                          <span className="filter-badge">💰 {price} MT</span>
                        )}
                        {rating !== 'all' && (
                          <span className="filter-badge">⭐ {rating}+</span>
                        )}
                        {(query !== 'all' || province !== 'all' || category !== 'all' || rating !== 'all' || price !== 'all') && (
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => navigate('/search')}
                            style={{
                              borderRadius: '8px',
                              padding: '4px 12px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} /> Limpar
                          </Button>
                        )}
                      </div>
                    </Col>
                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-700)', marginRight: '8px' }}>
                        {t('orderby')}
                      </label>
                      <select
                        value={order}
                        onChange={(e) => navigate(getFilterUrl({ order: e.target.value }))}
                        style={{
                          borderRadius: '10px',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--slate-700)'
                        }}
                      >
                        <option value="newest">{t('newproducts')}</option>
                        <option value="lowest">{t('lowtohigh')}</option>
                        <option value="highest">{t('hightolow')}</option>
                        <option value="toprated">{t('avgcustomerreviews')}</option>
                      </select>
                    </Col>
                  </Row>
                </div>

                {/* No Results Message */}
                {products.length === 0 && (
                  <div className="text-center py-5">
                    <MessageBox>{t('productsnotfound')}</MessageBox>
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
        .search-premium {
          position: relative;
        }
        .premium-sidebar-card h6 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 16px;
        }
        .filter-badge {
          background: var(--slate-100);
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 500;
          display: inline-block;
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
