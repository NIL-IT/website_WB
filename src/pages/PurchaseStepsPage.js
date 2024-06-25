import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PurchaseStepsPage.css';

const PurchaseStepsPage = ({ products }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id.toString() === id);
  const [formData, setFormData] = useState({
    image1: '',
    image2: '',
    article: '',
    cardNumber: '',
    bankName: '',
    cardHolder: '',
    phone: '',
    sbp: '',
  });
  const [uploaded, setUploaded] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = 'none';
  };

  const step = product ? parseInt(product.step) : 0;

  useEffect(() => {
    if (product) {
      const savedFormData = localStorage.getItem(`formData_${product.id}`);
      if (savedFormData) setFormData(JSON.parse(savedFormData));
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      localStorage.setItem(`formData_${product.id}`, JSON.stringify(formData));
    }
  }, [formData, product]);

  const handleFileUpload = (event, imageField) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [imageField]: reader.result });
        setUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const keywords = product && product.keywords ? product.keywords.split(", ").map((keyword, index) => (
    <div key={index} className="keyword">
      <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.6254 11.0158L17 16.1863M13.4444 6.79193C13.4444 10.0936 10.6587 12.7701 7.22222 12.7701C3.78579 12.7701 1 10.0936 1 6.79193C1 3.49026 3.78579 0.813721 7.22222 0.813721C10.6587 0.813721 13.4444 3.49026 13.4444 6.79193Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {keyword}
    </div>
  )) : [];

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <h1 className="purchase-step-title">Условия сделки</h1>
              <p className="purchase-step-subtitle">Выплата кэшбэка после получения товара в течение 3-х дней</p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning"><span className="important">Важно!</span> Товар нельзя сдавать обратно</p>
              <p className="purchase-step-text">
                На каждом шаге оформления выкупа вам будут даваться задания, такие как:
                <br />1. Найдите товар по инструкции;
                <br />2. Добавьте товар и бренд в избранное;
                <br />3. Купите товар - 1 шт;
                <br />4. Предоставьте видео разрезания штрих-кода;
                <br />5. Оставьте отзыв по ТЗ.
                <br />Необходимо четко следовать инструкции и прикреплять соответствующие скриншоты, где это требуется.
              </p>
              <p className="purchase-step-prices">
                Цена в магазине: {product.marketPrice} ₽<br />
                Цена для вас: {product.yourPrice} ₽
              </p>
              <button className="purchase-step-button">Я соглашаюсь с условиями</button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <h1 className="purchase-step-title">Шаг 1: Поиск по ключевому слову</h1>
              <div className="purchase-step-keywords">
                {keywords}
              </div>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning"><span className="important">Важно! Соблюдайте инструкцию</span></p>
              <ul className="purchase-step-text text-ul">
                <li>Оформление заказа на 50-ом шаге</li>
                <li>Пока не ищите наш товар</li>
                <li>Напишите ключевое поле в поисковик сайта</li>
                <li>Смотрите товары других продавцов</li>
                <li>Добавьте несколько товаров в корзину</li>
                <li>Сделайте скрин корзины и загрузите отчет</li>
              </ul>
              <div className="upload-section">
                <p className="upload-title">Загрузите скрин корзины</p>
                <label className="upload-label" htmlFor="file-upload">
                  {uploaded ? 'Изображение загружено' : 'Выберите изображение'}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, 'image1')}
                />
              </div>
              <div className="purchase-step-footer">
                <div className="upload-feedback" onClick={() => setChecked(!checked)}>
                  <div className={`upload-checkbox ${checked ? 'checked' : ''}`}>
                    {checked && (
                      <svg viewBox="0 0 13 13">
                        <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                      </svg>
                    )}
                  </div>
                  <div className="upload-feedback-text">Добавил(а) в корзину 2-3 товара</div>
                </div>
                <button
                  className="purchase-step-button"
                  disabled={!uploaded || !checked}
                >
                  Продолжить
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <h1 className="purchase-step-title">Шаг 2: Найти товар продавца</h1>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning"><span className="important">Важно! Соблюдайте инструкцию</span></p>
              <p className="purchase-step-text">
                Найдите наш товар (фото карточки товара ниже).
                <ul className="purchase-step-text text-ul">
                  <li>Используйте ключевое слово;</li>
                  <li>Найдите товар в поисковой выдаче, используйте фильтр;</li>
                  <li>Сделайте скрин нашего товара в конкурентной выдаче;</li>
                  <li>Вставьте артикул товара для проверки.</li>
                </ul>
              </p>
              <div className="purchase-step-image">
              {!isLoaded && <div className="purchase-step-skeleton"></div>}
      <img
        src={product.image}
        alt={product.name}
        className="product-image-detail"
        style={{ display: isLoaded ? 'block' : 'none' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
              </div>
              <p className="purchase-step-text">Если артикул правильный, вы перейдете на следующий шаг.</p>
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>Загрузите скрин нашего товара в конкурентной выдаче</p>
                <label className="upload-label" htmlFor="file-upload-competitor">
                  {uploaded ? 'Изображение загружено' : 'Выберите изображение'}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, 'image2')}
                />
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>Артикул товара (Введите артикул товара)</p>
              <p className="purchase-step-subtitle-12px-400">Найдите артикул товара и вставьте его для проверки</p>
              <input
                type="text"
                name="article"
                value={formData.article}
                onChange={handleInputChange}
                placeholder="Введите артикул"
              />
              <button className="purchase-step-button" disabled={!uploaded}>Продолжить</button>
            </div>
          </div>
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  return <div className="purchase-step-page-container">{renderStepContent()}</div>;
};

export default PurchaseStepsPage;
