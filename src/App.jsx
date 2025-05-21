import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Signup from './pages/signup';
import Home from './pages/Home';
import Menu from './pages/Menu';
import BestOnlineService from './pages/BestOnlineService';
import Order from './pages/Order';
import OrderHistory from './pages/OrderHistory';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminPrinter from './pages/AdminPrinter';
import PizzaCustomization from './pages/PizzaCustomization';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminNavbar from './components/AdminNavbar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Header from './components/Header';
import Delivery from './components/Delivery';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import 'leaflet/dist/leaflet.css';
import OrderDetails from './pages/OrderDetails';
import Pickup from './components/pickup';
// Create a wrapper component to handle navbar selection
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      {!isAdminRoute && <Header />}
      {!isAdminRoute && <Delivery />}
      {!isAdminRoute && <Pickup />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/bestonlineservice" element={<BestOnlineService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/order" element={<Order />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/pizza-customization/:id" element={<PizzaCustomization />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/cart" element={<Cart />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/printer" element={<AdminPrinter />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <DeliveryProvider>
            <Router>
              <ToastContainer 
                position="top-right" 
                autoClose={5000} 
                hideProgressBar={false} 
                newestOnTop={true} 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
              />
              <AppContent />
            </Router>
          </DeliveryProvider>
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
