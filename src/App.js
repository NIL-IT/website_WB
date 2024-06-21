import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import AddProductPage from './pages/AddProductPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './components/ProductDetail';
import Sidebar from './components/Sidebar';
import './index.css';

const products = [
  {
    id: 1,
    image: 'path_to_image',
    name: 'Product Name',
    price: 1000,
    oldPrice: 1200,
    description: 'Часы наручные',
    terms: 'Оплата в течение 3-5 дней после публикации отзыва',
    availableDay: 'Today',
    marketPrice: 1500,
    yourPrice: 1300,
    discount: 15,
  },
  {
    id: 2,
    image: 'path_t211232o_image',
    name: 'Produc112312t Name',
    price: 10300,
    oldPrice: 12200,
    description: 'Часы наручные',
    terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
    availableDay: 'Today',
    marketPrice: 1500,
    yourPrice: 1300,
    discount: 15,
  },
  {
    id: 3,
    image: 'path_t343434o_image',
    name: 'Product Name',
    price: 1011111100,
    oldPrice: 1222333300,
    description: 'Часы 232323наручные',
    terms: 'Payment323232 details',
    availableDay: 'To3232323day',
    marketPrice: 152232300,
    yourPrice: 1311100,
    discount: 1225,
  },
];

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<CatalogPage products={products} />} />
            <Route path="/catalog" element={<CatalogPage products={products} />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductDetail products={products} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;