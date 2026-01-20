import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import { useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';


import {
  FiClock,
  FiMapPin,
  FiInfo,
  FiPhone,
  FiCreditCard,
  FiShoppingBag,
  FiStar
} from 'react-icons/fi';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SELLER_DETAILS_REQUEST':
      return { ...state, loadingSeller: true };

    case 'SELLER_DETAILS_SUCCESS':
      return { ...state, sellerDetails: action.payload, loadingSeller: false };

    case 'SELLER_DETAILS_FAIL':
      return { ...state, errorSeller: action.payload, loadingSeller: false };

    case 'PRODUCT_REQUEST':
      return { ...state, loadingProducts: true };

    case 'PRODUCT_SUCCESS':
      return {
        ...state,
        productsBySeller: action.payload.products,
        pages: action.payload.pages,
        loadingProducts: false,
      };

    case 'PRODUCT_FAIL':
      return {
        ...state,
        productsError: action.payload,
        loadingProducts: false,
      };

    default:
      return state;
  }
};

export default function SellerScreen() {
  const { t } = useTranslation();
  const params = useParams();
  const { id: sellerId } = params;
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [
    {
      loadingSeller,
      loadingProducts,
      errorSeller,
      sellerDetails,
      productsError,
      productsBySeller,
    },
    dispatch,
  ] = useReducer(reducer, { sellerDetails: null, loadingProducts: true });

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        dispatch({ type: 'SELLER_DETAILS_REQUEST' });
        const { data } = await axios.get(`/api/users/${sellerId}`);
        dispatch({ type: 'SELLER_DETAILS_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'SELLER_DETAILS_FAIL', payload: getError(err) });
      }
    };
    fetchSellerDetails();
  }, [sellerId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'PRODUCT_REQUEST' });
        const { data } = await axios.get(`/api/products?seller=${sellerId}`);
        dispatch({ type: 'PRODUCT_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'PRODUCT_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [sellerId]);

  return (
    <div className="container-fluid py-4 mt-5">
      <Helmet>
        <title>{t('supplierpage')}</title>
      </Helmet>

      {loadingSeller ? (
        <div className="text-center py-5">
          <LoadingBox />
        </div>
      ) : errorSeller ? (
        <MessageBox variant="danger">{errorSeller}</MessageBox>
      ) : sellerDetails && (
        <div className="reveal active">
          <div className="d-flex align-items-center mb-4 gap-3">
            <div className="bg-primary-soft p-3 rounded-circle" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShoppingBag className="text-primary fs-3" />
            </div>
            <div>
              <h1 className="h1-premium mb-0">{t('supplierproducts')}</h1>
              <p className="text-muted-premium mb-0">{sellerDetails.seller.name}</p>
            </div>
          </div>

          <Row className="g-4">
            <Col lg={4} xl={3}>
              <Card className="border-0 shadow-premium overflow-hidden sticky-top" style={{ top: '100px', borderRadius: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={sellerDetails.seller.logo}
                    alt={sellerDetails.seller.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                    <div className="d-flex align-items-center gap-2 text-white">
                      <FiStar className="text-warning" />
                      <span className="fw-bold">{sellerDetails.seller.rating || '5.0'}</span>
                      <small className="opacity-75">({sellerDetails.seller.numReviews || 0} reviews)</small>
                    </div>
                  </div>
                </div>

                <Card.Body className="p-4">
                  <section className="mb-4">
                    <h6 className="text-uppercase ls-wide fs-xs fw-bold text-primary mb-3">Informações da Loja</h6>

                    <div className="d-flex gap-3 mb-3">
                      <FiInfo className="text-primary mt-1" />
                      <div>
                        <small className="d-block text-muted text-uppercase fw-bold ls-tight" style={{ fontSize: '0.65rem' }}>Especialidade</small>
                        <span className="text-muted-premium small">{sellerDetails.seller.description || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-3 mb-3">
                      <FiMapPin className="text-primary mt-1" />
                      <div>
                        <small className="d-block text-muted text-uppercase fw-bold ls-tight" style={{ fontSize: '0.65rem' }}>Endereço</small>
                        <span className="text-muted-premium small">
                          {sellerDetails.seller.province?.name ? `${sellerDetails.seller.province.name}, ` : ''}
                          {sellerDetails.seller.address}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="mb-4">
                    <h6 className="text-uppercase ls-wide fs-xs fw-bold text-primary mb-3">Horário de Funcionamento</h6>
                    <div className="bg-light rounded-4 p-3">
                      {sellerDetails.seller.workDayAndTime && sellerDetails.seller.workDayAndTime.length > 0 ? (
                        sellerDetails.seller.workDayAndTime.map((workDay) => (
                          <div key={workDay.dayOfWeek} className="d-flex justify-content-between mb-2 last-child-mb-0 small">
                            <span className="fw-medium">{workDay.dayOfWeek}</span>
                            <span className="text-muted">{workDay.opentime} - {workDay.closetime}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted small italic">Horário não especificado</div>
                      )}
                    </div>
                  </section>

                  {userInfo && userInfo.isAdmin && (
                    <section className="mt-4 pt-4 border-top">
                      <h6 className="text-uppercase ls-wide fs-xs fw-bold text-danger mb-3">Dados Administrativos</h6>

                      <div className="d-flex gap-3 mb-3">
                        <FiPhone className="text-danger mt-1" />
                        <div>
                          <small className="d-block text-muted text-uppercase fw-bold ls-tight" style={{ fontSize: '0.65rem' }}>Telefones Transferência</small>
                          <span className="text-muted-premium small">
                            {sellerDetails.seller.phoneNumberAccount}
                            {sellerDetails.seller.alternativePhoneNumberAccount && ` / ${sellerDetails.seller.alternativePhoneNumberAccount}`}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex gap-3">
                        <FiCreditCard className="text-danger mt-1" />
                        <div>
                          <small className="d-block text-muted text-uppercase fw-bold ls-tight" style={{ fontSize: '0.65rem' }}>Dados Bancários</small>
                          <div className="text-muted-premium small">
                            <div>{sellerDetails.seller.accountType}: {sellerDetails.seller.accountNumber}</div>
                            {sellerDetails.seller.alternativeAccountNumber && (
                              <div className="mt-1">{sellerDetails.seller.alternativeAccountType}: {sellerDetails.seller.alternativeAccountNumber}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8} xl={9}>
              <div className="products-section">
                {loadingProducts ? (
                  <Row className="g-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <Col key={n} sm={6} md={4} lg={3}>
                        <div className="skeleton rounded-4" style={{ height: '300px', width: '100%' }}></div>
                      </Col>
                    ))}
                  </Row>
                ) : productsError ? (
                  <MessageBox variant="danger">{productsError}</MessageBox>
                ) : (
                  <>
                    {productsBySeller.length === 0 ? (
                      <div className="bg-white rounded-5 shadow-premium p-5 text-center">
                        <FiShoppingBag className="fs-1 text-muted mb-3 opacity-25" />
                        <h4 className="fw-bold text-muted mb-2">{t('therearenoaddedproducts')}</h4>
                        <p className="text-muted small mb-0">Este vendedor ainda não possui produtos listados.</p>
                      </div>
                    ) : (
                      <Row className="g-4">
                        {productsBySeller.map((product, index) => (
                          <Col
                            key={product.slug}
                            sm={6}
                            md={4}
                            lg={4}
                            xl={3}
                            className={`reveal active delay-${(index % 4 + 1) * 100}`}
                          >
                            <Product product={product}></Product>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
