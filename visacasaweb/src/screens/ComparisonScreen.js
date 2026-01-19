import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Table, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { FaTrash, FaEye } from 'react-icons/fa';

export default function ComparisonScreen() {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { compareProducts } = state;
    const { t } = useTranslation();

    const removeHandler = (product) => {
        ctxDispatch({ type: 'REMOVE_COMPARE', payload: product });
    };

    const clearHandler = () => {
        if (window.confirm(t('clear_compare_confirm', 'Limpar lista de comparação?'))) {
            ctxDispatch({ type: 'CLEAR_COMPARE' });
        }
    };

    return (
        <Container className="my-5">
            <Helmet>
                <title>{t('comparison', 'Comparação de Produtos')} - Visacasa</title>
            </Helmet>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: 'var(--text-dark)' }}>
                    {t('comparison', 'Comparação de Produtos')}
                </h2>
                {compareProducts.length > 0 && (
                    <Button variant="outline-danger" size="sm" onClick={clearHandler}>
                        {t('clear_all', 'Limpar Tudo')}
                    </Button>
                )}
            </div>

            {compareProducts.length === 0 ? (
                <MessageBox>
                    {t('no_comparison', 'Nenhum produto selecionado para comparação.')} {' '}
                    <Link to="/">{t('go_shopping', 'Explorar Loja')}</Link>
                </MessageBox>
            ) : (
                <div className="table-responsive">
                    <Table striped bordered hover className="align-middle bg-white">
                        <thead>
                            <tr className="bg-light">
                                <th style={{ width: '200px' }}>{t('product_details', 'Detalhes')}</th>
                                {compareProducts.map((p) => (
                                    <th key={p._id} className="text-center" style={{ minWidth: '200px' }}>
                                        <div className="d-flex flex-column align-items-center">
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                style={{ height: '100px', objectFit: 'contain' }}
                                                className="mb-2"
                                            />
                                            <div className="fw-bold small">{p.name || p.nome}</div>
                                            <div className="mt-2 d-flex gap-2">
                                                <Link to={`/products/${p._id}`} className="btn btn-sm btn-outline-primary">
                                                    <FaEye />
                                                </Link>
                                                <Button variant="outline-danger" size="sm" onClick={() => removeHandler(p)}>
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="fw-bold">{t('price', 'Preço')}</td>
                                {compareProducts.map((p) => (
                                    <td key={p._id} className="text-center fw-bold text-primary">
                                        {p.onSale ? p.discount : p.price} MT
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="fw-bold">{t('seller', 'Vendedor')}</td>
                                {compareProducts.map((p) => (
                                    <td key={p._id} className="text-center">
                                        {p.seller?.seller?.name || p.seller?.name || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="fw-bold">{t('condition', 'Condição')}</td>
                                {compareProducts.map((p) => (
                                    <td key={p._id} className="text-center">
                                        {p.status || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="fw-bold">{t('stock', 'Stock')}</td>
                                {compareProducts.map((p) => (
                                    <td key={p._id} className="text-center">
                                        {p.countInStock > 0 ? `${p.countInStock} un` : <span className="text-danger">{t('outofstock')}</span>}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
}
