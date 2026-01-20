import { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { Carousel } from 'react-responsive-carousel';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHardHat, FaTools, FaPaintRoller, FaBolt, FaShower, FaBoxOpen, FaLayerGroup, FaBuilding, FaWarehouse, FaLightbulb, FaToilet, FaCube, FaTint, FaShieldAlt, FaHammer, FaHome } from 'react-icons/fa';
import { GiBrickWall, GiStoneStack, GiWrench } from 'react-icons/gi';
import { MdWaterDrop, MdOutlineConstruction } from 'react-icons/md';

import Product from '../components/Product';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import SkeletonProduct from '../components/SkeletonProduct';
import CarouselSlide from '../components/CarouselSlide';

import { getError, handleImageError, isValidImageUrl } from '../utils';
import { Store } from '../Store';
import '../styles/HomeScreen.css';

const reducer = (state, action) => {
  console.log('🔄 Reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'FETCH_REQUEST':
      console.log('📥 FETCH_REQUEST - setting loading=true');
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      console.log('✅ FETCH_SUCCESS - setting loading=false');
      return { ...state, loading: false };
    case 'TOP_SELLERS_REQUEST':
      return { ...state, loadingTopUsers: true };
    case 'TOP_SELLERS_SUCCESS':
      return { ...state, topSellers: action.payload, loadingTopUsers: false };
    case 'TOP_SELLERS_FAIL':
      return { ...state, loadingTopUsers: false, errorTopUsers: action.payload };
    case 'CATEGORIES_REQUEST':
      console.log('📂 CATEGORIES_REQUEST - setting loadingCategories=true');
      return { ...state, loadingCategories: true };
    case 'CATEGORIES_SUCCESS':
      const validCategories = Array.isArray(action.payload) ? action.payload : [];
      console.log('✅ CATEGORIES_SUCCESS - setting loadingCategories=false, categories:', validCategories.length);
      return { ...state, categories: validCategories, loadingCategories: false };
    case 'CATEGORIES_FAIL':
      console.log('❌ CATEGORIES_FAIL');
      return { ...state, loadingCategories: false };
    default:
      return state;
  }
};

const getCategoryIcon = (name) => {
  if (!name) return <FaLayerGroup />;
  const lowerName = name.toLowerCase();
  if (lowerName.includes('cimento')) return <FaHardHat />;
  if (lowerName.includes('ferragens')) return <FaTools />;
  if (lowerName.includes('tinta')) return <FaPaintRoller />;
  if (lowerName.includes('elétrica') || lowerName.includes('electricidade')) return <FaBolt />;
  if (lowerName.includes('canalização') || lowerName.includes('esgotos')) return <FaShower />;
  if (lowerName.includes('ferramenta')) return <FaBoxOpen />;
  if (lowerName.includes('aluminio')) return <FaBuilding />;
  if (lowerName.includes('alvenaria')) return <GiBrickWall />;
  if (lowerName.includes('betão') || lowerName.includes('betões')) return <MdOutlineConstruction />;
  if (lowerName.includes('cobertura')) return <FaHome />;
  if (lowerName.includes('iluminação')) return <FaLightbulb />;
  if (lowerName.includes('louça') || lowerName.includes('sanitária')) return <FaToilet />;
  if (lowerName.includes('pre-fabricado')) return <FaCube />;
  if (lowerName.includes('água')) return <FaTint />;
  if (lowerName.includes('revestimento') || lowerName.includes('revistimento')) return <FaBoxOpen />;
  if (lowerName.includes('torneira')) return <MdWaterDrop />;
  if (lowerName.includes('vedação')) return <FaShieldAlt />;
  if (lowerName.includes('impermeabilização')) return <FaShieldAlt />;
  if (lowerName.includes('ferro')) return <FaLayerGroup />;
  if (lowerName.includes('inerte')) return <GiStoneStack />;
  return <FaLayerGroup />;
};

