import './App.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Badge from 'react-bootstrap/Badge';
import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Store } from './Store';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FaRegHeart, FaExchangeAlt } from 'react-icons/fa';
import CartScreen from './screens/CartScreen';
import SignInScreen from './screens/SignInScreen';
import AddressScreen from './screens/AddressScreen';
import SignupScreen from './screens/SignUpScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import OrderAdminListScreen from './screens/OrderAdminListScreen';

import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import SellerRoute from './components/SellerRoute';
import ProductSellerScreen from './screens/ProductSellerScreen';
import OrderListBySellerScreen from './screens/OrderListBySellerScreen';
import SellerScreen from './screens/SellerScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import SupportScreen from './screens/SupportScreen';
import ChatBox from './components/ChatBox';
import CategoryListScreen from './screens/CategoryListScreen';
import CategoryCreateScreen from './screens/CategoryCreateScreen';
import CategoryEditScreen from './screens/CategoryEditScreen';
import SubcategoryListScreen from './screens/SubcategoryListScreen';
import SubcategoryCreateScreen from './screens/SubcategoryCreateScreen';
import SubcategoryEditScreen from './screens/SubcategoryEditScreen';
import DocumentTypeListScreen from './screens/DocumentTypeListScreen';
import DocumentTypeCreateScreen from './screens/DocumentTypeCreateScreen';
import DocumentTypeEditScreen from './screens/DocumentTypeEditScreen';
import ProvinceListScreen from './screens/ProvinceListScreen';
import ProvinceCreateScreen from './screens/ProvinceCreateScreen';
import ProvinceEditScreen from './screens/ProvinceEditScreen';
import Footer from './components/Footer';
import Help from './screens/Help';
import HowToBeSeller from './screens/HowToBeSeller';
import Terms from './screens/Terms';
import QualityTypeListScreen from './screens/QualityTypeListScreen';
import QualityTypeCreateScreen from './screens/QualityTypeCreateScreen';
import QualityTypeEditScreen from './screens/QualityTypeEditScreen';
import ConditionStatusCreateScreen from './screens/ConditionStatusCreateScreen';
import ConditionStatusEditScreen from './screens/ConditionStatusEditScreen';
import ConditionStatusListScreen from './screens/ConditionStatusListScreen';
import ColorListScreen from './screens/ColorListScreen';
import SizeListScreen from './screens/SizeListScreen';
import ColorCreateScreen from './screens/ColorCreateScreen';
import SizeCreateScreen from './screens/SizeCreateScreen';
import SizeEditScreen from './screens/SizeEditScreen';
import ColorEditScreen from './screens/ColorEditScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import DeliveryOptionScreen from './screens/DeliveryOptionScreen';
import axios from 'axios';

if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}
import AdicionalInfoHeader from './components/AdicionalInfoHeader';
import ScrollTopButton from './components/ScrollTopButton';
import SearchSellersScreen from './screens/SearchSellersScreen';
import SearchOnSaleScreen from './screens/SearchOnSaleScreen';
import EmailSentScreen from './screens/EmailSentScreen';
import { getError } from './utils';

import { useTranslation } from 'react-i18next';
import OrderHistoryBySellerScreen from './screens/OrderHistoryBySellerScreen';
import ReturnPolicy from './screens/ReturnPolicy';
import VisacasaBenef from './screens/VisacasaBenef';
import SellersToPayListScreen from './screens/SellersToPayListScreen';
import DeliverersToPayListScreen from './screens/DeliverersToPayListScreen';
import RequestDeliverman from './screens/RequestDelivermanScreen';
import RequestDelivermanConfirmScreen from './screens/RequestDelivermanConfirmScreen';
import RequestDelivermanProgressScreen from './screens/RequestDelivermanProgressScreen';
import RequestDelivermanHistoryByUserScreen from './screens/RequestDelivermanHistoryByUserScreen';
import RequestDelivermanHistoryByAdminScreen from './screens/RequestDelivermanHistoryByAdminScreen';
import AboutUs from './screens/AboutUs';
import Privacy from './screens/Privacy';
import LoginPopup from './components/LoginPopup';
import EstablishmentListScreen from './screens/EstablishmentListScreen';
import EstablishmentCreateScreen from './screens/EstablishmentCreateScreen';
import EstablishmentEditScreen from './screens/EstablishmentEditScreen';
import Broadcast from './screens/Broadcast';
import FavoritesScreen from './screens/FavoritesScreen';
import ComparisonScreen from './screens/ComparisonScreen';


