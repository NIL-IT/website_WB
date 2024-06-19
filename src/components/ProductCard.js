import React from 'react';
// import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h2 className="product-name">{product.name}</h2>
      <p className="product-price">{product.price} ₽</p>
      <button className="order-button">Order</button>
    </div>
  );
};

export default ProductCard;