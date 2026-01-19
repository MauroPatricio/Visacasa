import React, { useEffect } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaRegLightbulb,
  FaCreditCard,
  FaThList,
  FaRegComments,
  FaShippingFast,
  FaRegPaperPlane
} from 'react-icons/fa';

export default function VisacasaBenef() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    {
      icon: <FaRegLightbulb className="benefit-icon" />,
      title: t('comodidade', 'Comodidade'),
      text: t('comodidade_text', 'Pela Visacasa tens a possibilidade de fazer compras sem sair de onde está, economizando assim o seu tempo e dinheiro.')
    },
    {
      icon: <FaCreditCard className="benefit-icon" />,
      title: t('varias_formas_pagamento', 'Várias formas de pagamento'),
      text: t('pagamento_text', 'Temos variadas formas de pagamentos como: Mpesa, e-Mola e BCI. Muitas vezes, as lojas físicas só possuem uma forma de pagamento restrita.')
    },
    {
      icon: <FaThList className="benefit-icon" />,
      title: t('opcoes_diversas', 'Opções diversas de produtos'),
      text: t('opcoes_text', 'Possuímos um catálogo amplo de produtos onde o usuário tem a possibilidade de escolher livremente qual produto atende seu gosto.')
    },
    {
      icon: <FaRegComments className="benefit-icon" />,
      title: t('opiniao_usuarios', 'Opinião de outros usuários'),
      text: t('opiniao_text', 'Na Visacasa tens a possibilidade de visualizar os comentários e opiniões de outros usuários sobre a venda ou produto.')
    },
    {
      icon: <FaShippingFast className="benefit-icon" />,
      title: t('entregas', 'Entregas'),
      text: t('entregas_text', 'Possuímos entregadores de confiança e garantimos que a sua encomenda ou pedido chegue de forma rápida, fácil e segura.')
    },
    {
      icon: <FaRegPaperPlane className="benefit-icon" />,
      title: t('acompanhamento_pedidos', 'Acompanhamento de pedidos'),
      text: t('acompanhamento_text', 'Pela nossa plataforma tens a possibilidade de acompanhar por etapas o processamento de seus pedidos por SMS e/ou emails.')
    }
  ];

  return (
    <Container className="py-5 mt-5">
      <Helmet>
        <title>{t('benefits_title', 'Benefícios de comprar na Visacasa')}</title>
      </Helmet>

      <div className="text-center mb-5">
        <h2 className="display-4 fw-bold mb-4" style={{ color: 'var(--primary-color)' }}>
          {t('benefits_header', 'Benefícios de comprar na Visacasa')}
        </h2>
        <p className="lead mx-auto" style={{ maxWidth: '800px', color: 'var(--text-light)' }}>
          {t('benefits_intro', 'Comprar pela internet tornou-se um hábito e cada vez mais pessoas têm se adaptado à era digital. Na Visacasa, oferecemos uma série de vantagens exclusivas para garantir a melhor experiência de compra.')}
        </p>
      </div>

      <Row g={4}>
        {benefits.map((benefit, index) => (
          <Col key={index} lg={4} md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm benefit-card">
              <Card.Body className="p-4 text-center">
                <div className="benefit-icon-container mb-4">
                  {benefit.icon}
                </div>
                <Card.Title className="h4 fw-bold mb-3">{benefit.title}</Card.Title>
                <Card.Text className="text-muted">
                  {benefit.text}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .benefit-card {
          border-radius: 20px;
          transition: all 0.3s ease;
          background: #fff;
        }
        .benefit-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }
        .benefit-icon-container {
          width: 80px;
          height: 80px;
          background: var(--primary-gradient);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 2rem;
          box-shadow: 0 8px 15px rgba(232, 90, 79, 0.2);
        }
        .benefit-icon {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
      `}</style>
    </Container>
  );
}
