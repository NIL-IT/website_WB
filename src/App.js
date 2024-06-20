import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import AddProductPage from './pages/AddProductPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';
import "./index.css"

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes className="content">
          <Route exact path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Sidebar />
      </div>
    </Router>
  );
};

export default App;