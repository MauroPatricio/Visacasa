import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { truncateString, handleImageError, isValidImageUrl } from '../utils';
import Badge from 'react-bootstrap/esm/Badge';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { Store } from '../Store';
import { FaHeart, FaRegHeart, FaExchangeAlt } from 'react-icons/fa';
import '../index.css';
import '../styles/Product.css';

function Product(props) {
  const { product, seller } = props;
  const { t } = useTranslation();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { changelng, favorites, compareProducts } = state;

  const isFavorite = product && favorites.find((x) => x._id === product._id);
  const isInCompare = product && compareProducts.find((x) => x._id === product._id);

  const toggleFavoriteHandler = () => {
    if (isFavorite) {
      ctxDispatch({ type: 'REMOVE_FAVORITE', payload: product });
    } else {
      ctxDispatch({ type: 'ADD_FAVORITE', payload: product });
    }
  };

  const toggleCompareHandler = () => {
    if (isInCompare) {
      ctxDispatch({ type: 'REMOVE_COMPARE', payload: product });
    } else {
      ctxDispatch({ type: 'ADD_COMPARE', payload: product });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {product && (
        <Card className="product-card-premium border-0" >
          {product.onSale && <div className="badge-onsale">{t('onsale')} {product.onSalePercentage}%</div>}

          <Link to={`/products/${product._id}`}>
            <div className="product-image-container">
              <img
                src={isValidImageUrl(product.image) ? product.image : '/default_img.jpg'}
                alt={product.name}
                onError={handleImageError}
              />
            </div>
          </Link>

          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <Link className="link-none" to={`/products/${product._id}`}>
                <h6 className="mb-0 fw-bold" style={{ color: 'var(--slate-900)' }}>
                  {changelng === 'pt' ? truncateString(product.nome, 30) : truncateString(product.name, 30)}
                </h6>
              </Link>
            </div>

            <div className="mb-2">
              <span className="unit-tag">
                {product.isOrdered ? t('makeorder') : product.countInStock !== 0 ? `${product.countInStock} unidades` : t('outofstock')}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-end">
              <div>
                <Link
                  className="link-none d-block mb-1"
                  style={{ fontSize: '0.75rem', color: 'var(--slate-700)' }}
                  to={product.seller ? `/seller/${product.seller._id}` : ''}
                >
                  {product.seller?.seller?.name || ''}
                </Link>
                <div className="price-premium" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {product.onSale ? (
                    <>
                      <span>{product.discount} MT</span>
                      <small className="ms-2 text-muted text-decoration-line-through" style={{ fontSize: '0.8rem', fontWeight: '400' }}>
                        {product.price} MT
                      </small>
                    </>
                  ) : <span>{product.price} MT</span>}
                </div>
              </div>

              <div className="d-flex gap-2 mb-1">
                <button
                  className={`btn-action-custom ${isInCompare ? 'active' : ''}`}
                  onClick={toggleCompareHandler}
                  title={t('compare')}
                >
                  <FaExchangeAlt size={14} />
                </button>
                <button
                  className={`btn-action-custom favorite ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavoriteHandler}
                  title={t('favorite')}
                >
                  {isFavorite ? <FaHeart color="var(--primary)" size={14} /> : <FaRegHeart size={14} />}
                </button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {seller && (
        <Card className="product-card-premium border-0 zoom-image">
          <Link to={seller.seller ? `/seller/${seller._id}` : ''}>
            <div className="product-image-container p-4">
              <img
                src={isValidImageUrl(seller.seller.logo) ? seller.seller.logo : '/default_img.jpg'}
                alt={seller.seller.name}
                style={{ borderRadius: '50%' }}
                onError={handleImageError}
              />
            </div>
          </Link>
          <Card.Body className="text-center p-3">
            <Link className="link-none" to={seller.seller ? `/seller/${seller._id}` : ''}>
              <h6 className="fw-bold mb-1">{truncateString(seller.seller.name, 30)}</h6>
            </Link>
            <p className="small text-muted mb-0">{truncateString(seller.seller.description, 30)}</p>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default Product;
