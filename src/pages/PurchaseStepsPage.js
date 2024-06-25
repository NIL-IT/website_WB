import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PurchaseStepsPage.css';

const PurchaseStepsPage = ({ products, onStepComplete }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id.toString() === id);
  const [step, setStep] = useState(product ? parseInt(product.step) : 0);
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

  useEffect(() => {
    if (product) {
      const savedStep = localStorage.getItem(`step_${product.id}`);
      const savedFormData = localStorage.getItem(`formData_${product.id}`);
      if (savedStep) setStep(parseInt(savedStep));
      if (savedFormData) setFormData(JSON.parse(savedFormData));
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      localStorage.setItem(`step_${product.id}`, step);
      localStorage.setItem(`formData_${product.id}`, JSON.stringify(formData));
    }
  }, [step, formData, product]);

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      setUploaded(true);
    }
  };

  const handleNextStep = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e, imageField) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [imageField]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStepComplete = () => {
    onStepComplete(step, formData);
    handleNextStep();
  };

  const keywords = product.keywords.split(", ").map((keyword, index) => (
    <div key={index} className="keyword">
      {keyword}
      <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.6254 11.0158L17 16.1863M13.4444 6.79193C13.4444 10.0936 10.6587 12.7701 7.22222 12.7701C3.78579 12.7701 1 10.0936 1 6.79193C1 3.49026 3.78579 0.813721 7.22222 0.813721C10.6587 0.813721 13.4444 3.49026 13.4444 6.79193Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  ));

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
              <button className="purchase-step-button" onClick={handleStepComplete}>Я соглашаюсь с условиями</button>
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
                <label className="upload-label" htmlFor="file-upload">
                  {uploaded ? 'Изображение загружено' : 'Выберите изображение'}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="upload-input"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="upload-feedback" onClick={() => setChecked(!checked)}>
                <div className="upload-checkbox">
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
                onClick={handleStepComplete}
                disabled={!uploaded || !checked}
              >
                Продолжить
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <input type="file" onChange={(e) => handleImageUpload(e, 'image2')} required />
            <input type="text" name="article" value={formData.article} onChange={handleInputChange} placeholder="Артикул товара" required />
            <button onClick={handleStepComplete}>Далее</button>
          </div>
        );
      default:
        return <div>Процесс завершен</div>;
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="purchase-steps-page">
      {renderStepContent()}
    </div>
  );
};

export default PurchaseStepsPage;
