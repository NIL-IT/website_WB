import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import AddProductPage from './pages/AddProductPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './components/ProductDetail';
import PurchaseStepsPage from './pages/PurchaseStepsPage';
import Sidebar from './components/Sidebar';
import './index.css';

const App = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      image: 'Часы н33аручные 33ару33ару33ару',
      name: 'Часы н1231аручные и Гелик 33ару33ару33ару33ару',
      description: 'Часы наручные 33ару33ару33ару33ару33ару33ару',
      terms: 'Оплата в течение 3-5 дней после публикации отзыва 33ару33ару33арувавававававававава33ару',
      availableDay: 'Today 33ару33ару33ару33ару33ару33ару33ару33ару33ару',
      marketPrice: 1500000000000,
      yourPrice: 130000000,
      discount: 1500000000000,
      step: "2",
    },
    {
      id: 2,
      image: 'path_t211232o_image',
      name: 'Часы наручны2222е',
      description: 'Часы наручные',
      terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
      availableDay: 'Today',
      marketPrice: 1500,
      yourPrice: 1300,
      discount: 15,
      step: "Завершено",
      isComplete: true,
    },
    {
      id: 3,
      image: 'path_t343434o_image',
      name: 'Часы наручные111111',
      description: 'Часы наручные',
      terms: 'Payment323232 details',
      availableDay: 'To3232323day',
      marketPrice: 152232300,
      yourPrice: 1311100,
      step: "6",
      discount: 1225,
    },
    {
      id: 4,
      image: 'Без шага',
      name: 'Без шага',
      description: 'Без шага',
      terms: 'Payment323232 details',
      availableDay: 'To3232323day',
      marketPrice: 2500,
      yourPrice: 1500,
      step: "0",
      discount: 250,
      keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного"
    },
    {
      id: 5,
      image: 'Без шага',
      name: 'Без шага',
      description: 'Без шага',
      terms: 'Payment323232 details',
      availableDay: 'To3232323day',
      marketPrice: 2500,
      yourPrice: 1500,
      step: "0",
      discount: 250,
      keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного"
    },
  ]);

  const categories = ['Категория 1', 'Категория 2', 'Категория 3'];

  const handleStepComplete = (step, formData) => {
    // Логика для обработки завершения шага
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<CatalogPage products={products} />} />
            <Route path="/catalog" element={<CatalogPage products={products} />} />
            <Route path="/add-product" element={<AddProductPage products={products} setProducts={setProducts} categories={categories} />} />
            <Route path="/purchases" element={<PurchasesPage products={products} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductDetail products={products} />} />
            <Route path="/purchase-steps/:id" element={<PurchaseStepsPage products={products} onStepComplete={handleStepComplete} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
