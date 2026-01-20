import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Store } from '../Store';
import Product from '../components/Product';
import MessageBox from '../components/MessageBox';
import { Link } from 'react-router-dom';

export default function FavoritesScreen() {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { favorites } = state;
    const { t } = useTranslation();

    return (
        <Container className="my-5">
            <Helmet>
                <title>{t('favorites', 'Meus Favoritos')} - Visacasa</title>
            </Helmet>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: 'var(--text-dark)' }}>
                    {t('favorites', 'Meus Favoritos')}
                </h2>
                {favorites.length > 0 && (
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                            if (window.confirm(t('clear_favorites_confirm', 'Tem certeza que deseja limpar todos os favoritos?'))) {
                                favorites.forEach(product => ctxDispatch({ type: 'REMOVE_FAVORITE', payload: product }));
                            }
                        }}
                    >
                        {t('clear_all', 'Limpar Tudo')}
                    </Button>
                )}
            </div>

            {favorites.length === 0 ? (
                <MessageBox>
                    {t('no_favorites', 'Você ainda não tem produtos favoritos.')} {' '}
                    <Link to="/">{t('go_shopping', 'Ir para a loja')}</Link>
                </MessageBox>
            ) : (
                <Row>
                    {favorites.map((product) => (
                        <Col key={product._id} sm={6} md={4} lg={3} className="mb-4">
                            <Product product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}
