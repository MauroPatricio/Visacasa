import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useReducer, useContext, useRef, useState } from 'react';
import Rating from '../components/Rating';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { formatedDate, getError } from '../utils';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaHardHat, FaTag, FaWarehouse, FaRegClock, FaCheckCircle, FaStar } from 'react-icons/fa';
import { MdOutlineConstruction, MdVerified } from 'react-icons/md';
import '../styles/ProductScreen.css';


const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };

    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };

    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };

    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };

    case 'CATEGORIES_REQUEST':
      return { ...state, loadingCategories: true };

    case 'CATEGORIES_SUCCESS':
      return { ...state, loadingCategories: false, categories: action.payload };

    case 'CATEGORIES_FAIL':
      return { ...state, loadingCategories: false };

    case 'FETCH_REQUEST':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

function ProductScreen() {
  const { t } = useTranslation();

  const params = useParams();

  const { id } = params;
  const navegate = useNavigate();
  const reviewsRef = useRef();
  const [{ loading, error, product, loadingCreateReview, categories }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });

  useEffect(() => {
    dispatch({ type: 'FETCH_REQUEST' });

    const fetchData = async () => {
      try {
        const result = await axios.get(`/api/products/${id}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [id]);



  const { state, dispatch: ctxDispatch } = useContext(Store);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const { cart, userInfo, changelng } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {

    const fetchData = async () => {
      try {
        dispatch({ type: 'CATEGORIES_REQUEST' });
        const { data } = await axios.get('/api/categories')

        dispatch({ type: 'CATEGORIES_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'CATEGORIES_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [categories]);


  const addOnCartAndRedirectHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);


    if (!selectedColor) {
      toast.error('Por favor, Informe a cor que deseja');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor, Informe o tamanho que deseja');
      return;
    }


    if (data.countInStock < quantity) {
      toast.error('Desculpe, o Produto não está disponível');
      // window.alert(`Desculpe, o Produto não está disponível`);
      return;
    }

    product.color = selectedColor
    product.size = selectedSize


    if (cart.cartItems.length > 0 && product.seller._id !== cart.cartItems[0].seller._id) {
      ctxDispatch({
        type: 'ADD_ITEM_FAIL',
        payload: t('onlyonesupplier'),
      });
    } else {
      ctxDispatch({
        type: 'ADD_ITEM_ON_CART',
        payload: { ...product, quantity: quantity },
      });
    }
    navegate('/cart')
  };


  const addOnCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);


    if (!selectedColor) {
      toast.error('Por favor, Informe a cor que deseja');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor, Informe o tamanho que deseja');
      return;
    }


    if (data.countInStock < quantity) {
      toast.error('Desculpe, o Produto não está disponível');
      // window.alert(`Desculpe, o Produto não está disponível`);
      return;
    }

    product.color = selectedColor
    product.size = selectedSize


    if (cart.cartItems.length > 0 && product.seller._id !== cart.cartItems[0].seller._id) {
      ctxDispatch({
        type: 'ADD_ITEM_FAIL',
        payload: t('onlyonesupplier'),
      });
    } else {
      ctxDispatch({
        type: 'ADD_ITEM_ON_CART',
        payload: { ...product, quantity: quantity },
      });
    }

    navegate(`/seller/${product.seller._id}`);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Por favor, deixe o seu comentário e Pontuação');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success(data.message);
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
      setRating('');
      setComment('')
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <Container className="product-details-container px-lg-0">
      <Helmet>
        <title>{changelng === 'pt' ? product.nome : product.name} | Visacasa</title>
      </Helmet>

      <Row className="g-5">
        {/* Left Column: Gallery */}
        <Col lg={7} className="reveal">
          <div className="gallery-main-image">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="img-fluid"
            />
          </div>
          <div className="d-flex gap-3 flex-wrap">
            {[product.image, ...product.images].map((x) => (
              <button
                key={x}
                className={`thumbnail-premium btn p-0 ${selectedImage === x || (!selectedImage && x === product.image) ? 'active' : ''}`}
                onClick={() => setSelectedImage(x)}
              >
                <img src={x} alt="Thumbnail" className="w-100 h-100 object-fit-cover" />
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4">
            <h4 className="fw-bold mb-4" style={{ fontFamily: 'Outfit', color: 'var(--slate-900)' }}>{t('productdescription')}</h4>
            <div className="p-4 bg-white rounded-3 shadow-sm border border-light" style={{ whiteSpace: 'pre-wrap', color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              {product.description}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-5 pt-4" ref={reviewsRef}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'Outfit' }}>{t('comments')} ({product.reviews.length})</h4>
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </div>

            {product.reviews.length === 0 ? (
              <MessageBox className="rounded-3">{t('nocomments')}</MessageBox>
            ) : (
              <div className="d-flex flex-column gap-3">
                {product.reviews.map((review) => (
                  <div key={review._id} className="p-4 bg-white rounded-3 border border-light shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-dark">{review.name}</strong>
                      <small className="text-muted">{formatedDate(review.createdAt)}</small>
                    </div>
                    <div className="mb-2">
                      <Rating rating={review.rating} caption=" " />
                    </div>
                    <p className="mb-0 text-muted small">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 p-4 bg-white rounded-3 shadow-sm border border-light">
              <h5 className="fw-bold mb-4">{t('leaveyourcomment')}</h5>
              {userInfo ? (
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase letter-spacing-1">{t('rating')}</Form.Label>
                    <Form.Select
                      className="premium-select"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">{t('select')}</option>
                      <option value="1">1 - Péssimo</option>
                      <option value="2">2 - Aceitável</option>
                      <option value="3">3 - Bom</option>
                      <option value="4">4 - Muito Bom</option>
                      <option value="5">5 - Excelente</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase letter-spacing-1">Comentário</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="premium-select"
                      placeholder="Partilhe a sua experiência..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Form.Group>
                  <Button disabled={loadingCreateReview} className="customButton w-100" type="submit">
                    {loadingCreateReview ? <LoadingBox /> : t('comment')}
                  </Button>
                </Form>
              ) : (
                <MessageBox>
                  {t('please')}{' '}
                  <Link className="link" to={`/signin?redirect=/products/${product._id}`}>
                    {t('login')}
                  </Link>{' '}
                  {t('leaveyourcomment')}
                </MessageBox>
              )}
            </div>
          </div>
        </Col>

        {/* Right Column: Info & Actions */}
        <Col lg={5} className="reveal delay-200">
          <div className="p-lg-4">
            <Badge bg="white" text="primary" className="border border-primary mb-3 px-3 py-2 rounded-pill fw-bold">
              {changelng === 'pt' ? product.conditionStatus?.nome : product.conditionStatus?.name || 'Novo'}
            </Badge>
            <h1 className="product-title-premium">{changelng === 'pt' ? product.nome : product.name}</h1>

            <div className="d-flex align-items-center gap-3 mb-4">
              <Link className="link-none d-flex align-items-center gap-2" to={product.seller ? `/seller/${product.seller._id}` : ''}>
                <div className="bg-light rounded-circle p-1" style={{ width: '40px', height: '40px' }}>
                  <img src={product.seller?.seller?.logo || 'images/visacasa.jpg'} className="w-100 h-100 rounded-circle object-fit-cover" alt="logo" />
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{t('supplier')}</small>
                  <span className="fw-bold text-dark">{product.seller?.seller?.name}</span>
                </div>
              </Link>
            </div>

            <div className="price-tag-premium">
              {product.onSale ? (
                <>
                  <span>{product.discount} MT</span>
                  <span className="text-muted text-decoration-line-through fw-normal" style={{ fontSize: '1.2rem' }}>
                    {product.price} MT
                  </span>
                  <Badge bg="danger" className="ms-2" style={{ fontSize: '0.9rem' }}>-{product.onSalePercentage}%</Badge>
                </>
              ) : <span>{product.price} MT</span>}
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-label"><FaTag className="me-1 opacity-50" /> {t('brand')}</span>
                <span className="spec-value">{product.brand || '---'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label"><FaWarehouse className="me-1 opacity-50" /> {t('quantity')}</span>
                <span className="spec-value">{product.countInStock} {t('unit')}</span>
              </div>
              {product.qualityType && (
                <div className="spec-item">
                  <span className="spec-label"><MdOutlineConstruction className="me-1 opacity-50" /> {t('designation')}</span>
                  <span className="spec-value">{changelng === 'pt' ? product.qualityType.nome : product.qualityType.name}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label"><FaRegClock className="me-1 opacity-50" /> {t('publicationdate')}</span>
                <span className="spec-value">{formatedDate(product.createdAt)}</span>
              </div>
            </div>

            <Card className="action-card-premium mt-4">
              <Card.Body className="p-0">
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t('color')}</Form.Label>
                  <Form.Select className="premium-select" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} required>
                    <option value="">{t('select')}</option>
                    {product.color?.map(color => (
                      <option key={color._id} value={color.name}>
                        {changelng === 'pt' ? color.nome : color.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t('size')}</Form.Label>
                  <Form.Select className="premium-select" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} required>
                    <option value="">{t('select')}</option>
                    {product.size?.map(size => (
                      <option key={size._id} value={size.name}>
                        {changelng === 'pt' ? size.nome : size.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-between mb-4 pb-3 border-bottom border-light">
                  <span className="text-muted">{t('status')}</span>
                  {product.countInStock > 0 ? (
                    <span className="text-success fw-bold"><FaHardHat className="me-1" /> {t('available')}</span>
                  ) : (
                    <span className="text-danger fw-bold">{t('unavailable')}</span>
                  )}
                </div>

                {product.countInStock > 0 && product.seller && (
                  <div className="d-flex flex-column gap-3">
                    <Button className="customButton w-100 py-3" onClick={addOnCartAndRedirectHandler}>
                      {t('addoncartandredirect')}
                    </Button>
                    <Button variant="outline-primary" className="w-100 py-3 rounded-pill fw-bold border-2" onClick={addOnCartHandler}>
                      {t('addoncartandseeseller')}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductScreen;
