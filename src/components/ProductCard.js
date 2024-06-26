import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

const ProductCard = ({ product, isModerate }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = 'none';
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`, { state: { fromModeratePage: isModerate } });
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {!isLoaded && <div className="catalog-skeleton"></div>}
      <img
        src={product.image}
        alt={product.name}
        className="product-image-category"
        style={{ display: isLoaded ? 'block' : 'none' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <div className="product-info">
        <div className="product-price">
          <p className="product-new-price">{product.yourprice} ₽</p>
          <p className="product-old-price">{product.marketprice} ₽</p>
        </div>
        <p className="product-description">{product.name}</p>
      </div>
    </div>
  );
};

export default ProductCard;