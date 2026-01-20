import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobile } from '@fortawesome/free-solid-svg-icons';
import { faTextSlash } from '@fortawesome/free-solid-svg-icons';
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';


import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';

import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faClockFour } from '@fortawesome/free-solid-svg-icons';

import { CiCreditCard1 } from "react-icons/ci";

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import CountryFlag from 'react-country-flag';

import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt } from "react-icons/fa";

import { GoNumber } from "react-icons/go";
import { useTranslation } from 'react-i18next';

const reducer = (state, action) => {
  switch (action.type) {

    case 'FETCH_REQUEST':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, documentTypes: action.payload.documentTypes, pages: action.payload.pages };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_REQUEST_PROVINCE':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS_PROVINCE':
      return { ...state, loading: false, provinces: action.payload.provinces, pages: action.payload.pages };

    case 'FETCH_FAIL_PROVINCE':
      return { ...state, loading: false, error: action.payload };

    case 'USER_REQUEST':
      return { ...state, loadingUser: true };

    case 'USER_SIGNIN':
      return { ...state, registerUser: action.payload, loadingUser: false };

    case 'USER_FAIL':
      return { ...state, registerUserFail: action.payload, loadingUser: false };

    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };

    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };

    case 'UPLOAD_FAIL':
      return { ...state, errorUpload: action.payload, loadingUpload: false };

    default:
      return state;
  }
};
export default function SignupScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlToRedirect = new URLSearchParams(search).get('redirect');
  const redirect = urlToRedirect ? urlToRedirect : '/';

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);

  const [sellerName, setSellerName] = useState('');
  const [sellerDescription, setSellerDescription] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [sellerLogo, setSellerLogo] = useState('');
  const [opentime, setOpentime] = useState('');
  const [closetime, setClosetime] = useState('');

  const [phoneNumberAccount, setPhoneNumberAccount] = useState('');
  const [alternativePhoneNumberAccount, setAlternativePhoneNumberAccount] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [alternativeAccountType, setAlternativeAccountType] = useState('');
  const [alternativeAccountNumber, setAlternativeAccountNumber] = useState('');
  const [checkedTerms, setCheckedTerms] = useState(false);


  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const [workDaysWithTime, setWorkDaysWithTime] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState('');

  const accountTypes = [
    { _id: 1, name: 'BCI' },
    { _id: 2, name: 'BIM' },
    { _id: 3, name: 'MOZA' },
    { _id: 4, name: 'ABSA' },
    { _id: 5, name: 'FNB' },

  ];



  const { state, dispatch: ctxDispatch } = useContext(Store);



  // Função para capturar a geolocalização do usuário
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          toast.error('Erro ao obter localização: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocalização não é suportada neste navegador.');
    }
  };


  const [
    {
      loadingUser,
      loadingUpload,
      provinces
    },
    dispatch
  ] = useReducer(reducer, { loadingUser: false, registerUserFail: [], registerUser: {} });

  const removeDayWeek = (index) => {
    const workDays = [...workDaysWithTime];
    workDays.splice(index, 1); // Remove the item at the specified index
    setWorkDaysWithTime(workDays); // Update the items list
  };
  const handleAddItem = () => {
    // Validar entrada do usuário, se necessário
    if (dayOfWeek && opentime && closetime) {
      let dayNumber = 0;
      if (dayOfWeek) {
        const selectedWorkDay = workDaysWithTime.find((workDay) => workDay.dayOfWeek === dayOfWeek);

        if (!selectedWorkDay) {

          if (dayOfWeek.includes("Dom") || dayOfWeek.includes("Sun"))
            dayNumber = 0;
          if (dayOfWeek.includes("Seg") || dayOfWeek.includes("Mon"))
            dayNumber = 1;
          if (dayOfWeek.includes("Ter") || dayOfWeek.includes("Tue"))
            dayNumber = 2;
          if (dayOfWeek.includes("Qua") || dayOfWeek.includes("Wed"))
            dayNumber = 3;
          if (dayOfWeek.includes("Qui") || dayOfWeek.includes("Thu"))
            dayNumber = 4;
          if (dayOfWeek.includes("Sex") || dayOfWeek.includes("Fri"))
            dayNumber = 5;
          if (dayOfWeek.includes("Sab") || dayOfWeek.includes("Sat"))
            dayNumber = 6;
          if (dayOfWeek.includes("Fer") || dayOfWeek.includes("Hol")) {
            dayNumber = 7;
          }

          const newItem = {
            dayOfWeek,
            opentime,
            closetime
          };
          setWorkDaysWithTime([...workDaysWithTime, newItem]);
          setDayOfWeek({});
          setOpentime('');
          setClosetime('');
        }

      }

    } else {
      // Lidar com erro de entrada inválida, se necessário
      toast.error('Por favor, preencha todos os campos.');
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 9) {
      toast.error('O número de telefone deve possuir 9 digitos');
      return
    }
    if ((!phoneNumber.startsWith('82') && !phoneNumber.startsWith('83') && !phoneNumber.startsWith('84') && !phoneNumber.startsWith('85') && !phoneNumber.startsWith('86') && !phoneNumber.startsWith('87'))) {
      toast.error('Número de operadora incorrecto');
      return
    }

    if (password.length <= 5) {
      toast.error('A password deve possuir no minimo 6 digitos');
      return
    }

    if (password !== confirmPassword) {
      toast.error('As passwords não conferem');
      return
    }

    if (workDaysWithTime.length === 0 && isSeller) {
      toast.error('Por favor, adicione os dias úteis de trabalho e horário');
      return
    }
    if (sellerLogo === '' && isSeller) {
      toast.error('Por favor, adicione a logo da loja');
      return

    }

    // Validate latitude and longitude for sellers
    if (isSeller && (!latitude || !longitude)) {
      toast.error('Latitude e longitude são obrigatórias para vendedores.');
      return;
    }

    try {
      ctxDispatch({ type: 'USER_REQUEST' });

      const { data } = await axios.post('/api/users/signup', {
        name,
        phoneNumber,
        email,
        password,
        isSeller,
        sellerName,
        sellerDescription,
        sellerLogo,
        sellerLocation,
        sellerAddress,
        phoneNumberAccount,
        alternativePhoneNumberAccount,
        accountType,
        accountNumber,
        alternativeAccountType,
        alternativeAccountNumber,
        workDaysWithTime,
        latitude,
        longitude
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      navigate(redirect || '/');
    } catch (err) {
      ctxDispatch({ type: 'USER_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get('/api/documents');

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();

  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST_PROVINCE' });

        const { data } = await axios.get('/api/provinces');

        dispatch({ type: 'FETCH_SUCCESS_PROVINCE', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL_PROVINCE', payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      ctxDispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      ctxDispatch({ type: 'UPLOAD_SUCCESS', payload: data });

      setSellerLogo(data.secure_url);

      toast.success('Upload de Imagem com Sucesso. Clique em Registar');
    } catch (err) {
      toast.error(getError(err));
      ctxDispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };



  return (
    <div className="login-page-premium py-5">
      <Helmet>
        <title>{t('newaccount')}</title>
      </Helmet>

      {/* Background Overlay */}
      <div className="login-bg-overlay"></div>

      <Container className="d-flex flex-column align-items-center justify-content-center position-relative" style={{ zIndex: 10 }}>
        <div className="reveal active w-100" style={{ maxWidth: '600px' }}>

          <div className="text-center mb-4">
            <h1 className="h1-premium mb-2">{t('newaccount')}</h1>
            <p className="text-muted small px-4">
              Crie sua conta e comece a vender ou comprar na melhor plataforma.
            </p>
          </div>

          <Card className="border-0 shadow-premium overflow-hidden position-relative" style={{ borderRadius: '28px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={submitHandler}>

                <h5 className="mb-4 fw-bold text-primary border-bottom pb-2">Informações Pessoais</h5>

                <Form.Group className="mb-4" controlId="name">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-1">
                    <FontAwesomeIcon icon={faTextSlash} className="text-primary" /> {t('name')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-premium"
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="phoneNumber">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-1">
                    <FontAwesomeIcon icon={faMobile} className="text-primary" /> {t('phone')}
                    <span className="ms-auto d-flex align-items-center gap-2 opacity-75 text-xs">
                      <CountryFlag countryCode="MZ" svg style={{ width: '1.2em', height: '1.2em' }} /> [+258]
                    </span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-premium"
                    max={9}
                    maxLength={9}
                    pattern="[0-9]*"
                    title="Insira apenas números"
                    placeholder="8********"
                    required
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="email">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-1">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-primary" /> Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    className="form-control-premium"
                    required
                    placeholder="exemplo@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-1">
                    <FontAwesomeIcon icon={faLock} className="text-primary" /> {t('password')}
                    <small className='text-muted ms-2' style={{ fontSize: '0.7rem' }}>({t('musthave6digits')})</small>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    className="form-control-premium"
                    placeholder="******"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label className="d-flex align-items-center gap-2 small fw-bold text-muted mb-1">
                    <FontAwesomeIcon icon={faLockOpen} className="text-primary" /> {t('confirmpassword')}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    className="form-control-premium"
                    placeholder="******"
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <div className="p-3 bg-light rounded-3 mb-4 border border-light">
                  <Form.Check
                    type="switch"
                    id="isSeller"
                    label={<span className="fw-bold text-dark">{t('wanttobeoursupplier')}</span>}
                    checked={isSeller}
                    onChange={(e) => setIsSeller(e.target.checked)}
                    className="premium-switch"
                  />
                </div>

                {isSeller && (
                  <div className="seller-section mt-4 animate__animated animate__fadeIn">
                    <h5 className="mb-4 fw-bold text-primary border-bottom pb-2">{t('bankdata')}</h5>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="sellerPhoneNumberAccount">
                          <Form.Label className="small fw-bold text-muted"><GoNumber className="me-1" /> {t('phonenumbertransfers')}</Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-premium"
                            max={9}
                            maxLength={9}
                            pattern="[0-9]*"
                            placeholder="8********"
                            value={phoneNumberAccount}
                            required
                            onChange={(e) => setPhoneNumberAccount(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="sellerPhoneNumberAccountAlternative">
                          <Form.Label className="small fw-bold text-muted"><GoNumber className="me-1" /> {t('phonenumbertransfersoptional')}</Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-premium"
                            max={9}
                            maxLength={9}
                            pattern="[0-9]*"
                            placeholder="8********"
                            value={alternativePhoneNumberAccount}
                            onChange={(e) => setAlternativePhoneNumberAccount(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="sellerAccountType">
                          <Form.Label className="small fw-bold text-muted"><CiCreditCard1 className="me-1" /> {t('accounttype')}</Form.Label>
                          <Form.Select
                            className="form-control-premium"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)} required>
                            <option value="">{t('select')}</option>
                            {accountTypes && accountTypes.map(accountType => (
                              <option key={accountType._id} value={accountType.name}>
                                {accountType.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="accountNumber">
                          <Form.Label className="small fw-bold text-muted"><GoNumber className="me-1" /> {t('accountnumber')}</Form.Label>
                          <Form.Control
                            type="Number"
                            className="form-control-premium"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="accountTypeAlternative">
                          <Form.Label className="small fw-bold text-muted"><CiCreditCard1 className="me-1" /> {t('accounttypeoptional')}</Form.Label>
                          <Form.Select
                            className="form-control-premium"
                            value={alternativeAccountType}
                            onChange={(e) => setAlternativeAccountType(e.target.value)}>
                            <option value="">{t('select')}</option>
                            {accountTypes && accountTypes.map(accountType => (
                              <option key={accountType.id} value={accountType.name}>
                                {accountType.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="numeroAccountAlternative">
                          <Form.Label className="small fw-bold text-muted"><GoNumber className="me-1" /> {t('accountnumberoptional')}</Form.Label>
                          <Form.Control
                            type="Number"
                            className="form-control-premium"
                            value={alternativeAccountNumber}
                            onChange={(e) => setAlternativeAccountNumber(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <h5 className="mt-4 mb-4 fw-bold text-primary border-bottom pb-2">{t('storedetails')}</h5>

                    <Form.Group className="mb-3" controlId="sellerName">
                      <Form.Label className="small fw-bold text-muted"><FontAwesomeIcon icon={faTextSlash} className="me-1" /> {t('storename')}</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control-premium"
                        value={sellerName}
                        required
                        onChange={(e) => setSellerName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="imageFile">
                      <Form.Label className="small fw-bold text-muted">Upload logo</Form.Label>
                      <div className="d-flex align-items-center gap-3">
                        <Form.Control type="file" className="form-control-premium text-muted" onChange={uploadFileHandler} />
                        {sellerLogo && (
                          <img
                            src={sellerLogo}
                            alt="Logo"
                            className="rounded-3 shadow-sm"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="sellerDescription">
                      <Form.Label className="small fw-bold text-muted"><FontAwesomeIcon icon={faTextSlash} className="me-1" /> {t('storedescription')}</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control-premium"
                        value={sellerDescription}
                        as="textarea"
                        rows={3}
                        required
                        onChange={(e) => setSellerDescription(e.target.value)}
                      />
                    </Form.Group>

                    <div className="p-3 bg-light rounded-3 mb-3 border border-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold small">{t('location')}</span>
                        <Button variant="outline-primary" size="sm" onClick={handleGeolocation} className="rounded-pill">
                          {t('getlocation')}
                        </Button>
                      </div>
                      {latitude && longitude ? (
                        <p className="mb-0 small text-success">
                          {t('latitude')}: {latitude}, {t('longitude')}: {longitude}
                        </p>
                      ) : (
                        <p className="mb-0 small text-muted fst-italic">Localização não definida</p>
                      )}
                    </div>

                    <Form.Group className="mb-3" controlId="sellerLocation">
                      <Form.Label className="small fw-bold text-muted"><FontAwesomeIcon icon={faTextSlash} className="me-1" /> {t('province')}</Form.Label>
                      <Form.Select
                        className="form-control-premium"
                        value={sellerLocation}
                        onChange={(e) => setSellerLocation(e.target.value)} required>
                        <option value="">{t('select')}</option>
                        {provinces && provinces.map(province => (
                          <option key={province._id} value={province._id}>
                            {province.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label className="small fw-bold text-muted"><FontAwesomeIcon icon={faTextSlash} className="me-1" /> {t('storeaddress')}</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control-premium"
                        value={sellerAddress}
                        as="textarea"
                        rows={2}
                        required
                        onChange={(e) => setSellerAddress(e.target.value)}
                      />
                    </Form.Group>

                    <h6 className="fw-bold mt-4 mb-3 text-secondary border-bottom pb-1">{t('businesshours')}</h6>
                    <div className="d-flex flex-wrapp gap-2 align-items-end mb-3">
                      <Form.Group className="flex-grow-1" controlId="dayWeek">
                        <Form.Label className="small fw-bold text-muted d-block">{t('weekday')}</Form.Label>
                        <Form.Select
                          className="form-control-premium form-select-sm"
                          value={dayOfWeek}
                          onChange={(e) => setDayOfWeek(e.target.value)}>
                          <option value="">{t('select')}</option>
                          {daysOfWeek && daysOfWeek.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId="sellerOpentime">
                        <Form.Label className="small fw-bold text-muted d-block">{t('openingtime')}</Form.Label>
                        <Form.Control
                          type="time"
                          className="form-control-premium form-control-sm"
                          value={opentime}
                          onChange={(e) => setOpentime(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group controlId="sellerClosetime">
                        <Form.Label className="small fw-bold text-muted d-block">{t('closingtime')}</Form.Label>
                        <Form.Control
                          type="time"
                          className="form-control-premium form-control-sm"
                          value={closetime}
                          onChange={(e) => setClosetime(e.target.value)}
                        />
                      </Form.Group>
                      <Button onClick={handleAddItem} variant="dark" size="sm" className="rounded-circle" style={{ width: '38px', height: '38px' }}>+</Button>
                    </div>

                    <ul className="list-group list-group-flush rounded-3 mb-3">
                      {workDaysWithTime.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-light">
                          <span className="small">{item.dayOfWeek}: {item.opentime} - {item.closetime}</span>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removeDayWeek(index)}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4 form-check-premium">
                  <Form.Check
                    type="checkbox"
                    label={<span className="small text-muted">
                      Li e concordo com os <a href="/terms" className="text-primary fw-bold text-decoration-none">termos e condições</a>
                    </span>}
                    id="myCheckbox"
                    required
                    value={checkedTerms}
                    onChange={(e) => setCheckedTerms(e.target.checked)}
                    className="premium-checkbox"
                  />
                </div>

                <Button className="w-100 btn-premium py-3 mb-4 fw-bold shadow-sm" type="submit" disabled={loadingUser}>
                  {t('create')}
                </Button>
                {loadingUser && <LoadingBox></LoadingBox>}

                <div className="text-center small text-muted">
                  {t('alreadyhaveaccount')}{' '}
                  <Link className="text-primary fw-bold text-decoration-none hover-underline" to={`/signin?redirect=${redirect}`}>
                    {t('start')}
                  </Link>
                </div>

              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>

      <style>{`
        .login-page-premium {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
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
        .form-control-premium {
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          background: #fdfdfd;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }
        .form-control-premium:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(232, 90, 79, 0.1);
          background: #fff;
        }
        .btn-premium {
          background: var(--primary-gradient, linear-gradient(to right, #FF512F 0%, #DD2476 51%, #FF512F 100%));
          background-size: 200% auto;
          border: none;
          border-radius: 14px;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-premium:hover:not(:disabled) {
           background-position: right center;
           transform: translateY(-2px);
           box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .text-xs { font-size: 0.75rem; }
        .hover-underline:hover { text-decoration: underline !important; }
        
        .seller-section {
           animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
