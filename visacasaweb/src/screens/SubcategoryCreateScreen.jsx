import React, { useContext, useReducer, useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';

import Container from 'react-bootstrap/Container';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {

    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };

    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false
      };

    case 'CREATE_FAIL':
      return { ...state, error: action.payload, loadingCreate: false };

    default:
      return state
  }
}
export default function SubcategoryCreateScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingCreate }, dispatch] = useReducer(reducer, { loading: false, error: '' });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(data.categories);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(`/api/subcategories/`, {
        name,
        description,
        category
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Subcategoria Criada com Sucesso');
      navigate('/subcategoryList/');

    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
    }
  }


  return (
    <Container className='small-container'>
      <Helmet>
        <title>Criar Subcategoria </title>
      </Helmet>
      <h1> Criar Subcategoria</h1>

      {loading ? (<LoadingBox></LoadingBox>) : error ? <MessageBox>{error}</MessageBox> : <>
        <Form onSubmit={submitHandler}>
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label>Nome</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>

          <Form.Group className='mb-3' controlId='description'>
            <Form.Label>Descrição</Form.Label>
            <Form.Control value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Categoria Pai</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className='"mb-3'>
            <Button className="customButtom" variant='light' type='submit' disabled={loadingCreate}>Registar</Button>
            {loadingCreate && <LoadingBox />}
          </div>
        </Form>
      </>}
    </Container>
  )
}
