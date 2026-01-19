import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { getError, truncateString } from '../utils';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useTranslation } from 'react-i18next';
// import { Store } from '../Store';
import '../styles/CarouselSlide.css'; // Arquivo de estilos separado

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

export default function CarouselSlide() {
  const { t } = useTranslation();
  const [{ popularItems, loadingPopular }, dispatch] = useReducer(reducer, {
    loadingPopular: true,
    error: '',
  });

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
    <div className="carousel-custom-wrapper">
      <Carousel
        showArrows={false}
        infiniteLoop
        autoPlay
        interval={5000}
        showThumbs={false}
        showIndicators={true}
        swipeable
        emulateTouch
        showStatus={false}
        className="carousel-custom"
      >
        {popularItems &&
          popularItems.map((p) => (
            <Link className="carousel-link" to={`/products/${p._id}`} key={p._id}>
              <div className="carousel-slide">
                <img className="carousel-image" src={p.image} alt={p.name} />

                <div className="carousel-caption-premium">
                  {p.onSale && (
                    <div className="sale-badge-premium">
                      {t('onsale')} - {p.onSalePercentage * 100}% OFF
                    </div>
                  )}
                  <h2>{truncateString(p.name, 40)}</h2>
                  <Button className="customButton">{t('shopnow')}</Button>
                </div>
              </div>
            </Link>
          ))}
      </Carousel>
    </div>
  );
}
