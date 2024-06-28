import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ products, userInfo, fetchProducts}) => {
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

  const handleBuyClick = async () => {
    try {
      const response = await fetch(`https://nilurl.ru:8000/createStep.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_usertg: userInfo.id_usertg, id_product: id }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Шаг успешно создан');
        navigate(`/purchase-steps/${result.stepsId}`);
      } else {
        alert('Ошибка при создании шага: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при создании шага:', error);
      alert('Произошла ошибка при создании шага');
    }
  };  

  const handleDeleteClick = async () => {
    if (userInfo?.status !== 'admin') {
      alert('У вас нет прав для удаления этого товара');
      return;
    }

    try {
      const response = await fetch(`https://nilurl.ru:8000/deleteProduct.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, userId: userInfo.id_usertg }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Товар успешно удален');
        fetchProducts();
        navigate('/catalog');
      } else {
        alert('Ошибка при удалении товара: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      alert('Произошла ошибка при удалении товара');
    }
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
          <p>{product.availableday}</p>
        </div>
        <div className="product-item">
          <p>Цена на маркетплейсе:</p>
          <p>{product.marketprice} ₽</p>
        </div>
        <div className="product-item">
          <p>Цена для вас:</p>
          <p>{product.yourprice} ₽</p>
        </div>
        <div className="product-item">
          <p>Скидка:</p>
          <p>{product.discount} %</p>
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