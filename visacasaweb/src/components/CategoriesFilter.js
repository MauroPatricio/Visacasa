import axios from 'axios';
import React, { useContext, useEffect, useState, useReducer } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { getError } from '../utils';
import Rating from './Rating';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlus, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FaUsers, FaSortAlphaDownAlt, FaMoneyBillWaveAlt, FaSearchLocation, FaStarHalfAlt } from 'react-icons/fa';
import { ImPriceTags } from 'react-icons/im';
import { useTranslation } from 'react-i18next';
import { Store } from '../Store';

// 🔹 Reducer para gerenciar categorias e províncias
const reducer = (state, action) => {
  switch (action.type) {
    case 'CATEGORIES_SUCCESS':
      return { ...state, categories: action.payload.categories };
    case 'PROVINCE_SUCCESS':
      return { ...state, provinces: action.payload.provinces };
    default:
      return state;
  }
};

export default function CategoriesFilter() {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get('category') || 'all';
  const province = searchParams.get('province') || 'all';
  const price = searchParams.get('price') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const order = searchParams.get('order') || 'newest';
  const page = searchParams.get('page') || 1;
  const { t } = useTranslation();
  const { state } = useContext(Store);
  const { changelng } = state;

  // 🔹 Estado para abrir/fechar o filtro
  const [isOpen, setIsOpen] = useState(window.innerWidth > 540);

  // 🔹 Ajusta o estado com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth > 540);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔹 Função para alternar a visibilidade do filtro
  const toggleFilter = () => setIsOpen(!isOpen);

  // 🔹 Estados de categorias e províncias com reducer
  const [{ categories, provinces }, dispatch] = useReducer(reducer, {
    categories: [],
    provinces: [],
  });

  // 🔹 Busca categorias e províncias
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get('/api/categories');
      dispatch({ type: 'CATEGORIES_SUCCESS', payload: data });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get('/api/provinces');
      dispatch({ type: 'PROVINCE_SUCCESS', payload: data });
    };
    fetchData();
  }, []);

  // 🔹 Gera URLs para os filtros
  const getFilterUrl = (filter) => {
    return `/search?category=${filter.category || category}&price=${filter.price || price}&rating=${filter.rating || rating}&order=${filter.order || order}&page=${filter.page || page}&province=${filter.province || province}`;
  };

  const getSellersUrl = () => `/sellers?sellers=sellers&page=${page}`;
  const getOnSaleUrl = () => `/onsale?onsale=onsale&page=${page}`;

  return (
    <Card>
      {/* 🔹 Cabeçalho do Filtro (Sempre visível) */}
      <Card.Header onClick={toggleFilter} style={{ cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}>
        <FontAwesomeIcon icon={faList} /> {t('searchfilters')} <FontAwesomeIcon icon={isOpen ? faCaretDown : faPlus} />
      </Card.Header>

      {/* 🔹 Corpo do Filtro (Só aparece se estiver aberto) */}
      {isOpen && (
        <Card.Body>
          {/* 🔹 Fornecedores */}
          <Link to={getSellersUrl()} className='text-bold link-none'>
            <h6><FaUsers /> {t('allsuppliers')}</h6>
          </Link>

          {/* 🔹 Promoções */}
          <Link to={getOnSaleUrl()} className='text-bold link-none'>
            <h6><ImPriceTags /> {t('onsale')}</h6>
          </Link>

          {/* 🔹 Categorias */}
          <h6><FaSortAlphaDownAlt /> {t('categories')}:</h6>
          <ul>
            <li>
              <Link to={getFilterUrl({ category: 'all' })} className='text-bold link-none'>{t('allcategories')}</Link>
            </li>
            {categories.map((c) => (
              <li key={c._id}>
                <Link to={getFilterUrl({ category: c._id })} className='link-none'>
                  {changelng === 'pt' ? c.nome : c.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* 🔹 Intervalo de Preços */}
          <h6><FaMoneyBillWaveAlt /> {t('intervalpricing')}:</h6>
          <Link to={getFilterUrl({ price: 'all' })} className='text-bold link-none'>
            <li>{t('allprices')}</li>
          </Link>

          {/* 🔹 Localização */}
          <h6><FaSearchLocation /> {t('location')}:</h6>
          <Link to={getFilterUrl({ province: 'all' })} className='text-bold link-none'>
            <li>{t('alllocations')}</li>
          </Link>
          <ul>
            {provinces.map((p) => (
              <li key={p._id}>
                <Link to={getFilterUrl({ province: p._id })} className='link-none'>{p.name}</Link>
              </li>
            ))}
          </ul>

          {/* 🔹 Avaliação */}
          <h6><FaStarHalfAlt /> {t('scores')}</h6>
          <Rating caption=' & acima' rating={0} />
        </Card.Body>
      )}
    </Card>
  );
}
