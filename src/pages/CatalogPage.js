import React from 'react';
import ProductCard from '../components/ProductCard';
//import './CatalogPage.css';

const CatalogPage = () => {
  const products = [
    { id: 1, name: 'Product 1', price: '1000', image: '/images/product1.png' },
    { id: 2, name: 'Product 2', price: '2000', image: '/images/product2.png' },
    // ...other products
  ];

  return (
    <div className="catalog-page">
      <input type="text" placeholder="Search" className="search-bar" />
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;