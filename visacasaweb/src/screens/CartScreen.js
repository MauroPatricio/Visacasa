import { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useNavigate } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaPlus, FaMinus, FaStore, FaExclamationCircle, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import '../styles/CartScreen.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SELLER_DETAILS_REQUEST':
      return { ...state, loadingSeller: true };
    case 'SELLER_DETAILS_SUCCESS':
      return { ...state, sellerDetails: action.payload, loadingSeller: false };
    case 'SELLER_DETAILS_FAIL':
      return { ...state, errorSeller: action.payload, loadingSeller: false };
    default:
      return state;
  }
};

export default function CartScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sellerDayInfo, setSellerDayInfo] = useState({
    text: t('closestore'),
    isOpen: false,
    color: 'danger'
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart: { cartItems }, error, changelng } = state;

  const [seller, setSeller] = useState({});
  const [, dispatch] = useReducer(reducer, { sellerDetails: '', loading: true, error: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        if (cartItems.length !== 0) {
          dispatch({ type: 'SELLER_DETAILS_REQUEST' });
          const sellerId = cartItems[0].seller._id;
          const { data } = await axios.get(`/api/users/${sellerId}`);
          setSeller(data);
          dispatch({ type: 'SELLER_DETAILS_SUCCESS', payload: data });
        }
      } catch (err) {
        dispatch({ type: 'SELLER_DETAILS_FAIL', payload: getError(err) });
      }
    };
    fetchSellerDetails();
  }, [cartItems]);

  useEffect(() => {
    if (seller && seller.seller) {
      setSellerDayInfo({
        text: t('closestore'),
        isOpen: false,
        color: 'danger'
      });
    }
  }, [seller, t]);

  async function updateCartHandler(item, quantity) {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      toast.info(t('productunavailable'));
      return;
    }
    ctxDispatch({
      type: 'ADD_ITEM_ON_CART',
      payload: { ...item, quantity },
    });
  }

  async function removeItemCart(item) {
    ctxDispatch({
      type: 'REMOVE_ITEM_ON_CART',
      payload: { ...item },
    });
  }

  const checkOutHandler = () => {
    navigate('/address');
  };

  const totalItems = cartItems.reduce((pre, cur) => pre + cur.quantity, 0);
  const totalPrice = cartItems.reduce(
    (pre, cur) => cur.onSale ? pre + cur.discount * cur.quantity : pre + cur.price * cur.quantity,
    0
  );
  return (
    <Container className="cart-container pb-5">
      <Helmet>
        <title>{t('shoppingcart')} | Visacasa</title>
      </Helmet>

      <div className="cart-title-premium">
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaShoppingCart className="text-primary" />
          <h1 className="h2 fw-800 mb-0" style={{ fontFamily: 'Outfit' }}>{t('shoppingcart')}</h1>
        </div>
        {cartItems.length > 0 && (
          <div className="cart-seller-info">
            <FaStore className="opacity-50" />
            <Link className="text_color text-decoration-none" to={`/seller/${cartItems[0].seller._id}`}>
              {cartItems[0].seller.seller.name}
            </Link>
            <span className={`badge bg-${sellerDayInfo.color}-soft text-${sellerDayInfo.color} border border-${sellerDayInfo.color} px-3 py-1 rounded-pill`} style={{ fontSize: '0.75rem' }}>
              {sellerDayInfo.text}
            </span>
          </div>
        )}
      </div>

      {error && <MessageBox variant="danger" className="mb-4">{error}</MessageBox>}

      {!sellerDayInfo.isOpen && cartItems.length > 0 && (
        <div className="cart-notice-premium mb-4">
          <FaExclamationCircle />
          <span>{t('supplierclosetimenotice')}</span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 opacity-10 mb-4"><FaShoppingCart /></div>
          <h3>{t('emptycart')}</h3>
          <p className="text-muted mb-4">Parece que ainda não adicionou produtos ao seu carrinho.</p>
          <Button variant="primary" className="customButton px-5" onClick={() => navigate('/')}>
            {t('shopping')}
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {/* Items List */}
          <Col lg={8}>
            <div className="d-flex flex-column gap-1">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item-card p-3">
                  <Row className="align-items-center g-3">
                    <Col xs={4} sm={2}>
                      <div className="cart-item-img-container">
                        <img src={item.image} alt={item.name} />
                      </div>
                    </Col>
                    <Col xs={8} sm={4}>
                      <Link to={`/products/${item._id}`} className="cart-item-name d-block">
                        {changelng === 'pt' ? item.nome || item.name : item.name}
                      </Link>
                      <div className="cart-item-meta">
                        <span><strong>{t('color')}:</strong> {item.color}</span>
                        <span><strong>{t('size')}:</strong> {item.size}</span>
                      </div>
                      {item.onSale && (
                        <div className="mt-1">
                          <small className="text-info badge bg-info-soft border border-info px-2 py-1">
                            {t('deliveryestimate')}: {item.orderPeriod}
                          </small>
                        </div>
                      )}
                    </Col>
                    <Col xs={6} sm={3}>
                      <div className="quantity-control-premium mx-auto mx-sm-0">
                        <Button
                          className="qty-btn"
                          disabled={item.quantity === 1}
                          onClick={() => updateCartHandler(item, item.quantity - 1)}
                        >
                          <FaMinus />
                        </Button>
                        <span className="qty-value">{item.quantity}</span>
                        <Button
                          className="qty-btn"
                          disabled={item.quantity >= item.countInStock}
                          onClick={() => updateCartHandler(item, item.quantity + 1)}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </Col>
                    <Col xs={4} sm={2} className="text-end text-sm-center">
                      <div className="cart-item-price">
                        {(item.onSale ? item.discount * item.quantity : item.price * item.quantity).toFixed(2)} MT
                      </div>
                    </Col>
                    <Col xs={2} sm={1} className="text-end">
                      <FaTrash className="remove-btn-premium" onClick={() => removeItemCart(item)} />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Link to="/" className="btn btn-link link-none text-muted mt-4 d-inline-flex align-items-center gap-2">
              <FaArrowLeft /> {t('shopping')}
            </Link>
          </Col>

          {/* Checkout Summary */}
          <Col lg={4}>
            <Card className="cart-summary-premium">
              <Card.Body className="p-0">
                <h3 className="summary-title">{t('ordersummary')}</h3>
                <div className="summary-row">
                  <span className="text-muted">{t('items')} ({totalItems})</span>
                  <span>{totalPrice.toFixed(2)} MT</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted">{t('delivery')}</span>
                  <span className="text-success fw-bold">{t('tobedefined')}</span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} MT</span>
                </div>

                <div className="mt-4 pt-2">
                  <Button
                    className="customButton w-100 py-3 mb-3 shadow-premium"
                    disabled={cartItems.length === 0}
                    onClick={checkOutHandler}
                  >
                    {t('request')}
                  </Button>
                  <p className="text-center text-muted small px-3">
                    Os custos de entrega serão calculados na próxima etapa com base na morada.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
