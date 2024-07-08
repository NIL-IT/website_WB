import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ products, userInfo, fetchProducts, fetchUserSteps }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id.toString() === id);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const skidka = Math.round(((product.marketprice - product.yourprice) / product.marketprice) * 100);

  const handleImageError = (event) => {
    event.target.style.display = 'none';
  };

  const handleBuyClick = async () => {
    if (product.availableday === 0) {
      return;
    }

    try {
      const response = await fetch(`https://testingnil.ru:8000/createStep.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_usertg: userInfo.id_usertg, id_product: id }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
        const newStep = updatedUserSteps.find(step => step.id_product === Number(id));

        if (newStep) {
          navigate(`/purchase-steps/${result.stepsId}`);
        } else {
          console.error('Не удалось найти созданный шаг в данных пользователя');
        }
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
      const response = await fetch(`https://testingnil.ru:8000/deleteProduct.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, userId: userInfo.id_usertg }),
      });

      const result = await response.json();

      if (result.success) {
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
          <p>Доступно сегодня:
          <svg
              className="info-icon"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => setShowPopup(true)}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM10.3027 13.3942C10.2316 13.7147 10.5038 14 10.8479 14H13.0406C13.2979 14 13.5151 13.8351 13.6064 13.6061C13.697 13.3789 14.0117 12.9674 14.254 12.7518C14.4827 12.5112 14.7213 12.2848 14.9563 12.0618C15.8824 11.183 16.754 10.356 16.754 8.91047C16.754 6.40301 14.582 5 12.2707 5C10.5038 5 8.06416 5.80604 7.58396 8.50363C7.48716 9.04737 7.94773 9.5 8.50002 9.5H9.91229C10.4388 9.5 10.8312 9.07642 11.0121 8.582C11.1863 8.10604 11.5379 7.7551 12.2707 7.7551C13.6066 7.7551 13.6064 9.22371 12.8346 10.1843C12.5434 10.5467 12.2023 10.8677 11.8648 11.1853C11.1798 11.8298 10.5098 12.4602 10.3027 13.3942ZM13.9999 17C13.9999 18.1046 13.1045 19 11.9999 19C10.8954 19 9.99994 18.1046 9.99994 17C9.99994 15.8954 10.8954 15 11.9999 15C13.1045 15 13.9999 15.8954 13.9999 17Z"
                fill="#000000"
              />
            </svg>
          </p>
          <div className="product-available">
            <p>{product.availableday}</p>
          </div>
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
          <p>{skidka} %</p>
        </div>
      </div>
      <button
        className={`buy-button ${product.availableday === 0 ? 'disabled' : ''}`}
        onClick={handleBuyClick}
        disabled={product.availableday === 0}
      >
        {product.availableday === 0 ? 'Лимит на сегодня исчерпан' : 'Купить товар'}
      </button>
      {fromModeratePage && (
        <button className="delete-button" onClick={handleDeleteClick}>Удалить товар</button>
      )}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Доступные дни</h3>
            {Object.keys(product.availableDays).map((day) => (
              <div key={day} className="popup-item">
                <span>{day}:</span>
                <span>{product.availableDays[day]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;