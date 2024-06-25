import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ products, setProducts }) => {
  const { id } = useParams();
  const productIndex = products.findIndex((product) => product.id.toString() === id);
  const product = productIndex !== -1 ? products[productIndex] : null;
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (product && !product.hasOwnProperty('step')) {
      const updatedProducts = [...products];
      updatedProducts[productIndex] = { ...product, step: 0 };
      setProducts(updatedProducts);
    }
  }, [product, productIndex, products, setProducts]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = 'none';
  };

  const handleBuyClick = () => {
    navigate(`/purchase-steps/${id}`);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-detail">
      {!isLoaded && <div className="product-skeleton"></div>}
      <img
        src={product.image}
        alt={product.name}
        className="product-image-detail"
        style={{ display: isLoaded ? 'block' : 'none' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <p className="product-name">{product.name}</p>
      <div>
        <div>
          <p className="product-terms">Условия сделки:</p>
          <p className="product-payment">{product.terms}</p>
        </div>
      </div>
      <div className="product-details">
        <div className="product-item">
          <p>Доступно в день:</p>
          <p>{product.availableDay}</p>
        </div>
        <div className="product-item">
          <p>Цена на маркетплейсе:</p>
          <p>{product.marketPrice} ₽</p>
        </div>
        <div className="product-item">
          <p>Цена для вас:</p>
          <p>{product.yourPrice} ₽</p>
        </div>
        <div className="product-item">
          <p>Скидка:</p>
          <p>{product.discount}%</p>
        </div>
      </div>
      <button className="buy-button" onClick={handleBuyClick}>Купить товар</button>
    </div>
  );
};

export default ProductDetail;
