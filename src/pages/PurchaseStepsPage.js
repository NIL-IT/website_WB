import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "../styles/PurchaseStepsPage.css";

const PurchaseStepsPage = ({
  userSteps,
  fetchUserSteps,
  userInfo,
  fetchProducts,
}) => {
  const { id } = useParams();
  const baseURL = "https://testingnil.ru:8000/";
  const userStep = userSteps.find((userStep) => userStep.id.toString() === id);

  const handleSellerClick = () => {
    if (userStep && userStep.tg_nick) {
      window.open(
        `https://t.me/${userStep.tg_nick}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      console.error("Telegram nickname not found or userStep is undefined");
    }
  };

  const [formData, setFormData] = useState({
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    article: "",
    cardNumber: "",
    bankName: "",
    cardHolder: "",
    phone: "",
  });

  const [uploaded, setUploaded] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
    image6: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [articleError, setArticleError] = useState(false);
  const [imageError, setImageError] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
    image6: false,
  });

  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState({
    cardNumber: false,
    bankName: false,
    cardHolder: false,
    phone: false,
  });

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  document.addEventListener(
    "touchstart",
    function (event) {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        event.preventDefault();
      }
    },
    false
  );

  const handleImageError = (event) => {
    event.target.style.display = "none";
  };

  const step = userStep ? parseInt(userStep.step) : 0;

  useEffect(() => {
    setChecked(false);
  }, [step, userStep]);

  useEffect(() => {
    if (userStep) {
      const savedFormData = localStorage.getItem(`formData_${userStep.id}`);
      const savedChecked = localStorage.getItem(`checked_${userStep.id}`);
      if (savedFormData) setFormData(JSON.parse(savedFormData));
      if (savedChecked) setChecked(JSON.parse(savedChecked));
    }
  }, [userStep]);

  useEffect(() => {
    if (userStep) {
      localStorage.setItem(`formData_${userStep.id}`, JSON.stringify(formData));
      localStorage.setItem(`checked_${userStep.id}`, JSON.stringify(checked));
    }
  }, [formData, checked, userStep]);

  const handleFileUpload = async (event, imageField) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1920,
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, [imageField]: reader.result });
          setUploaded({ ...uploaded, [imageField]: true });
          setImageError({ ...imageError, [imageField]: false });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Ошибка сжатия изображения:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleArticleChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, article: value });
  };

  const handleStepSubmit = async () => {
    if (step === 0) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение успешно загружено и обновлен шаг 0");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки изображения:" + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 1) {
      if (!uploaded.image1) {
        setImageError({ ...imageError, image1: true });
        return;
      }

      if (!checked) {
        alert("Пожалуйста, подтвердите, что вы добавили 2-3 товара в корзину.");
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image1", formData.image1);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение успешно загружено и обновлен шаг 1");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 2) {
      if (!uploaded.image2) {
        setImageError({ ...imageError, image2: true });
        return;
      }
      if (!formData.article.trim()) {
        setArticleError(true);
        return;
      }

      if (formData.article !== userStep.article) {
        setArticleError(true);
        return;
      } else {
        setArticleError(false);
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image2", formData.image2);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение успешно загружено и обновлен шаг 2");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        console.error("Ошибка запроса:" + error);
      }
    } else if (step === 3) {
      if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 3.");
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Обновлен шаг 3");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 4) {
      if (!checked) {
        alert("Пожалуйста, подтвердите правильность ввода данных. ");
        return;
      }

      const newErrors = {
        cardNumber: !formData.cardNumber,
        bankName: !formData.bankName,
        cardHolder: !formData.cardHolder,
        phone: !formData.phone,
      };

      setErrors(newErrors);

      if (Object.values(newErrors).some((error) => error)) {
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("cardNumber", formData.cardNumber);
        formDataToSend.append("bankName", formData.bankName);
        formDataToSend.append("cardHolder", formData.cardHolder);
        formDataToSend.append("phone", formData.phone);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Данные успешно загружены и обновлен шаг 4");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 5) {
      if (!uploaded.image3) {
        setImageError({ ...imageError, image3: true });
        return;
      }
      if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 5.");
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image3", formData.image3);
        formDataToSend.append("id_usertg", userInfo.id_usertg);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение загружено и обновлен шаг 5");
          fetchProducts();
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 6) {
      if (!uploaded.image4) {
        setImageError({ ...imageError, image4: true });
        return;
      }
      if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 6.");
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image4", formData.image4);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение загружено и обновлен шаг 6");
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
      }
    } else if (step === 7) {
      if (!uploaded.image5) {
        setImageError({ ...imageError, image5: true });
        return;
      }
      if (!uploaded.image6) {
        setImageError({ ...imageError, image6: true });
        return;
      }
      if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 7.");
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image5", formData.image5);
        formDataToSend.append("image6", formData.image6);
        formDataToSend.append("id_usertg", userInfo.id_usertg);

        const response = await fetch(`${baseURL}updateStep.php`, {
          method: "POST",
          body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
          // alert("Изображение загружено и обновлен шаг 7");
          setChecked(false);
          localStorage.removeItem(`formData_${userStep.id}`);
          localStorage.removeItem(`checked_${userStep.id}`);
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
        } else {
          alert("Ошибка загрузки данных: " + result.error);
        }
      } catch (error) {
        console.error("Ошибка запроса:" + error);
      }
    }
  };

  const keywords =
    userStep && userStep.keywords
      ? userStep.keywords.split(", ").map((keyword, index) => (
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

  const keywordsRef = useRef(null);

  const scrollLeft = () => {
    if (keywordsRef.current) {
      keywordsRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (keywordsRef.current) {
      keywordsRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Условия сделки</p>
              <p className="purchase-step-subtitle">
                Выплата кэшбэка после получения товара в течение 3-х дней
              </p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно!</span> Товар нельзя сдавать
                обратно
              </p>
              <p className="purchase-step-text">
                На каждом шаге оформления выкупа вам будут даваться задания,
                такие как:
                <br /> 1. Найдите товар по инструкции;
                <br /> 2. Добавьте товар и бренд в избранное;
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
              <p className="purchase-step-text">
                Цена в магазине: {userStep.marketprice} ₽<br />
                Цена для вас: {userStep.yourprice} ₽
              </p>
              <div className="step-footer-container">
                <button
                  className="purchase-step-button"
                  onClick={handleStepSubmit}
                  disabled={userStep.availableday === 0}
                >
                  {userStep.availableday === 0
                    ? "Товар сегодня недоступен"
                    : "Я соглашаюсь с условиями"}
                </button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">
                Шаг 1: Поиск по ключевому слову
              </p>
              <div className="purchase-keywords-container">
                <div className="arrow left" onClick={scrollLeft}>
                  &lt;
                </div>
                <div className="purchase-step-keywords" ref={keywordsRef}>
                  {keywords}
                </div>
                <div className="arrow right" onClick={scrollRight}>
                  &gt;
                </div>
              </div>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
              <ul className="purchase-step-text text-ul">
                <li>Оформление заказа на 5-ом шаге</li>
                <li>Пока не ищите наш товар</li>
                <li>
                  Напишите ключевое слово (указано наверху рядом с лупой) в
                  поиске маркетплейса
                </li>
                <li>Смотрите товары других продавцов</li>
                <li>Добавьте несколько товаров в корзину</li>
                <li>Сделайте скрин корзины и загрузите отчет</li>
              </ul>
              <div className="upload-section" style={{ marginTop: "20px" }}>
                <p className="upload-title">Загрузите скрин корзины</p>
                <label className="upload-label" htmlFor="file-upload">
                  {uploaded.image1
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image1")}
                />
                {imageError.image1 && (
                  <p className="red-error">
                    Пожалуйста, загрузите изображение корзины.
                  </p>
                )}
              </div>
              <div className="step-footer-container">
                <div
                  className="upload-feedback-step4"
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
                  disabled={userStep.availableday === 0}
                >
                  {userStep.availableday === 0
                    ? "Товар сегодня недоступен"
                    : "Продолжить"}
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="purchase-step-page-long">
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 2: Найти товар продавца</p>
              <div className="purchase-keywords-container">
                <div className="arrow left" onClick={scrollLeft}>
                  &lt;
                </div>
                <div className="purchase-step-keywords" ref={keywordsRef}>
                  {keywords}
                </div>
                <div className="arrow right" onClick={scrollRight}>
                  &gt;
                </div>
              </div>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
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
                  src={userStep.image}
                  alt={userStep.name}
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
                <label
                  className="upload-label"
                  htmlFor="file-upload-competitor"
                >
                  {uploaded.image2
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image2")}
                />
                {imageError.image2 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
              </div>
              <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                Артикул товара (Введите артикул товара)
              </p>
              <p className="purchase-step-subtitle-12px-400">
                Найдите артикул товара и вставьте его для проверки. Артикул
                можно узнать в карточке товара в разделе «Характеристики и
                описание».
              </p>
              <div className="article-input-step2">
                <input
                  type="number"
                  name="article"
                  value={formData.article}
                  onChange={handleArticleChange}
                  placeholder="Введите артикул"
                />
                {articleError && (
                  <p className="red-error">Введен неверный артикул</p>
                )}
              </div>
              <div className="step-footer-container">
                <button
                  className="purchase-step-button"
                  onClick={handleStepSubmit}
                  disabled={userStep.availableday === 0}
                >
                  {userStep.availableday === 0
                    ? "Товар сегодня недоступен"
                    : "Продолжить"}
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">
                Шаг 3: Добавить товар и бренд в избранное
              </p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
              <ul
                className="purchase-step-text text-ul"
                style={{ marginBottom: "20px" }}
              >
                <li>Добавить товар в избранное;</li>
                <li>Добавить бренд в избранное.</li>
              </ul>
              <div
                className="upload-feedback-step4"
                onClick={() => setChecked(!checked)}
              >
                <div className={`upload-checkbox ${checked ? "checked" : ""}`}>
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
              <div className="step-footer-container"></div>
              <button
                className="purchase-step-button"
                onClick={handleStepSubmit}
                disabled={userStep.availableday === 0}
              >
                {userStep.availableday === 0
                  ? "Товар сегодня недоступен"
                  : "Продолжить"}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">
                Шаг 4: Реквизиты для перевода кешбэка
              </p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
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
                <input
                  type="number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="Введите номер карты"
                />
                {errors.cardNumber && (
                  <p className="red-error">Заполните поле</p>
                )}
              </div>
              <div className="article-input">
                <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                  Название банка
                </p>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Введите название банка"
                />
                {errors.bankName && <p className="red-error">Заполните поле</p>}
              </div>
              <div className="article-input">
                <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                  ФИО владельца карты
                </p>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="Введите ФИО владельца карты"
                />
                {errors.cardHolder && (
                  <p className="red-error">Заполните поле</p>
                )}
              </div>
              <div className="article-input" style={{ marginBottom: "25vh" }}>
                <p className="purchase-step-text" style={{ marginBottom: 0 }}>
                  Телефон для перевода
                </p>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Введите номер телефона или СБП"
                />
                {errors.phone && <p className="red-error">Заполните поле</p>}
              </div>
              <div className="step-footer-container">
                <div
                  className="upload-feedback-step4"
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
                  disabled={userStep.availableday === 0}
                >
                  {userStep.availableday === 0
                    ? "Товар сегодня недоступен"
                    : "Продолжить"}
                </button>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 5: Оформление заказа</p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
              <ul className="purchase-step-text text-ul">
                <li>Оформите заказ;</li>
                <li>Сделайте скрин из раздела "Доставки" в личном кабинете.</li>
              </ul>
              <p className="purchase-step-text" style={{ marginTop: "20px" }}>
                <span className="important">Важно!</span> На скрине обязательно
                должны быть видны цена и адрес ПВЗ!
              </p>
              <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                  Загрузите скрин заказа в отчет
                </p>
                <label
                  className="upload-label"
                  htmlFor="file-upload-competitor"
                >
                  {uploaded.image3
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image3")}
                />
                {imageError.image3 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
              </div>
              <div className="step-footer-container">
                <div
                  className="upload-feedback-step4"
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
                  <div className="upload-feedback-text">Оформил(а) заказ</div>
                </div>
                <button
                  className="purchase-step-button"
                  onClick={handleStepSubmit}
                  disabled={userStep.availableday === 0}
                >
                  {userStep.availableday === 0
                    ? "Товар сегодня недоступен"
                    : "Продолжить"}
                </button>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 6: Получение товара</p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
              <ul className="purchase-step-text text-ul">
                <li>Заберите товар через 1-3 дня;</li>
                <li>
                  Сделайте скриншот из личного кабинета, где указана дата
                  получения и статус “Доставлено”.
                </li>
                <li>
                  Зайдите снова в бот и в нижнем меню выберите иконку корзины.
                  Там вы найдете оформленный заказ и вернетесь на этот шаг для
                  загрузки скриншота.
                </li>
              </ul>
              <p className="purchase-step-text" style={{ marginTop: "20px" }}>
                <span className="important">Важно!</span> Напоминаем, что вы
                согласились с условием сделки и товар не может быть сдан
                обратно.
              </p>
              <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                  Загрузите скриншот, подтверждающий, что заказ доставлен
                </p>
                <label
                  className="upload-label"
                  htmlFor="file-upload-competitor"
                >
                  {uploaded.image4
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image4")}
                />
                {imageError.image4 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
              </div>
              <div className="step-footer-container">
                <div
                  className="upload-feedback-step4"
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
                  <div className="upload-feedback-text">Забрал(а) товар</div>
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
              <p className="title-class-step">Шаг 7: Отчет об отзыве</p>
            </div>
            <div className="purchase-step-content">
              <p className="purchase-step-text">
                <span className="important">Важно! Соблюдайте инструкцию</span>
              </p>
              <ul
                className="purchase-step-text text-ul"
                style={{ marginBottom: "20px" }}
              >
                <li>
                  Оставьте положительный текстовый отзыв, прикрепите фото и
                  поставьте 5 звёзд;
                </li>
                <li>
                  Запишите видео с разрезанным штрих-кодом на фоне товара;
                </li>
                <li>
                  Прикрепите скриншот, где видно, что отзыв уже опубликован;
                </li>
                <li>Прикрепите видео с разрезанным штрих-кодом.</li>
              </ul>
              <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                  Загрузите скриншот опубликованного отзыва
                </p>
                <label
                  className="upload-label"
                  htmlFor="file-upload-competitor1"
                >
                  {uploaded.image5
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor1"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image5")}
                />
                {imageError.image5 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
              </div>
              <div className="article-input">
                <p className="upload-title" style={{ marginBottom: 0 }}>
                  Загрузите фотографию с разрезанным штрих-кодом на фоне товара
                </p>
                <label
                  className="upload-label"
                  htmlFor="file-upload-competitor2"
                >
                  {uploaded.image6
                    ? "Изображение загружено"
                    : "Выберите изображение"}
                </label>
                <input
                  id="file-upload-competitor2"
                  type="file"
                  className="upload-input"
                  onChange={(e) => handleFileUpload(e, "image6")}
                />
                {imageError.image6 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
              </div>
              <div className="step-footer-container">
                <div
                  className="upload-feedback-step4"
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
                  <div className="upload-feedback-text">Оставил(а) отзыв</div>
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
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Сделка № {userStep.id}</p>
            </div>
            <div className="purchase-step-content">
              <div key={userStep.id} className="purchase-item">
                <div
                  className="purchase-skeleton"
                  style={{ display: isLoaded ? "none" : "block" }}
                ></div>
                <img
                  src={userStep.image}
                  alt={userStep.name}
                  className="purchase-image"
                  style={{ display: isLoaded ? "block" : "none" }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <div className="purchase-details">
                  <h2 className="purchase-title">{userStep.name}</h2>
                  <p className="purchase-price">
                    Цена для вас: {userStep.yourprice} ₽
                  </p>
                  <p className="purchase-step">
                    Шаги: {userStep.step}
                    {userStep.isComplete && (
                      <span style={{ marginLeft: "4px" }}>
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0 4C0 1.79086 1.79086 0 4 0C6.20915 0 8 1.79086 8 4C8 6.20915 6.20915 8 4 8C1.79086 8 0 6.20915 0 4Z"
                            fill="#04B800"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.6858 2.87243C5.79479 2.98141 5.79479 3.15811 5.6858 3.26708L3.96442 4.9885C3.71014 5.24279 3.29782 5.24279 3.04354 4.9885L2.3144 4.25935C2.20542 4.15036 2.20542 3.97365 2.3144 3.86467C2.42339 3.75568 2.60008 3.75568 2.70907 3.86467L3.43821 4.59382C3.47453 4.63014 3.53343 4.63014 3.56974 4.59382L5.29116 2.87243C5.40014 2.76345 5.57681 2.76345 5.6858 2.87243Z"
                            fill="black"
                          />
                        </svg>
                      </span>
                    )}
                  </p>
                </div>
              </div>
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
              </button>
              <p
                className="font-16px-600"
                style={{ marginTop: "30px", marginBottom: 0 }}
              >
                Реквизиты для перевода
              </p>
              <p
                className="font-16px-400"
                style={{ marginTop: "15px", marginBottom: 0 }}
              >
                {userStep.cardholder}
              </p>
              <p
                className="font-16px-400"
                style={{ marginTop: "6px", marginBottom: 0 }}
              >
                {userStep.bankname} {userStep.phone}
              </p>
              <p
                className="font-16px-600"
                style={{ marginTop: "15px", marginBottom: 0 }}
              >
                Условия сделки
              </p>
              <p
                className="font-16px-400"
                style={{ marginTop: "10px", marginBottom: 0 }}
              >
                {userStep.terms}
              </p>
              <p
                className="font-16px-600"
                style={{ marginTop: "25px", marginBottom: 0 }}
              >
                Если есть вопросы, напишите нам
              </p>
              <button
                className="button-help"
                style={{ marginTop: "10px", marginBottom: 0 }}
                onClick={() => {
                  window.open(
                    "https://t.me/lAlexonl",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                Поддержка
              </button>
            </div>
          </div>
        );
    }
  };

  return renderStepContent();
};

export default PurchaseStepsPage;
