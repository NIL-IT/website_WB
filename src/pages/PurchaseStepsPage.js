import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/PurchaseStepsPage.css";

const PurchaseStepsPage = ({ products }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id.toString() === id);
  const [formData, setFormData] = useState({
    image1: "",
    image2: "",
    article: "",
    cardNumber: "",
    bankName: "",
    cardHolder: "",
    phone: "",
    sbp: "",
  });
  const [uploaded, setUploaded] = useState({ image1: false, image2: false });
  const [isLoaded, setIsLoaded] = useState(false);
  const [articleError, setArticleError] = useState(false);
  const [imageError, setImageError] = useState({ image1: false, image2: false });
  const [checked, setChecked] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = "none";
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
        setUploaded({ ...uploaded, [imageField]: true });
        setImageError({ ...imageError, [imageField]: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArticleChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, article: value });
  };

  const handleStepSubmit = () => {
    if (step === 2) {
      if (formData.article !== product.article) {
        setArticleError(true);
      } else {
        setArticleError(false);
      }

      if (!uploaded.image2) {
        setImageError({ ...imageError, image2: true });
      } else {
        setImageError({ ...imageError, image2: false });
      }
    }
    // Add logic for proceeding to the next step if no errors
  };

  const keywords =
    product && product.keywords
      ? product.keywords.split(", ").map((keyword, index) => (
          <div key={index} className="keyword">
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6254 11.0158L17 16.1863M13.4444 6.79193C13.4444 10.0936 10.6587 12.7701 7.22222 12.7701C3.78579 12.7701 1 10.0936 1 6.79193C1 3.49026 3.78579 0.813721 7.22222 0.813721C10.6587 0.813721 13.4444 3.49026 13.4444 6.79193Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {keyword}
          </div>
        ))
      : [];

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <h1 className="purchase-step-title">Условия сделки</h1>
              <p className="purchase-step-subtitle">
                Выплата кэшбэка после получения товара в течение 3-х дней
              </p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning">
                <span className="important">Важно!</span> Товар нельзя сдавать
                обратно
              </p>
              <p className="purchase-step-text">
                На каждом шаге оформления выкупа вам будут даваться задания,
                такие как:
                <br />
                1. Найдите товар по инструкции;
                <br />
                2. Добавьте товар и бренд в избранное;
                <br />
                3. Купите товар - 1 шт;
                <br />
                4. Предоставьте видео разрезания штрих-кода;
                <br />
                5. Оставьте отзыв по ТЗ.
                <br />
                Необходимо четко следовать инструкции и прикреплять
                соответствующие скриншоты, где это требуется.
              </p>
              <p className="purchase-step-prices">
                Цена в магазине: {product.marketPrice} ₽<br />
                Цена для вас: {product.yourPrice} ₽
              </p>
              <button className="purchase-step-button">
                Я соглашаюсь с условиями
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <h1 className="purchase-step-title">
                Шаг 1: Поиск по ключевому слову
              </h1>
              <div className="purchase-step-keywords">{keywords}</div>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
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
                  {uploaded.image1 ? "Изображение загружено" : "Выберите изображение"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image1")}
                />
                {imageError.image1 && <p className="error-text">Пожалуйста, загрузите изображение корзины.</p>}
              </div>
              <div className="purchase-step-footer">
                <div
                  className="upload-feedback"
                  onClick={() => setChecked(!checked)}
                >
                  <div
                    className={`upload-checkbox ${checked ? "checked" : ""}`}
                  >
                    {checked && (
                      <svg viewBox="0 0 13 13">
                        <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                      </svg>
                    )}
                  </div>
                  <div className="upload-feedback-text">
                    Добавил(а) в корзину 2-3 товара
                  </div>
                </div>
                <button
                  className="purchase-step-button"
                  onClick={handleStepSubmit}
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
              <h1 className="purchase-step-title">
                Шаг 2: Найти товар продавца
              </h1>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-warning">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
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
                  style={{ display: isLoaded ? "block" : "none" }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
              <p className="purchase-step-text">
                Если артикул правильный, вы перейдете на следующий шаг.
              </p>
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Загрузите скрин нашего товара в конкурентной выдаче
              </p>
              <div className="article-input">
              <label className="upload-label" htmlFor="file-upload-competitor">
                {uploaded.image2 ? "Изображение загружено" : "Выберите изображение"}
              </label>
              <input
                id="file-upload-competitor"
                type="file"
                className="upload-input"
                onChange={(e) => handleFileUpload(e, "image2")}
              />
              {imageError.image2 && <p className="red-error">Загрузите изображение</p>}
              </div>
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Артикул товара (Введите артикул товара)
              </p>
              <p className="purchase-step-subtitle-12px-400">
                Найдите артикул товара и вставьте его для проверки
              </p>
              <div className="article-input">
                {articleError && <p className="red-error">Введен неверный артикул</p>}
                <input
                  type="text"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите артикул"
                />
              </div>
              <button
                className="purchase-step-button"
                onClick={handleStepSubmit}
              >
                Продолжить
              </button>
            </div>
          </div>
        );
        case 3:
          return (
            <div className="purchase-step-page">
              <div className="purchase-step-header">
                <h1 className="purchase-step-title">
                Шаг 3: Добавить товар и бренд в избранное
                </h1>
              </div>
              <div className="purchase-step-content">
                <p className="purchase-step-warning">
                  <span className="important">Важно! Соблюдайте инструкцию</span>
                </p>
                <ul className="purchase-step-text text-ul">
                  <li>Добавить товар в избранное;</li>
                  <li>Добавить бренд в избранное.</li>
                </ul>
                <div className="purchase-step-footer">
                  <div
                    className="upload-feedback"
                    onClick={() => setChecked(!checked)}
                  >
                    <div
                      className={`upload-checkbox ${checked ? "checked" : ""}`}
                    >
                      {checked && (
                        <svg viewBox="0 0 13 13">
                          <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                        </svg>
                      )}
                    </div>
                    <div className="upload-feedback-text">
                    Добавил(а) товар и бренд в избранное
                    </div>
                  </div>
                  <button
                    className="purchase-step-button"
                    onClick={handleStepSubmit}
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            </div>
          );
          case 4:
            return (
              <div className="purchase-step-page">
                <div className="purchase-step-header">
                  <h1 className="purchase-step-title">
                  Шаг 4: Реквизиты для перевода кешбэка
                  </h1>
                </div>
                <div className="purchase-step-content">
                  <p className="purchase-step-warning">
                    <span className="important">Важно! Соблюдайте инструкцию</span>
                  </p>
                  <p className="purchase-step-text">
                  Напишите свои реквизиты:
                <ul className="purchase-step-text text-ul">
                  <li>Номер карты;</li>
                  <li>Название банка;</li>
                  <li>ФИО владельца карты;</li>
                  <li>Телефон СБП для перевода.</li>
                </ul>
              </p>
              <div className="article-input">
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Номер карты
              </p>
                {articleError && <p className="red-error">Введен неверный номер карты</p>}
                <input
                  type="text"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите номер карты"
                />
              </div>
              <div className="article-input">
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Название банка
              </p>
                {articleError && <p className="red-error">Введено неверное название банка</p>}
                <input
                  type="text"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите название банка"
                />
              </div>
              <div className="article-input">
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                ФИО владельца карты
              </p>
                {articleError && <p className="red-error">Введено неверное ФИО владельца карты</p>}
                <input
                  type="text"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите ФИО владельца карты"
                />
              </div>
              <div className="article-input">
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Телефон или СБП для перевода
              </p>
                {articleError && <p className="red-error">Введен неверный номер телефона или СБП</p>}
                <input
                  type="text"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите номер телефона или СБП"
                />
              </div>
                  <div className="purchase-step-footer">
                    <div
                      className="upload-feedback"
                      onClick={() => setChecked(!checked)}
                    >
                      <div
                        className={`upload-checkbox ${checked ? "checked" : ""}`}
                      >
                        {checked && (
                          <svg viewBox="0 0 13 13">
                            <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                          </svg>
                        )}
                      </div>
                      <div className="upload-feedback-text">
                      Подтверждаю правильность реквизитов
                      </div>
                    </div>
                    <button
                      className="purchase-step-button"
                      onClick={handleStepSubmit}
                    >
                      Продолжить
                    </button>
                  </div>
                </div>
              </div>
            );
            case 5:
              return (
                <div className="purchase-step-page">
                  <div className="purchase-step-header">
                    <h1 className="purchase-step-title">
                    Шаг 5: Оформление заказа
                    </h1>
                  </div>
                  <div className="purchase-step-content">
                    <p className="purchase-step-warning">
                      <span className="important">Важно! Соблюдайте инструкцию</span>
                    </p>
                    <ul className="purchase-step-text text-ul">
                      <li>Оформите заказ;</li>
                      <li>Сделайте скрин из раздела "Доставки" в личном кабинете.</li>
                    </ul>
                    <p className="purchase-step-warning" style={{ marginTop: '20px' }}>
                    <span className="important">Важно!</span> На скрине обязательно должны быть видны цена и адрес ПВЗ!
              </p>
              <div className="article-input">
              <p className="upload-title" style={{ marginBottom: 0 }}>
              Загрузите скрин заказа в отчет
              </p>
              <label className="upload-label" htmlFor="file-upload-competitor">
                {uploaded.image2 ? "Изображение загружено" : "Выберите изображение"}
              </label>
              <input
                id="file-upload-competitor"
                type="file"
                className="upload-input"
                onChange={(e) => handleFileUpload(e, "image2")}
              />
              {imageError.image2 && <p className="red-error">Загрузите изображение</p>}
              </div>
                    <div className="purchase-step-footer">
                      <div
                        className="upload-feedback"
                        onClick={() => setChecked(!checked)}
                      >
                        <div
                          className={`upload-checkbox ${checked ? "checked" : ""}`}
                        >
                          {checked && (
                            <svg viewBox="0 0 13 13">
                              <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                            </svg>
                          )}
                        </div>
                        <div className="upload-feedback-text">
                        Оформил(а) заказ
                        </div>
                      </div>
                      <button
                        className="purchase-step-button"
                        onClick={handleStepSubmit}
                      >
                        Продолжить
                      </button>
                    </div>
                  </div>
                </div>
              );
              case 6:
                return (
                  <div className="purchase-step-page">
                    <div className="purchase-step-header">
                      <h1 className="purchase-step-title">
                      Шаг 6: Получение товара
                      </h1>
                    </div>
                    <div className="purchase-step-content">
                      <p className="purchase-step-warning">
                        <span className="important">Важно! Соблюдайте инструкцию</span>
                      </p>
                      <ul className="purchase-step-text text-ul">
                        <li>Заберите товар через 1-3 дня;</li>
                        <li>Сделайте скриншот из личного кабинета, где указана дата получения и статус “Доставлено”.</li>
                      </ul>
                      <p className="purchase-step-warning" style={{ marginTop: '20px' }}>
                      <span className="important">Важно!</span> Напоминаем, что вы согласились с условием сделки и товар не может быть сдан обратно.
                </p>
                <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                Загрузите скриншот, подтверждающий, что заказ доставлен
                </p>
                <label className="upload-label" htmlFor="file-upload-competitor">
                  {uploaded.image2 ? "Изображение загружено" : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image2")}
                />
                {imageError.image2 && <p className="red-error">Загрузите изображение</p>}
                </div>
                      <div className="purchase-step-footer">
                        <div
                          className="upload-feedback"
                          onClick={() => setChecked(!checked)}
                        >
                          <div
                            className={`upload-checkbox ${checked ? "checked" : ""}`}
                          >
                            {checked && (
                              <svg viewBox="0 0 13 13">
                                <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                              </svg>
                            )}
                          </div>
                          <div className="upload-feedback-text">
                          Забрал(а) товар
                          </div>
                        </div>
                        <button
                          className="purchase-step-button"
                          onClick={handleStepSubmit}
                        >
                          Продолжить
                        </button>
                      </div>
                    </div>
                  </div>
                );
                case 7:
                  return (
                    <div className="purchase-step-page">
                      <div className="purchase-step-header">
                        <h1 className="purchase-step-title">
                        Шаг 7: Отчет об отзыве
                        </h1>
                      </div>
                      <div className="purchase-step-content">
                        <p className="purchase-step-warning">
                          <span className="important">Важно! Соблюдайте инструкцию</span>
                        </p>
                        <ul className="purchase-step-text text-ul">
                          <li>Оставьте положительный текстовый отзыв, прикрепите фото и поставьте 5 звёзд;</li>
                          <li>Запишите видео с разрезанным штрих-кодом на фоне товара;</li>
                          <li>Прикрепите скриншот, где видно, что отзыв уже опубликован;</li>
                          <li>Прикрепите видео с разрезанным штрих-кодом.</li>
                        </ul>
                  <div className="article-input">
                  <p className="upload-title" style={{ marginBottom: 0 }}>
                  Загрузите скриншот опубликованного отзыва
                  </p>
                  <label className="upload-label" htmlFor="file-upload-competitor">
                    {uploaded.image2 ? "Изображение загружено" : "Выберите изображение"}
                  </label>
                  <input
                    id="file-upload-competitor"
                    type="file"
                    className="upload-input"
                    onChange={(e) => handleFileUpload(e, "image2")}
                  />
                  {imageError.image2 && <p className="red-error">Загрузите изображение</p>}
                  </div>
                  <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                Загрузите видео с разрезанным штрих-кодом на фоне товара
                </p>
                <label className="upload-label" htmlFor="file-upload-competitor">
                  {uploaded.image2 ? "Изображение загружено" : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image2")}
                />
                {imageError.image2 && <p className="red-error">Загрузите изображение</p>}
                </div>
                        <div className="purchase-step-footer">
                          <div
                            className="upload-feedback"
                            onClick={() => setChecked(!checked)}
                          >
                            <div
                              className={`upload-checkbox ${checked ? "checked" : ""}`}
                            >
                              {checked && (
                                <svg viewBox="0 0 13 13">
                                  <path d="M11.25 3.75L4.75 10.25L1.75 7.25L2.75 6.25L4.75 8.25L10.25 2.75L11.25 3.75Z" />
                                </svg>
                              )}
                            </div>
                            <div className="upload-feedback-text">
                            Оставил(а) отзыв
                            </div>
                          </div>
                          <button
                            className="purchase-step-button"
                            onClick={handleStepSubmit}
                          >
                            Продолжить
                          </button>
                        </div>
                      </div>
                    </div>
                  );
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="purchase-step-page-container">{renderStepContent()}</div>
  );
};

export default PurchaseStepsPage;