export function HomeScreen() {
  const { t } = useTranslation();
  const { state } = useContext(Store);
  const { changelng } = state;
  const [
    { loading, error, loadingCategories, categories, loadingTopUsers, topSellers },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    loadingCategories: true,
    categories: [],  // Initialize as empty array
    loadingTopUsers: true,
    topSellers: [],  // Initialize as empty array
    errorTopUsers: '',
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState([]);  // Initialize as empty array
  const [showCarouselTopSellers, setShowCarouselTopSellers] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔍 Fetching categories');
        dispatch({ type: 'CATEGORIES_REQUEST' });
        const { data } = await axios.get('/api/categories');
        console.log('✅ Categories received:', data);
        console.log('📂 Categories array:', data.categories);
        console.log('📊 Categories count:', data.categories?.length);
        dispatch({ type: 'CATEGORIES_SUCCESS', payload: data.categories });
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        dispatch({ type: 'CATEGORIES_FAIL' });
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function handleResize() {
      setShowCarouselTopSellers(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔍 Fetching products for page:', page);
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products?page=${page}`);
        console.log('✅ Products received:', data);
        console.log('📦 Products array:', data.products);
        console.log('📊 Products count:', data.products?.length);
        setItems(data.products);
        console.log('💾 Items state updated, new items:', data.products);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchProducts();
  }, [page]);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        dispatch({ type: 'TOP_SELLERS_REQUEST' });
        const { data } = await axios.get('/api/users/top-sellers');
        dispatch({ type: 'TOP_SELLERS_SUCCESS', payload: data.sellers });
      } catch (err) {
        dispatch({ type: 'TOP_SELLERS_FAIL', payload: getError(err) });
      }
    };
    fetchTopSellers();
  }, []);

  const handleShowMore = async () => {
    const newPage = page + 1;
    const { data } = await axios.get(`/api/products?page=${newPage}`);
    setItems([...items, ...data.products]);
    setPage(newPage);
  };

  console.log('🎨 Rendering HomeScreen with:', {
    loading,
    itemsCount: items.length,
    items: items,
    loadingCategories,
    categoriesCount: categories.length,
    categories: categories
  });

  return (
    <Container fluid className="px-lg-5">
      <div className="hero-section mt-4">
        <CarouselSlide />
      </div>

      <section className="mb-5">
        <h3 className="section-title-premium">{t('Explore Categorias')}</h3>
        <div className="categories-grid-premium">
          {loadingCategories ? (
            [1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="category-card-premium skeleton" style={{ height: '120px' }}></div>
            ))
          ) : categories.length === 0 ? (
            <div className="w-100 p-3">
              <MessageBox>Nenhuma categoria encontrada</MessageBox>
            </div>
          ) : (
            <>
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/search?category=${category.nome}`}
                  className="category-card-premium"
                >
                  <span className="category-icon-wrapper">
                    {getCategoryIcon(category.nome)}
                  </span>
                  <span>{changelng === 'pt' ? category.nome : category.name}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      </section>

      <div>
        <h2 className="section-title-premium">
          <FaHome className="text-primary" />
          Produtos em destaque
        </h2>
        <Row>
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Col key={n} xs={6} md={4} lg={3} className="mb-4">
                <SkeletonProduct />
              </Col>
            ))
          ) : items.length === 0 ? (
            <div className="w-100 p-3">
              <MessageBox>Nenhum produto em destaque encontrado</MessageBox>
            </div>
          ) : (
            items.map((product, index) => (
              <Col key={product._id} xs={6} md={4} lg={3} className="mb-4">
                <Product product={product} />
              </Col>
            ))
          )}
        </Row>

        {items.length === pageSize * page && (
          <div className="text-center mt-2 mb-5">
            <Button className="customButton" onClick={handleShowMore}>
              {t('showmore')}
            </Button>
          </div>
        )}
      </div>

      <section className="mb-5 reveal delay-300">
        <h3 className="section-title-premium">{t('thebestsuppliers')}</h3>
        {loadingTopUsers ? (
          <Row>
            {[1, 2, 3, 4].map((n) => (
              <Col key={n} xs={6} md={4} lg={3}>
                <SkeletonProduct />
              </Col>
            ))}
          </Row>
        ) : errorTopUsers ? (
          <MessageBox variant="danger">{errorTopUsers}</MessageBox>
        ) : (
          <>
            {showCarouselTopSellers ? (
              <Carousel
                showArrows={false}
                showStatus={false}
                showThumbs={false}
                infiniteLoop
                autoPlay
                centerMode
                centerSlidePercentage={85}
              >
                {topSellers.map((seller) => (
                  <div key={seller._id} className="px-2">
                    <Product seller={seller} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <Row>
                {topSellers.map((seller) => (
                  <Col key={seller._id} sm={6} md={4} lg={3} className="mb-4">
                    <Product seller={seller} />
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </section>

      <section className="mb-5">
        <h3 className="section-title-premium">{t('Productsforyou')}</h3>
        <Row>
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Col key={n} xs={6} md={4} lg={3} className="mb-4">
                <SkeletonProduct />
              </Col>
            ))
          ) : (
            items.map((product) => (
              <Col key={product._id} xs={6} md={4} lg={3} className="mb-4">
                <Product product={product} />
              </Col>
            ))
          )}
        </Row>

        {items.length === pageSize * page && (
          <div className="text-center mt-2 mb-5">
            <Button className="customButton" onClick={handleShowMore}>
              {t('showmore')}
            </Button>
          </div>
        )}
      </section>
    </Container>
  );
}

export default HomeScreen;