export function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { cart, userInfo } = state;
  const [expanded, setExpanded] = useState(false);

  const { t } = useTranslation();


  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const signOutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
  };


  useEffect(() => {
    const refresh = async () => {
      if (userInfo) {
        try {
          const { data } = await axios.get(`/api/orders/sellerview?seller=${userInfo._id}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          ctxDispatch({ type: 'ORDERS_BY_SELLER', payload: data.orders });
        } catch (err) {
          toast.error(getError(err));
        }
      }
    }
    refresh();
  }, [userInfo, ctxDispatch])

  return (
    <BrowserRouter>
      <AppContent expanded={expanded} setExpanded={setExpanded} signOutHandler={signOutHandler} userInfo={userInfo} t={t} cart={cart} state={state} ctxDispatch={ctxDispatch} />
    </BrowserRouter>
  );
}

function AppContent({ expanded, setExpanded, signOutHandler, userInfo, t, cart, state, ctxDispatch }) {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownToggle = (dropdownId, isOpen) => {
    setActiveDropdown(isOpen ? dropdownId : null);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setExpanded(false);
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [location.pathname]);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setExpanded(false);
    setActiveDropdown(null);
  }, [location.pathname, setExpanded]);

  return (
    <div className="d-flex flex-column site-background">
      <Helmet>
        <title>Visacasa - Materiais de Construção</title>
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} />

      <header >
        <Navbar
          expanded={expanded}
          onSelect={() => setExpanded(false)}
          bg="light"
          variant="light"
          expand="lg"
          fixed="top"
        >
          <Container>
            <LinkContainer to="/" >
              <Navbar.Brand className="Navbar-Brand d-flex align-items-center"  >
                <img
                  src="images/visacasa.jpg"
                  width="45"
                  height="45"
                  className="d-inline-block align-top rounded-circle me-2 shadow-sm"
                  alt="Visacasa logo"
                />
                <span className="fw-bolder">Visacasa</span>
              </Navbar.Brand>
            </LinkContainer>
            <SearchBox />
            <Navbar.Toggle
              onClick={() => setExpanded(!expanded)}
              aria-controls="basic-navbar-nav"
            />
            <Link to="/cart" className="nav-link black-icon hide-icon-screen me-3" onClick={closeDropdowns}>
              <FontAwesomeIcon icon={faCartShopping}></FontAwesomeIcon>
              {cart.cartItems.length > 0 && (
                <Badge
                  bg="danger"
                  variant="danger"
                  className="cart-number"
                >
                  {cart.cartItems.reduce(
                    (prev, current) => prev + current.quantity,
                    0
                  )}
                </Badge>
              )}
            </Link>
            <Link to="/favorites" className="nav-link black-icon hide-icon-screen me-3" onClick={closeDropdowns}>
              <FaRegHeart />
              {state.favorites.length > 0 && (
                <Badge bg="danger" className="cart-number">{state.favorites.length}</Badge>
              )}
            </Link>
            <Link to="/compare" className="nav-link black-icon hide-icon-screen me-3" onClick={closeDropdowns}>
              <FaExchangeAlt />
              {state.compareProducts.length > 0 && (
                <Badge bg="primary" className="cart-number">{state.compareProducts.length}</Badge>
              )}
            </Link>


            <Navbar.Collapse id="collapse basic-navbar-nav">
              <Nav className="ms-auto align-items-center">
                <Link to="/cart" className="nav-link premium-nav-icon me-lg-3">
                  <FontAwesomeIcon icon={faCartShopping} />
                  {cart.cartItems.length > 0 && (
                    <Badge pill bg="danger" className="premium-badge">
                      {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                    </Badge>
                  )}
                </Link>
                <Link to="/favorites" className="nav-link premium-nav-icon me-lg-3">
                  <FaRegHeart />
                  {state.favorites.length > 0 && (
                    <Badge pill bg="danger" className="premium-badge">{state.favorites.length}</Badge>
                  )}
                </Link>

                {userInfo ? (
                  <NavDropdown
                    title={<span className="fw-bold">{userInfo.name}</span>}
                    id="basic-nav-dropdown"
                    className="premium-dropdown"
                    show={activeDropdown === 'user'}
                    onToggle={(isOpen) => handleDropdownToggle('user', isOpen)}
                  >
                    <LinkContainer to="/profile">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('profile')}</NavDropdown.Item>
                    </LinkContainer>

                    {userInfo && !userInfo.isDeliveryMan && (
                      <LinkContainer to="/orderHistory">
                        <NavDropdown.Item onClick={closeDropdowns}>{t('myorders')}</NavDropdown.Item>
                      </LinkContainer>
                    )}

                    {userInfo && userInfo.isDeliveryMan && (
                      <LinkContainer to="/delivery/orderlist">
                        <NavDropdown.Item onClick={closeDropdowns}>
                          {t('orderstodeliver')}

                        </NavDropdown.Item>
                      </LinkContainer>
                    )}


                    <LinkContainer to="/requestdelivermanhistory">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('deliveryrequesthistory')}</NavDropdown.Item>
                    </LinkContainer>


                    <LinkContainer to="/allrequestdelivermanhistory">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('alldeliveryrequesthistory')}</NavDropdown.Item>
                    </LinkContainer>



                    <LinkContainer to="/signin">
                      <NavDropdown.Item onClick={() => { signOutHandler(); closeDropdowns(); }}>
                        <b>{t('logout')}</b>
                      </NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>


                ) : (<>

                  {/* { <Nav.Link as={Link} to="/requestdeliverman"><b className='link'>{t('requestdeliverman')}</b></Nav.Link>} */}

                  <Link className="nav-link" to="/signin">
                    {t('login')}
                  </Link>
                </>
                )}


                {userInfo && userInfo.isSeller && userInfo.isApproved && (
                  <NavDropdown
                    title={userInfo.seller.name}
                    id="seller-nav-dropdown"
                    className="premium-dropdown"
                    show={activeDropdown === 'seller'}
                    onToggle={(isOpen) => handleDropdownToggle('seller', isOpen)}
                  >
                    <LinkContainer to="/productlist/seller">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('myproducts')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/orderlist/seller">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('orderclients')}
                        <Badge
                          bg="danger"
                          variant="danger"
                          className="cart-number"
                        >
                          {cart.ordersBySeller && cart.ordersBySeller.length > 0 && cart.ordersBySeller.length}
                        </Badge>
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/orderhistorybycustomer/seller">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('paymenthistory')}</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )}
                {userInfo && userInfo.isAdmin && (
                  <NavDropdown
                    title="Admin"
                    id="admin-nav-dropdown"
                    className="premium-dropdown"
                    show={activeDropdown === 'admin'}
                    onToggle={(isOpen) => handleDropdownToggle('admin', isOpen)}
                  >
                    <LinkContainer to="/admin/dashboard">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('dashboard')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/provinceList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('provinces')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/documentTypeList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('doctypes')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/categoryList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('categories')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/subcategoryList">
                      <NavDropdown.Item onClick={closeDropdowns}>Subcategorias</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/colorList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('availablecolors')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/sizeList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('availablesizes')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/conditionstatusList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('productcondition')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/qualitytypeList">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('productquality')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/productlist">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('products')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/orderlist">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('orders')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/userlist">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('userslist')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/support">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('Support')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/broadcast">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('broadcast')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/sellerstopay">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('sellerstopay')}</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/deliverstopay">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('deliverstopay')}</NavDropdown.Item>
                    </LinkContainer>

                    <LinkContainer to="/admin/tipoestabelecimentos">
                      <NavDropdown.Item onClick={closeDropdowns}>{t('tipoestabelecimento')}</NavDropdown.Item>
                    </LinkContainer>



                  </NavDropdown>

                )}
                {/* {userInfo && <Nav.Link as={Link} to="/requestdeliverman"><b className='link'>{t('requestdeliveryman')}</b></Nav.Link>} */}



                <Link to="/cart" className="nav-link  hide-cart" onClick={closeDropdowns}>
                  <FontAwesomeIcon icon={faCartShopping}></FontAwesomeIcon>
                  {cart.cartItems.length > 0 && (
                    <Badge
                      bg="danger"
                      variant="danger"
                      className="cart-number"
                    >
                      {cart.cartItems.reduce(
                        (prev, current) => prev + current.quantity,
                        0
                      )}
                    </Badge>
                  )}
                </Link>




              </Nav>
            </Navbar.Collapse>

          </Container>
        </Navbar>
      </header>

      <div className="main-content">

        <main  >
          {/* <PaybackInfoAndSecurity/> */}

          <AdicionalInfoHeader />

          <Container className={expanded ? 'collapse-open' : ''}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/products/:id" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SignInScreen />} />
              <Route path="/signup" element={<SignupScreen />} />

              <Route
                path="/terms"
                element={
                  <Terms />
                }
              />
              <Route
                path="/howtobeseller"
                element={
                  <HowToBeSeller />
                }
              />

              <Route
                path="/help"
                element={
                  <Help />
                }
              />
              <Route
                path="/address"
                element={
                  <AddressScreen />
                }
              />

              <Route
                path="/deliveryoption"
                element={
                  <DeliveryOptionScreen />
                }
              />

              <Route
                path="/requestdeliverman"
                element={
                  <RequestDeliverman />
                }
              />


              <Route
                path="/requestdelivermanconfirm"
                element={
                  <RequestDelivermanConfirmScreen />
                }
              />

              <Route
                path="/requestdelivermanprogress/:id"
                element={
                  <RequestDelivermanProgressScreen />
                }
              />

              <Route
                path="/aboutus"
                element={
                  <AboutUs />
                }
              />


              <Route
                path="/requestdelivermanhistory"
                element={
                  <RequestDelivermanHistoryByUserScreen />
                }
              />

              <Route
                path="/allrequestdelivermanhistory"
                element={
                  <RequestDelivermanHistoryByAdminScreen />
                }
              />




              <Route
                path="/payment"
                element={
                  <PaymentMethodScreen />
                }
              />

              <Route
                path="/placeorder"
                element={
                  <PlaceOrderScreen />
                }
              />
              <Route
                path="/orderHistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />

              <Route path="/seller/:id" element={<SellerScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/sellers" element={<SearchSellersScreen />} />
              <Route path="/onsale" element={<SearchOnSaleScreen />} />

              <Route
                path="/categoryList/"
                element={
                  <ProtectedRoute>
                    <CategoryListScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/colorList/"
                element={
                  <ProtectedRoute>
                    <ColorListScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sizeList/"
                element={
                  <ProtectedRoute>
                    <SizeListScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/size/:id"
                element={
                  <ProtectedRoute>
                    <SizeEditScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/color/create"
                element={
                  <ProtectedRoute>
                    <ColorCreateScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/tipoestabelecimento/create"
                element={
                  <ProtectedRoute>
                    <EstablishmentCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tipoestabelecimento/:id"
                element={
                  <ProtectedRoute>
                    <EstablishmentEditScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/color/:id"
                element={
                  <ProtectedRoute>
                    <ColorEditScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/size/create"
                element={
                  <ProtectedRoute>
                    <SizeCreateScreen />
                  </ProtectedRoute>
                }
              />



              <Route
                path="/qualitytypeList/"
                element={
                  <ProtectedRoute>
                    <QualityTypeListScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/qualitytype/create"
                element={
                  <ProtectedRoute>
                    <QualityTypeCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/qualitytype/:id"
                element={
                  <ProtectedRoute>
                    <QualityTypeEditScreen />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/conditionstatusList/"
                element={
                  <ProtectedRoute>
                    <ConditionStatusListScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/conditionstatus/create"
                element={
                  <ProtectedRoute>
                    <ConditionStatusCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/conditionstatus/:id"
                element={
                  <ProtectedRoute>
                    <ConditionStatusEditScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/documentTypeList/"
                element={
                  <ProtectedRoute>
                    <DocumentTypeListScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/document/create"
                element={
                  <ProtectedRoute>
                    <DocumentTypeCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/document/:id"
                element={
                  <ProtectedRoute>
                    <DocumentTypeEditScreen />
                  </ProtectedRoute>
                }
              />




              <Route
                path="/provinceList/"
                element={
                  <ProtectedRoute>
                    <ProvinceListScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/forget-password"
                element={
                  <ForgetPasswordScreen />
                }
              />

              <Route
                path="/reset-password/:token"
                element={
                  <ResetPasswordScreen />
                }
              />

              <Route
                path="/email-sent"
                element={
                  <EmailSentScreen />
                }
              />






              <Route
                path="/province/create"
                element={
                  <ProtectedRoute>
                    <ProvinceCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/province/:id"
                element={
                  <ProtectedRoute>
                    <ProvinceEditScreen />
                  </ProtectedRoute>
                }
              />



              <Route
                path="/category/create"
                element={
                  <ProtectedRoute>
                    <CategoryCreateScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/category/:id"
                element={
                  <ProtectedRoute>
                    <CategoryEditScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subcategoryList/"
                element={
                  <ProtectedRoute>
                    <SubcategoryListScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subcategory/create"
                element={
                  <ProtectedRoute>
                    <SubcategoryCreateScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subcategory/:id"
                element={
                  <ProtectedRoute>
                    <SubcategoryEditScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />


              <Route
                path="/support"
                element={
                  <AdminRoute>
                    <SupportScreen />
                  </AdminRoute>
                }
              />

              <Route
                exact
                path="/productlist/seller"
                element={
                  <SellerRoute>
                    <ProductSellerScreen />
                  </SellerRoute>
                }
              />

              <Route
                exact
                path="/orderlist/seller"
                element={
                  <SellerRoute>
                    <OrderListBySellerScreen />
                  </SellerRoute>
                }
              />

              <Route
                exact
                path="/orderhistorybycustomer/seller"
                element={
                  <SellerRoute>
                    <OrderHistoryBySellerScreen />
                  </SellerRoute>
                }
              />

              <Route
                path="/product/create"
                element={
                  <SellerRoute>
                    <ProductCreateScreen />
                  </SellerRoute>
                }
              />

              <Route
                path="/product/:id"
                element={
                  <SellerRoute>
                    <ProductEditScreen />
                  </SellerRoute>
                }
              />

              <Route
                path="/admin/productlist"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />



              <Route
                path="/admin/orderlist"
                element={
                  <AdminRoute>
                    <OrderAdminListScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/orderlistall"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/userlist"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/product/create"
                element={
                  <AdminRoute>
                    <ProductCreateScreen />
                  </AdminRoute>
                }
              />


              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/sellerstopay"
                element={
                  <AdminRoute>
                    <SellersToPayListScreen />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/deliverstopay"
                element={
                  <AdminRoute>
                    <DeliverersToPayListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/api/users/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />

              <Route path="/admin/tipoestabelecimentos" element={
                <AdminRoute>
                  <EstablishmentListScreen />
                </AdminRoute>

              } />


              <Route
                path="/benefits"
                element={
                  <VisacasaBenef />
                }
              />

              <Route
                path="/broadcast"
                element={
                  <Broadcast />
                }
              />

              <Route
                path="/returnpolicy"
                element={
                  <ReturnPolicy />
                }
              />

              <Route
                path="/privacy"
                element={
                  <Privacy />
                }
              />



              <Route path="/favorites" element={<FavoritesScreen />} />
              <Route path="/compare" element={<ComparisonScreen />} />
            </Routes>



            <ScrollTopButton />

            {userInfo && <ChatBox userInfo={userInfo} />}
          </Container>
          <LoginPopup />
        </main>
      </div>
      <footer className='center'>

        <Footer></Footer>
      </footer>
    </div>
  );
}

export default App;
