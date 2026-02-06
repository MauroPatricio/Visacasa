import React, { useContext, useEffect, useReducer, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
// import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import CheckoutSteps from '../components/CheckoutSteps';
import Card from 'react-bootstrap/Card';
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import { FaPencilAlt } from "react-icons/fa";
import { Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import { useTranslation } from 'react-i18next';



const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };

    case 'CREATE_SUCCESS':
      return { ...state, loading: false };

    case 'CREATE_FAIL':
      return { ...state, loading: false };

    case 'CREATE_MPESA_REQUEST':
      return { ...state, loadingPayment: true, paymentError: null, paymentProgress: 'initiating' };

    case 'CREATE_MPESA_SUCCESS':
      return { ...state, paymentMpesa: action.payload, loadingPayment: false, paymentProgress: 'success', paymentError: null };

    case 'CREATE_MPESA_FAIL':
      return { ...state, loadingPayment: false, paymentProgress: 'failed', paymentError: action.payload };

    case 'PAYMENT_PROGRESS':
      return { ...state, paymentProgress: action.payload };

    case 'PAYMENT_RESET':
      return { ...state, loadingPayment: false, paymentProgress: null, paymentError: null };

    case 'SELLER_DETAILS_REQUEST':
      return { ...state, loadingSeller: true };

    case 'SELLER_DETAILS_SUCCESS':
      return { ...state, sellerDetails: action.payload, loadingSeller: false };

    case 'SELLER_DETAILS_FAIL':
      return { ...state, errorSeller: action.payload, loadingSeller: false };

    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const { t } = useTranslation();

  const [{ loading, loadingPayment, paymentProgress, paymentError }, dispatch] = useReducer(reducer, {
    loading: false,
    loadingPayment: false,
    paymentProgress: null,
    paymentError: null
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const navigate = useNavigate();
  const { cart, userInfo } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalMpesa, setIsModalMpesa] = useState(false);
  const [isModalStock, setIsModalStock] = useState(false);
  const [isModalDelayOrder, setIsModalDelayOrder] = useState(false);
  const [itemOutOfStock, setItemOutOfStock] = useState([]);
  const [phoneNumberError, setPhoneNumberError] = useState('');

  let [customerNumber, setCustomerNumber] = useState(null);


  const [message] = useState(t('makelogin'));

  const [sellerDayInfo, setSellerDayInfo] = useState(<span style={{ color: 'red' }}>[{t('closestore')}]</span>);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const redirectCart = () => {
    navigate('/cart');
  }

  const closeModalMpesa = () => {
    setIsModalMpesa(false);
    dispatch({ type: 'PAYMENT_RESET' });
    setEscolha(null);
    setValorInput('');
    setPhoneNumberError('');
  };

  const closeModalStock = () => {
    setIsModalStock(false)
    setIsModalMpesa(false);
    setIsModalOpen(false);
    setIsModalDelayOrder(false)
    return
  }

  const closeModalDelay = () => {

    setIsModalDelayOrder(false)
    return
  }



  const loginRedirect = () => {
    navigate('/signin?redirect=/placeorder');
  };

  const {
    cart: { address },
  } = state;

  useEffect(() => {
    if (!address.address) {
      navigate('/address');
    }
  }, [address, navigate]);

  const [sellerId, setSellerId] = useState('');
  const [seller, setSeller] = useState({});


  // Estado para rastrear a escolha do usuário
  const [escolha, setEscolha] = useState(null);

  // Estado para rastrear o valor do campo de input condicional
  const [valorInput, setValorInput] = useState('');

  // Função para atualizar o estado de escolha
  const handleEscolhaChange = (event) => {
    if (userInfo) {
      const novaEscolha = event.target.value;
      setEscolha(novaEscolha);
      setCustomerNumber(userInfo && userInfo.phoneNumber)

      // Limpar o valor do input quando a escolha mudar
      setValorInput('');
    }
  };

  // Função para lidar com a mudança no campo de input
  const handleInputChange = (event) => {
    const novoValor = event.target.value.replace(/\D/g, ''); // Only numbers
    if (novoValor.length <= 9) {
      setValorInput(novoValor);
      if (novoValor.length === 9) {
        setPhoneNumberError('');
      }
    }
  };

  const paymentMpesa = async () => {
    // Validate phone number
    if (escolha === 'opcao2' && valorInput.length !== 9) {
      setPhoneNumberError(t('validatenumber'));
      return;
    }

    if (!escolha) {
      setPhoneNumberError(t('whichnumbertopay'));
      return;
    }

    if (valorInput) {
      customerNumber = valorInput;
    }
    customerNumber = '258' + customerNumber;

    const amount = parseFloat(cart.totalPrice);

    try {
      dispatch({ type: 'CREATE_MPESA_REQUEST' });
      dispatch({ type: 'PAYMENT_PROGRESS', payload: 'initiating' });

      const { data } = await axios.post(`/api/payments/mpesa/c2b`, { customerNumber, amount }, {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
      });

      dispatch({ type: 'PAYMENT_PROGRESS', payload: 'processing' });

      if (data.paid) {
        dispatch({ type: 'PAYMENT_PROGRESS', payload: 'confirming' });

        try {
          dispatch({ type: 'CREATE_REQUEST' });
          const order = await axios.post(
            '/api/orders',
            {
              orderItems: cart.cartItems,
              address: cart.address,
              paymentMethod: cart.paymentMethod,
              itemsPrice: cart.itemsPrice,
              ivaTax: cart.ivaTax,
              siteTax: cart.siteTax,
              taxPrice: cart.taxPrice,
              totalPrice: cart.totalPrice,
              addressPrice: cart.addressPrice,
              itemsPriceForSeller: cart.itemsPriceForSeller,
              isPaid: data.paid,
              paidAt: Date.now(),
              stepStatus: 1
            },
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );

          dispatch({ type: 'CREATE_MPESA_SUCCESS', payload: data });
          toast.success(t('paymentsuccess'));

          // Show success state for 2 seconds before redirecting
          setTimeout(() => {
            ctxDispatch({ type: 'CART_CLEAR' });
            dispatch({ type: 'CREATE_SUCCESS' });
            navigate(`/order/${order.data.order._id}`);
          }, 2000);

        } catch (err) {
          const errorMsg = getError(err);
          dispatch({ type: 'CREATE_MPESA_FAIL', payload: errorMsg });
          toast.error(errorMsg);
        }
      } else {
        let errorMessage = t('paymentfailed');

        if (data.code === 'INS-1') {
          errorMessage = 'Erro Interno';
        } else if (data.code === 'INS-4') {
          errorMessage = 'Conta inactiva';
        } else if (data.code === 'INS-5') {
          errorMessage = 'Transação cancelada pelo utilizador';
        } else if (data.code === 'INS-6') {
          errorMessage = 'Transação falhada';
        } else if (data.code === 'INS-9') {
          errorMessage = 'Tempo de espera excedido';
        } else if (data.code === 'INS-2006') {
          errorMessage = 'Saldo insuficiente';
        } else if (data.code === 'INS-2051') {
          errorMessage = 'Número de telefone inválido';
        }

        dispatch({ type: 'CREATE_MPESA_FAIL', payload: errorMessage });
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMsg = getError(err);
      dispatch({ type: 'CREATE_MPESA_FAIL', payload: errorMsg });
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        dispatch({ type: 'SELLER_DETAILS_REQUEST' });
        setSellerId(cart.cartItems && cart.cartItems[0].seller._id);

        const { data } = await axios.get(`/api/users/${sellerId}`, {});
        setSeller(data)
        dispatch({ type: 'SELLER_DETAILS_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'SELLER_DETAILS_FAIL', payload: getError(err) });
      }
    };
    fetchSellerDetails();
  }, [dispatch, sellerId, cart.cartItems]);

  useEffect(() => {
    // Get the current time
    const currentTime = new Date();
    const currentDay = currentTime.getDay();


    const hours = currentTime.getHours().toString().padStart(2, '0'); // Get the hours and pad with leading 0 if needed
    const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Get the minutes and pad with leading 0 if needed

    const formattedDatetime = `${hours}:${minutes}`;

    if (seller && seller.seller !== undefined) {

      seller.seller.workDayAndTime.map(async workday => {

        if (workday.dayNumber === currentDay) {

          if (workday.opentime <= formattedDatetime && formattedDatetime <= workday.closetime) {
            setSellerDayInfo(<span style={{ color: 'green' }}>[{t('openstore')}]</span>)
            return
          }
        }
      })
    }
  }, [seller, t]);




  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 1234.3213123 => 1234.32

  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => c.onSale ? a + c.quantity * c.discount : a + c.quantity * c.price, 0)
  );

  cart.addressPrice = cart && cart.deliveryOptionValue === 'withoutDelivery' ? 0 : cart.address.city === 'Maputo Cidade' ? 150 : 300;
  cart.siteTax = 40;
  cart.ivaTax = round2(0.16 * cart.itemsPrice);


  cart.totalPrice =
    (cart.itemsPrice + cart.addressPrice + cart.siteTax + cart.ivaTax).toFixed(2);

  let itemsPriceForSeller = 0;
  cart.cartItems && cart.cartItems.forEach((item) => {
    if (item.onSale) {
      itemsPriceForSeller = itemsPriceForSeller + (item.priceFromSeller - item.priceFromSeller * item.onSalePercentage) * item.quantity
    } else {
      itemsPriceForSeller = itemsPriceForSeller + item.priceFromSeller * item.quantity
    }
  })

  cart.itemsPriceForSeller = itemsPriceForSeller


  useEffect(() => {

    cart.cartItems.map(async item => {
      const { data } = await axios.get(`/api/products/${item._id}`);

      if (data.countInStock < item.quantity) {
        setItemOutOfStock(item)
        setIsModalStock(true)
        setIsModalMpesa(false)
        setIsModalOpen(false)
        return
      }
      if (cart.paymentMethod === 'Emola' && item.isOrdered && cart.cartItems.length > 1) {
        setItemOutOfStock(item)
        setIsModalDelayOrder(true)
        return
      }
      if (cart.paymentMethod === 'BCI' && item.isOrdered && cart.cartItems.length > 1) {
        setItemOutOfStock(item)
        setIsModalDelayOrder(true)
        return
      }
      if (cart.paymentMethod === 'Dinheiro' && item.isOrdered && cart.cartItems.length > 1) {
        setItemOutOfStock(item)
        setIsModalDelayOrder(true)
        return
      }
    });
    window.scrollTo(0, 0);
  }, [cart.cartItems, cart.paymentMethod]);

  const placeOrderHandler = async () => {

    // Get the current time
    const currentTime = new Date();
    // const currentDay = currentTime.getDay();


    const hours = currentTime.getHours().toString().padStart(2, '0'); // Get the hours and pad with leading 0 if needed
    const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Get the minutes and pad with leading 0 if needed

    // const formattedDatetime = `${hours}:${minutes}`;



    // esta tudo bem passa.
    // Esta dentro do periodo informado
    if (userInfo) {
      cart.cartItems.map(async item => {
        const { data } = await axios.get(`/api/products/${item._id}`);

        if (data.countInStock < item.quantity) {
          setItemOutOfStock(item)
          setIsModalStock(true)
          setIsModalMpesa(false)
          setIsModalOpen(false)
          return
        }
        if (cart.paymentMethod === 'Emola' && item.isOrdered) {
          setItemOutOfStock(item)
          setIsModalDelayOrder(true)
          return
        }
      });

      try {
        dispatch({ type: 'CREATE_REQUEST' });

        if (cart.paymentMethod === 'Mpesa') {
          setIsModalMpesa(true)
          return
        }

        const { data } = await axios.post(
          '/api/orders',
          {
            orderItems: cart.cartItems,
            address: cart.address,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            ivaTax: cart.ivaTax,
            siteTax: cart.siteTax,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
            addressPrice: cart.addressPrice,
            itemsPriceForSeller: cart.itemsPriceForSeller,
            isPaid: false

          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        ctxDispatch({ type: 'CART_CLEAR' });
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/order/${data.order._id}`);
        toast.success('Pedido efectuado com sucesso');
      } catch (err) {
        toast.error(getError(err));
      }
    }



    // Compare the current time with the threshold
    // const isPastThreshold =
    //   currentHour > thresholdHour ||
    //   (currentHour === thresholdHour && currentMinute >= thresholdMinute);

    if (!userInfo) {
      setIsModalOpen(true)
      return
    }

    if (userInfo) {
      setCustomerNumber(userInfo.phoneNumber)
      return
    }


  };

  return (
    <div>
      <Helmet>
        <title>{t('confirmorder')}</title>
      </Helmet>

      <CheckoutSteps step1 step2 step3 step4 ></CheckoutSteps>
      <h1>{t('confirmorder')} - {sellerDayInfo}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>
                <span>{t('deliverydetails')}</span>
              </Card.Title>
              <Card.Text>
                <strong>{t('nameoforderreceiver')}:</strong> {cart.address.fullName}
                <br />
                <strong>{t('numbertocall')}:</strong>
                {cart.address.phoneNumber}, {cart.address.alternativePhoneNumber}
                <br />
                <strong>{t('deliveryaddress')}:</strong> {cart.address.city},{' '}
                {cart.address.address}, {cart.address.referenceAddress}.
              </Card.Text>
              <Link className="link" to="/address">
                {t('changedelivdetails')} <FaPencilAlt />
              </Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>
                <strong>{t('paymentmethod')}</strong>
              </Card.Title>
              <Card.Text>{cart.paymentMethod}</Card.Text>
              <Link className="link" to="/payment">
                {t('changepayment')} <FaPencilAlt />
              </Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>
                <span>{t('productsinthecart')}: {' '}
                  <Link className="link" to={`/seller/${cart.cartItems[0] && cart.cartItems[0].seller && cart.cartItems[0].seller.seller && cart.cartItems[0].seller._id}`}>
                    <b className='link'>{cart.cartItems[0] && cart.cartItems[0].seller && cart.cartItems[0].seller.seller && cart.cartItems[0].seller.seller.name}</b>
                  </Link>

                </span>
              </Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col mb={7}>
                        <img
                          src={item.image}
                          alt={item.image}
                          className="img-fluid rounded img-thumbnail"
                        />
                        <p></p>
                        <Link className="link link-none" to={`/product/${item.slug}`}>
                          {t('product')}: <b>{item.name}</b><br />{t('color')}:<b>{item.color}</b>{' '} {t('size')}:<b>{item.size}</b><br />
                          {' '} {item.onSale && t('deliveryestimate')}{item.onSale && ':'}{item.onSale && item.orderPeriod}

                        </Link>
                      </Col>
                      <Col mb={2}>
                        {' '}
                        <span>{item.quantity}x qtd</span>
                      </Col>
                      <Col mb={3}>
                        {' '}
                        <span>{(item.onSale ? item.quantity * item.discount : item.quantity * item.price).toFixed(2)} MT</span>
                      </Col>

                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>

            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{t('ordersummary')}</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>

                  <Link className="link" to="/deliveryoption">
                    {t('changedelivoptions')} <FaPencilAlt />
                  </Link>
                </ListGroup.Item>
              </ListGroup>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>{t('priceofproducts')}</Col>
                    <Col>{cart.itemsPrice} MT</Col>
                  </Row>
                </ListGroup.Item>
                {cart.addressPrice === 0 ? '' :
                  <ListGroup.Item>
                    <Row>
                      <Col>{t('deliveryfee')}</Col>
                      <Col>{cart.addressPrice} MT</Col>
                    </Row>
                  </ListGroup.Item>}
                <ListGroup.Item>
                  <Row>
                    <Col>{t('servicecharge')}</Col>
                    <Col>{cart.siteTax} MT</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>IVA (16%)</Col>
                    <Col>{cart.ivaTax} MT</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <b>Total</b>
                    </Col>
                    <Col>
                      <b>{cart.totalPrice} MT</b>
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      className='customButtom' variant='light'
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      {' '}
                      {t('placeorder')}
                    </Button>
                  </div>
                </ListGroup.Item>
                {loading && <LoadingBox></LoadingBox>}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={isModalOpen} onClick={closeModal} className='modal'>
        <Modal.Header closeButton onClick={closeModal}>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={loginRedirect}>
            Ok
          </Button>
          <Button variant="danger" onClick={closeModal}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isModalMpesa} className='modal' centered>
        <Modal.Header closeButton onClick={closeModalMpesa}>
          <Modal.Title>{t('mpesapayment')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{t('paymentamount')}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{cart.totalPrice} MT</div>
          </div>

          {loadingPayment ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <LoadingBox />
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                {paymentProgress === 'initiating' && t('paymentinitiating')}
                {paymentProgress === 'processing' && t('paymentprocessing')}
                {paymentProgress === 'confirming' && t('paymentconfirming')}
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                {t('paymentinstructions')}
              </div>
            </div>
          ) : paymentProgress === 'success' ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '15px' }}>✓</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
                {t('paymentsuccess')}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('waitingconfirmation')}
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                {t('whichnumbertopay')}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="opcao1"
                    checked={escolha === "opcao1"}
                    onChange={handleEscolhaChange}
                    disabled={loadingPayment}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ fontSize: '16px' }}>258{userInfo && userInfo.phoneNumber}</span>
                </label>

                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="opcao2"
                    checked={escolha === "opcao2"}
                    onChange={handleEscolhaChange}
                    disabled={loadingPayment}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ fontSize: '16px' }}>{t('anothernumber')}</span>
                </label>
              </div>

              {escolha === 'opcao2' && (
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ padding: '10px 15px', backgroundColor: '#f0f0f0', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', fontSize: '16px' }}>258</span>
                    <Form.Control
                      type="text"
                      maxLength={9}
                      placeholder="8********"
                      value={valorInput}
                      onChange={handleInputChange}
                      disabled={loadingPayment}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, fontSize: '16px' }}
                    />
                  </div>
                  {phoneNumberError && (
                    <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                      {phoneNumberError}
                    </div>
                  )}
                </div>
              )}

              {paymentError && (
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                  <strong>{t('paymentfailed')}:</strong> {paymentError}
                </div>
              )}

              <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '13px', color: '#0066cc' }}>
                ℹ️ {t('paymentinstructions')}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {paymentProgress === 'success' ? (
            <Button variant="success" disabled>
              {t('paymentsuccess')}
            </Button>
          ) : paymentError ? (
            <>
              <Button variant="primary" onClick={paymentMpesa} disabled={loadingPayment}>
                {t('retrypayment')}
              </Button>
              <Button variant="secondary" onClick={closeModalMpesa}>
                {t('cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="dark" onClick={paymentMpesa} disabled={loadingPayment || !escolha}>
                {loadingPayment ? t('processingpayment') : t('pay')}
              </Button>
              <Button variant="danger" onClick={closeModalMpesa} disabled={loadingPayment}>
                {t('cancel')}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={isModalStock} className='modal' >
        <Modal.Header closeButton onClick={closeModalStock}>
          <Modal.Title>Produto indisponível</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          O produto <b>{itemOutOfStock.name}</b> já não está disponível ou está fora de estoque.<br />Se deseja prosseguir com o pagamento dos restantes produtos deverá remover este produto da carrinha.

        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={closeModalStock}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isModalDelayOrder} className='modal' >
        <Modal.Header closeButton onClick={closeModalDelay}>
          <Modal.Title>Produtos por encomenda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          O produto <b>{itemOutOfStock.name}</b> é processado sob encomenda com prazo de entrega estimado "<b>{itemOutOfStock.orderPeriod}</b>". <br /> Isso causará atrasos na entrega de outros produtos.<br />
          Caso queira recebê-lo(s) imediatamente, deverá retirá-lo da carrinha, clicando em <b>alterar</b>. <br /> Se deseja continuar com o produto na carrinha, basta clicar em <b>continuar</b>.</Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={closeModalDelay}>
            Continuar
          </Button>
          <Button variant="info" onClick={redirectCart}>
            Alterar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

