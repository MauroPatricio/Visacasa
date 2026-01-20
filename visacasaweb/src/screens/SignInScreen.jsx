
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import {
  FiMail,
  FiLock,
  FiPhone,
  FiArrowRight,
  FiUserPlus,
  FiRefreshCw,
  FiShoppingBag
} from 'react-icons/fi';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import { Modal, Card } from 'react-bootstrap';
import CountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlToRedirect = new URLSearchParams(search).get('redirect');
  const redirect = urlToRedirect ? urlToRedirect : '/';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/signin', {
        phoneNumber,
        password,
      });

      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      navigate(redirect || '/');
    } catch (err) {
      setIsModalOpen(true);
      setMessage(err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="login-page-premium py-5">
      <Helmet>
        <title>Login - Visacasa</title>
      </Helmet>

      {/* Premium Checkout Steps */}
      <Container className="mb-4 pt-4">
        <div className="checkout-steps-premium">
          <div className="step-item">
            <span className="step-number">1</span>
            <span className="step-label">{t('address') || 'Endereço'}</span>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <span className="step-number">2</span>
            <span className="step-label">{t('paymentmethods') || 'Formas de pagamento'}</span>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <span className="step-number">3</span>
            <span className="step-label">{t('deliveryoptions') || 'Opções de entrega'}</span>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <span className="step-number">4</span>
            <span className="step-label">{t('confirmorder') || 'Confirmar pedido'}</span>
          </div>
        </div>
        <div className="text-center mt-4 mb-3">
          <h5 className="text-primary fw-bold">Faça login para fazer compras</h5>
        </div>
      </Container>

      <Container className="d-flex flex-column align-items-center justify-content-center position-relative" style={{ zIndex: 10 }}>
        <div className="reveal active w-100" style={{ maxWidth: '420px' }}>
          <div className="text-center mb-4">
            <div className="bg-primary-soft p-3 rounded-circle d-inline-flex mb-3">
              <FiShoppingBag className="text-primary fs-2" />
            </div>
            <h1 className="h1-premium mb-2">{t('login')}</h1>
            <p className="text-muted small px-4">
              Acesse sua conta para continuar sua jornada na maior plataforma de materiais de construção.
            </p>
          </div>

          <Card className="border-0 shadow-premium overflow-hidden position-relative" style={{ borderRadius: '28px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.4)', zIndex: 100 }}>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-4" controlId="phoneNumber">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-2 ls-tight">
                    <FiPhone className="text-primary" />
                    {t('phone')}
                    <span className="ms-auto d-flex align-items-center gap-2 opacity-75">
                      <CountryFlag countryCode="MZ" svg />
                      [+258]
                    </span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-premium"
                    required
                    placeholder="Número de telefone ou email"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-2 ls-tight">
                    <FiLock className="text-primary" /> {t('password')}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    className="form-control-premium"
                    required
                    placeholder="******"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button
                  className="w-100 btn-premium py-3 mb-4 mt-2 d-flex align-items-center justify-content-center gap-2"
                  type="submit"
                >
                  {t('login')} <FiArrowRight />
                </Button>

                <div className="d-flex flex-column gap-3 text-center border-top pt-4">
                  <div className="small text-muted">
                    {t('newaccount')}?{' '}
                    <Link className="text-primary fw-bold text-decoration-none hover-underline" to={`/signup?redirect=${redirect}`}>
                      <FiUserPlus className="me-1" /> {t('createaccount')}
                    </Link>
                  </div>
                  <div className="small text-muted">
                    {t('forgotpassword')}?{' '}
                    <Link className="text-primary fw-bold text-decoration-none hover-underline" to={`/forget-password`}>
                      <FiRefreshCw className="me-1" /> {t('updatepassword')}
                    </Link>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>

      <div className="login-bg-overlay"></div>

      <Modal show={isModalOpen} onHide={closeModal} centered className="premium-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-danger">{t('accesserror') || 'Erro de Acesso'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-muted">
          {message}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="danger" className="rounded-pill px-4" onClick={closeModal}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .login-page-premium {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #f8fafc;
        }
        .login-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.4)), url('/images/login-premium-bg.jpg');
          background-size: cover;
          background-position: center;
          z-index: 1;
        }
        .checkout-steps-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 100px;
        }
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--slate-700);
          font-size: 0.9rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
          text-align: center;
          max-width: 100px;
        }
        .step-connector {
          width: 30px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 -8px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .checkout-steps-premium {
            gap: 4px;
          }
          .step-item {
            min-width: 70px;
          }
          .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
          }
          .step-label {
            font-size: 0.65rem;
            max-width: 70px;
          }
          .step-connector {
            width: 15px;
            margin: 0 -4px;
          }
        }
        .form-control-premium {
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          background: #fdfdfd;
          transition: var(--transition);
        }
        .form-control-premium:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(232, 90, 79, 0.1);
        }
        .btn-premium {
          background: var(--primary-gradient);
          border: none;
          border-radius: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 10px 15px -3px rgba(232, 90, 79, 0.4);
          transition: var(--transition);
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(232, 90, 79, 0.4);
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
        .premium-modal .modal-content {
          border-radius: 24px;
          border: none;
          box-shadow: var(--shadow-premium);
        }
      `}</style>
    </div>
  );
}
