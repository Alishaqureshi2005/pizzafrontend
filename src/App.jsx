import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/signup';
import Home from './pages/Home';
import Menu from './pages/Menu';
import BestOnlineService from './pages/BestOnlineService';
import Order from './pages/Order';
import Cart from './pages/Cart';
// import Orders from './pages/Orders';
import Navigator from './config/navigator';
import './App.css';
import 'leaflet/dist/leaflet.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar/>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/bestonlineservice" element={<BestOnlineService />} />
            <Route path="/order" element={<Order />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
          <Footer/>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
