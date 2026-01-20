import React, { useContext, useEffect, useReducer, useState, } from 'react'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

        case 'FETCH_REQUEST':
            return { ...state, loading: true };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false, category: action.payload
            };

        case 'FETCH_FAIL':
            return { ...state, error: action.payload, loadingEdit: false };

        case 'EDIT_REQUEST':
            return { ...state, loadingEdit: true };

        case 'EDIT_SUCCESS':
            return {
                ...state,
                loadingEdit: false
            };

        case 'EDIT_FAIL':
            return { ...state, error: action.payload, loadingEdit: false };

        default:
            return state
    }
}
export default function SubcategoryEditScreen() {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;

    const params = useParams();
    const { id: subcategoryId } = params;


    const [{ loading, error, loadingEdit }, dispatch] = useReducer(reducer, { loadingEdit: false, error: '' });

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isActive, setIsActive] = useState(false);
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

        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' })
                const { data } = await axios.get(`/api/subcategories/${subcategoryId}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });

                setName(data.name);
                setDescription(data.description);
                setCategory(data.category ? data.category._id || data.category : ''); // Handle populated or unpopulated
                setIsActive(data.isActive);

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
            }
        }

        fetchCategories();
        fetchData();

    }, [userInfo, subcategoryId]);


    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            dispatch({ type: 'EDIT_REQUEST' });
            await axios.put(`/api/subcategories/${subcategoryId}`, {
                name,
                description,
                category,
                isActive
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            dispatch({ type: 'EDIT_SUCCESS' });
            toast.success('Subcategoria Actualizada com Sucesso');
            navigate('/subcategoryList/');

        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'EDIT_FAIL' });
        }
    }


    return (
        <Container className='small-container'>
            <Helmet>
                <title>Editar Subcategoria </title>
            </Helmet>
            <h1> Editar Subcategoria</h1>

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

                    <Form.Check
                        className="mb-3"
                        type="checkbox"
                        id="isActive"
                        label="Esta Activo?"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    ></Form.Check>

                    <div className='"mb-3'>
                        <Button className="customButtom" variant='light' type='submit' disabled={loadingEdit}>Actualizar</Button>
                        {loadingEdit && <LoadingBox />}
                    </div>
                </Form>
            </>}
        </Container>
    )
}
