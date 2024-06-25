import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id.toString() === id);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = 'none';
  };

  const handleBuyClick = () => {
    navigate(`/purchase-steps/${id}`);
  };

  const handleDeleteClick = () => {
    // Логика удаления товара
    console.log(`Товар с id ${id} удален`);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  const fromModeratePage = location.state?.fromModeratePage;

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
      {fromModeratePage && (
        <button className="delete-button" onClick={handleDeleteClick}>Удалить товар</button>
      )}
    </div>
  );
};

export default ProductDetail;