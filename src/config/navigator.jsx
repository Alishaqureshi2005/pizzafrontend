import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Menu from '../pages/Menu';
import BestOnlineService from '../pages/BestOnlineService';
import Order from '../pages/Order';
import Signin from '../pages/Signin';
import Login from '../pages/Login';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppProvider } from '../context/DeliveryContext';
import Delivery from '../components/Delivery';
import Pickup from '../components/pickup';

const Navigator = () => {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Delivery/>
        <Pickup/>
        <Routes>
          <Route path="/" element={<><Header /><Home /></>} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/bestonlineservice" element={<BestOnlineService />} />
          <Route path="/order" element={<Order />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </Router>
    </AppProvider>
  );
};

export default Navigator;
