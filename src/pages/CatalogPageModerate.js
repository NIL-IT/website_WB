import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/CatalogPage.css';

const CatalogPageModerate = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="catalog-page">
      <div className="title-class">Модерация товаров</div>
      <div className="search-container">
        <div className="search-bar-wrapper">
          <svg className="search-icon" width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.32015 7.63656L11.8164 11M9.50344 4.88889C9.50344 7.03667 7.69126 8.77778 5.45582 8.77778C3.22039 8.77778 1.4082 7.03667 1.4082 4.88889C1.4082 2.74112 3.22039 1 5.45582 1C7.69126 1 9.50344 2.74112 9.50344 4.88889Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск"
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <svg className="filter-icon" width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1H1C0.999341 2.61377 1.32562 4.20095 1.94782 5.61078C2.57003 7.02062 3.4675 8.20625 4.55499 9.05511C5.08025 9.47907 5.51144 10.0646 5.80797 10.7567C6.10449 11.4488 6.25659 12.2249 6.25 13.0117V18L10.75 17.0535V12.9928C10.7434 12.206 10.8955 11.43 11.1921 10.7378C11.4885 10.0457 11.9198 9.46005 12.445 9.03618C13.5303 8.18902 14.4264 7.00635 15.0485 5.6001C15.6706 4.19385 15.9981 2.61056 16 1Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} isModerate={true} />
        ))}
      </div>
    </div>
  );
};

export default CatalogPageModerate;
