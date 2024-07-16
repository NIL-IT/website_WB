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

  const handleSellerClick = () => {
    if (product.tg_nick) {
      window.open(
        `https://t.me/${product.tg_nick}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      console.error("Telegram nickname not found or userStep is undefined");
    }
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
          localStorage.clear()
          navigate(`/purchase-steps/${result.stepsId}`);
        } else {
          console.error('Не удалось найти созданный шаг в данных пользователя');
        }
      } else {
        alert('Ошибка при создании шага: ' + result.error);
        localStorage.clear()
      }
    } catch (error) {
      console.error('Ошибка при создании шага:', error);
      alert('Произошла ошибка при создании шага');
      localStorage.clear()
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
        navigate('/catalog-moderate');
      } else {
        alert('Ошибка при удалении товара: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      alert('Произошла ошибка при удалении товара');
    }
  };

  const handleConfirmClick = async () => {
    try {
      const response = await fetch(`https://testingnil.ru:8000/confirmProduct.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, userId: userInfo.id_usertg }),
      });

      const result = await response.json();

      if (result.success) {
        fetchProducts();
        alert('Товар успешно подтвержден');
        navigate('/catalog-moderate');
      } else {
        alert('Ошибка при подтверждении товара: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при подтверждении товара:', error);
      alert('Произошла ошибка при подтверждении товара');
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
      {fromModeratePage && (
      <button className="telegram-button" onClick={handleSellerClick}>
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.2597 2.74549C19.5246 1.45402 18.2561 0.380775 17.0264 0.855917L1.95202 6.68009C0.578698 7.21069 0.517506 9.13108 1.85425 9.748L5.13702 11.2632L6.69868 16.7289C6.77979 17.0128 7.00508 17.2327 7.29091 17.3068C7.57673 17.3808 7.88042 17.2981 8.0892 17.0893L10.4948 14.6837L13.8645 17.211C14.8427 17.9446 16.2515 17.4102 16.4972 16.2125L19.2597 2.74549ZM2.55268 8.23475L17.627 2.41058L14.8645 15.8777L10.9166 12.9167C10.5849 12.6678 10.1206 12.7008 9.82735 12.9941L8.79702 14.0244L9.1066 12.3218L15.1725 6.25594C15.4678 5.96073 15.4989 5.49263 15.2455 5.16086C14.9921 4.82908 14.5324 4.73602 14.1699 4.94315L5.79263 9.73008L2.55268 8.23475ZM6.81406 11.066L7.31938 12.8347L7.51338 11.7676C7.54371 11.6008 7.62417 11.4472 7.74403 11.3274L9.59393 9.47758L6.81406 11.066Z"
                    fill="white"
                  />
                </svg>
                Написать продавцу
              </button>)}
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
      {fromModeratePage && !product.is_confirmed && (
        <button className="confirm-button" onClick={handleConfirmClick}>Подтвердить товар</button>
      )}
      {fromModeratePage && product.is_confirmed && (
        <button className="confirm-button disabled" disabled>Товар уже подтвержден</button>
      )}
      {showPopup && (
        <div className="detail-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="detail-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Доступные дни</h3>
            {Object.keys(product.availabledays).map((day) => (
              <div key={day} className="detail-popup-item">
                <span>{day}:</span>
                <span>{product.availabledays[day]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;