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
  const baseURL = "https://testingnil6.ru:8000/";
  const userStep = userSteps.find((userStep) => userStep.id.toString() === id);
  const [showPopup, setShowPopup] = useState(false);

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

  const Popup = ({ message, onClose }) => (
<div className="catalog-popup-overlay">
          <div className="catalog-popup">
            <svg
              width="42"
              height="42"
              viewBox="0 0 42 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 42C32.598 42 42 32.598 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 32.598 9.40202 42 21 42Z"
                fill="#4CAF50"
              />
              <path
                d="M31.6001 11.6L18.0001 25.2L12.4001 19.6L9.6001 22.4L18.0001 30.8L34.4001 14.4L31.6001 11.6Z"
                fill="#CCFF90"
              />
            </svg>

            <p
              style={{
                fontFamily: "Helvetica Neue Cyr",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              Все готово!
            </p>
            <p
              style={{
                fontFamily: "Helvetica Neue Cyr",
                fontSize: "16px",
                fontWeight: 400,
              }}
            >
              {message}
            </p>
          </div>
        </div>
  );

  const [formData, setFormData] = useState({
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    image7: "",
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
    image7: false,
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
    image7: false,
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
    if (name === "phone") {
      let phoneValue = value.replace(/\D/g, ""); // Удаление всех символов, кроме цифр
      if (phoneValue.startsWith("7")) {
        phoneValue = phoneValue.slice(1);
      }
      setFormData({ ...formData, [name]: "+7" + phoneValue.slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
          localStorage.clear()
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
        localStorage.clear()
      }
    } else if (step === 1) {
      if (!checked) {
          alert("Пожалуйста, подтвердите, что вы добавили 2-3 товара в корзину.");
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
              setChecked(false);
              localStorage.removeItem(`formData_${userStep.id}`);
              localStorage.removeItem(`checked_${userStep.id}`);
              const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
              console.log(updatedUserSteps);
          } else {
              alert("Ошибка загрузки данных: " + result.error);
              localStorage.clear();
          }
      } catch (error) {
          alert("Ошибка запроса:" + error);
          localStorage.clear();
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
  
      if (Number(formData.article) !== Number(userStep.article)) {
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
              setChecked(false);
              localStorage.removeItem(`formData_${userStep.id}`);
              localStorage.removeItem(`checked_${userStep.id}`);
              const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
              console.log(updatedUserSteps);
          } else {
              alert("Ошибка загрузки данных: " + result.error);
              localStorage.clear();
          }
      } catch (error) {
          console.error("Ошибка запроса:" + error);
          localStorage.clear();
      }
  } else if (step === 3) {
      if (!uploaded.image1) { // Проверка на наличие image1
          setImageError({ ...imageError, image1: true });
          return;
      }
  
      if (!checked) {
          alert("Пожалуйста, подтвердите выполнение задачи на шаге 3.");
          return;
      }
  
      try {
          const formDataToSend = new FormData();
          formDataToSend.append("id", userStep.id);
          formDataToSend.append("image1", formData.image1); // Добавляем image1
  
          const response = await fetch(`${baseURL}updateStep.php`, {
              method: "POST",
              body: formDataToSend,
          });
          const result = await response.json();
          if (result.success) {
              setChecked(false);
              localStorage.removeItem(`formData_${userStep.id}`);
              localStorage.removeItem(`checked_${userStep.id}`);
              const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
              console.log(updatedUserSteps);
          } else {
              alert("Ошибка загрузки данных: " + result.error);
              localStorage.clear();
          }
      } catch (error) {
          alert("Ошибка запроса:" + error);
          localStorage.clear();
      }
    } else if (step === 4) {
      if (!uploaded.image3) { // Проверка на наличие image1
        setImageError({ ...imageError, image3: true });
        return;
    }

    if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 4.");
        return;
    }

    try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image3", formData.image3); // Добавляем image1

        const response = await fetch(`${baseURL}updateStep.php`, {
            method: "POST",
            body: formDataToSend,
        });
        const result = await response.json();
        if (result.success) {
            setChecked(false);
            localStorage.removeItem(`formData_${userStep.id}`);
            localStorage.removeItem(`checked_${userStep.id}`);
            const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
            console.log(updatedUserSteps);
        } else {
            alert("Ошибка загрузки данных: " + result.error);
            localStorage.clear();
        }
    } catch (error) {
        alert("Ошибка запроса:" + error);
        localStorage.clear();
    }
    } else if (step === 5) {
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
          localStorage.clear()
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
        localStorage.clear()
      }
    }
     else if (step === 6) {
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
          localStorage.clear()
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
        localStorage.clear()
      }
    } else if (step === 7) {
      if (!uploaded.image5) {
        setImageError({ ...imageError, image5: true });
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
          localStorage.clear()
        }
      } catch (error) {
        alert("Ошибка запроса:" + error);
        localStorage.clear()
      }
    } else if (step === 8) {
      if (!uploaded.image6) {
        setImageError({ ...imageError, image6: true });
        return;
      }
      if (!uploaded.image6) {
        setImageError({ ...imageError, image7: true });
        return;
      }
      if (!checked) {
        alert("Пожалуйста, подтвердите выполнение задачи на шаге 8.");
        return;
      }
      
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("id", userStep.id);
        formDataToSend.append("image6", formData.image6);
        formDataToSend.append("image7", formData.image7);
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
          setShowPopup(true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
          const updatedUserSteps = await fetchUserSteps(userInfo.id_usertg);
          console.log(updatedUserSteps);
          localStorage.clear()
        } else {
          alert("Ошибка загрузки данных: " + result.error);
          localStorage.clear()
        }
      } catch (error) {
        console.error("Ошибка запроса:" + error);
        localStorage.clear()
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
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
                Срок выплаты кэшбэка в течении 3-10 дней после завершения отчета
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
                <br /> 3. Подписаться на одну из социальных сетей бренда на выбор;
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
              <p className="purchase-step-text">
              С одного аккаунта маркетплэйса можно выкупить только 1 единицу товара.
              </p>
              <p className="purchase-step-text">
              Платим фиксированный процент от цены при оплате ВБ кошельком или ОЗОН картой (по центральному региону).
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
                <li>
                  Напишите ключевое слово (указано наверху рядом с лупой) в
                  поиске маркетплейса
                </li>
                <li>Смотрите товары других продавцов</li>
                <li>Добавьте в корзину 2-3 товара конкурентов</li>
              </ul>
              <button className="telegram-button" onClick={handleSellerClick} style={{ marginTop: "20px" }}>
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
                  <li>Найдите товар в поисковой выдаче, не используйте фильтр;</li>
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
              <p className="purchase-step-text" style={{ marginBottom: '5px' }}>
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
              <p className="purchase-step-subtitle-12px-400">
              INHOMEKA – комплекты для ванной комнаты, собранные дизайнерами
              </p>
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
                <li>Загрузите скрин корзины, чтобы было видно наш товар и товары конкурентов.</li>
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
              <p className="purchase-step-subtitle-12px-400" style={{ marginBottom: '10px'}}>
              INHOMEKA – мы предлагаем готовые дизайнерские решения для дома в виде комплектов, чтобы упростить выбор стильных товаров
              </p>
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
                  Шаг 4: Подписка на социальную сеть бренда
                </p>
              </div>
              <div className="purchase-step-content">
                <p className="purchase-step-text">
                Наш бренд растет и развивается на новых площадках, мы приглашаем Вас присоединиться к нашим социальным сетям, 
                там мы будем публиковать полезные лайфхаки для дома и рассказывать о наших новинках, акциях и конкурсах с призами. 
                Вы можете выбрать одну из социальных сетей: Инстаграм (принадлежит компании Meta, признанной экстремистской и запрещённой на территории РФ), 
                ВКонтакте, Телеграм
                </p>
                <div className="social-media-buttons">
                  <a href="https://www.instagram.com/inhomeka.ru?igsh=ZGJpMTYwejA0YmVu" target="_blank" rel="noopener noreferrer">
                  <svg width="134" height="134" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M66.5369 0C48.4665 0 46.2006 0.0766603 39.1037 0.400337C32.0216 0.723419 27.1849 1.84836 22.9525 3.4929C18.5771 5.19329 14.8665 7.46853 11.1676 11.1674C7.46853 14.8663 5.19329 18.5773 3.49309 22.9527C1.84817 27.1849 0.723617 32.0216 0.400139 39.1037C0.0764622 46.2006 0 48.4665 0 66.5369C0 84.607 0.0764622 86.8729 0.400139 93.9698C0.723617 101.052 1.84817 105.889 3.49309 110.121C5.19349 114.496 7.46873 118.207 11.1676 121.906C14.8667 125.605 18.5771 127.88 22.9525 129.581C27.1849 131.225 32.0216 132.35 39.1037 132.673C46.2006 132.997 48.4665 133.074 66.5369 133.074C84.607 133.074 86.8729 132.997 93.9698 132.673C101.052 132.35 105.889 131.225 110.121 129.581C114.496 127.88 118.207 125.605 121.906 121.906C125.605 118.207 127.88 114.496 129.581 110.121C131.225 105.889 132.35 101.052 132.673 93.9698C132.997 86.8729 133.074 84.607 133.074 66.5369C133.074 48.4665 132.997 46.2006 132.673 39.1037C132.35 32.0216 131.225 27.1849 129.581 22.9527C127.88 18.5773 125.605 14.8663 121.906 11.1674C118.207 7.46853 114.496 5.19329 110.121 3.4929C105.889 1.84836 101.052 0.723419 93.9698 0.400337C86.8729 0.0766603 84.607 0 66.5369 0ZM66.5369 11.9885C84.3027 11.9885 86.4072 12.0565 93.4233 12.3766C99.9107 12.6723 103.434 13.7563 105.778 14.6675C108.884 15.8746 111.101 17.3163 113.429 19.6446C115.757 21.973 117.199 24.1896 118.406 27.2952C119.317 29.6398 120.401 33.163 120.697 39.6502C121.017 46.6663 121.085 48.7708 121.085 66.5368C121.085 84.3027 121.017 86.4072 120.697 93.4233C120.401 99.9107 119.317 103.434 118.406 105.778C117.199 108.884 115.757 111.101 113.429 113.429C111.101 115.757 108.884 117.199 105.778 118.406C103.434 119.317 99.9105 120.401 93.4233 120.697C86.4084 121.017 84.3041 121.085 66.5368 121.085C48.7694 121.085 46.6655 121.017 39.6502 120.697C33.1628 120.401 29.6398 119.317 27.2954 118.406C24.1894 117.199 21.973 115.757 19.6448 113.429C17.3165 111.101 15.8746 108.884 14.6675 105.778C13.7563 103.434 12.6725 99.9105 12.3766 93.4233C12.0565 86.4072 11.9885 84.3027 11.9885 66.5368C11.9885 48.7708 12.0565 46.6663 12.3766 39.6502C12.6725 33.1628 13.7563 29.6398 14.6675 27.2954C15.8746 24.1894 17.3165 21.973 19.6446 19.6448C21.973 17.3163 24.1896 15.8746 27.2952 14.6675C29.6398 13.7563 33.163 12.6723 39.6502 12.3766C46.6663 12.0565 48.7708 11.9885 66.5368 11.9885" fill="#100F0D"/>
<path d="M66.537 88.7157C54.2876 88.7157 44.3578 78.7859 44.3578 66.5369C44.3578 54.2875 54.2876 44.3577 66.537 44.3577C78.786 44.3577 88.7157 54.2875 88.7157 66.5369C88.7157 78.7859 78.786 88.7157 66.537 88.7157ZM66.537 32.3692C47.6664 32.3692 32.3693 47.6664 32.3693 66.5369C32.3693 85.407 47.6664 100.704 66.537 100.704C85.4071 100.704 100.704 85.407 100.704 66.5369C100.704 47.6664 85.4071 32.3692 66.537 32.3692ZM110.039 31.0193C110.039 35.4291 106.464 39.0036 102.054 39.0036C97.6448 39.0036 94.0699 35.4291 94.0699 31.0193C94.0699 26.6096 97.6448 23.0347 102.054 23.0347C106.464 23.0347 110.039 26.6096 110.039 31.0193Z" fill="#100F0D"/>
</svg>

                  </a>
                  <a href="https://vk.com/inhomeka" target="_blank" rel="noopener noreferrer">
                  <svg id="Capa_1" enable-background="new 0 0 97.75 97.75" viewBox="0 0 97.75 97.75" xmlns="http://www.w3.org/2000/svg"><g><path d="m48.875 0c-26.992 0-48.875 21.882-48.875 48.875s21.883 48.875 48.875 48.875 48.875-21.882 48.875-48.875-21.883-48.875-48.875-48.875zm24.792 54.161c2.278 2.225 4.688 4.319 6.733 6.774.906 1.086 1.76 2.209 2.41 3.472.928 1.801.09 3.776-1.522 3.883l-10.013-.002c-2.586.214-4.644-.829-6.379-2.597-1.385-1.409-2.67-2.914-4.004-4.371-.545-.598-1.119-1.161-1.803-1.604-1.365-.888-2.551-.616-3.333.81-.797 1.451-.979 3.059-1.055 4.674-.109 2.361-.821 2.978-3.19 3.089-5.062.237-9.865-.531-14.329-3.083-3.938-2.251-6.986-5.428-9.642-9.025-5.172-7.012-9.133-14.708-12.692-22.625-.801-1.783-.215-2.737 1.752-2.774 3.268-.063 6.536-.055 9.804-.003 1.33.021 2.21.782 2.721 2.037 1.766 4.345 3.931 8.479 6.644 12.313.723 1.021 1.461 2.039 2.512 2.76 1.16.796 2.044.533 2.591-.762.35-.823.501-1.703.577-2.585.26-3.021.291-6.041-.159-9.05-.28-1.883-1.339-3.099-3.216-3.455-.956-.181-.816-.535-.351-1.081.807-.944 1.563-1.528 3.074-1.528l11.313-.002c1.783.35 2.183 1.15 2.425 2.946l.01 12.572c-.021.695.349 2.755 1.597 3.21 1 .33 1.66-.472 2.258-1.105 2.713-2.879 4.646-6.277 6.377-9.794.764-1.551 1.423-3.156 2.063-4.764.476-1.189 1.216-1.774 2.558-1.754l10.894.013c.321 0 .647.003.965.058 1.836.314 2.339 1.104 1.771 2.895-.894 2.814-2.631 5.158-4.329 7.508-1.82 2.516-3.761 4.944-5.563 7.471-1.656 2.31-1.525 3.473.531 5.479z"/></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>
                  </a>
                  <a href="https://t.me/inhomeka" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="-21 -51 682.66669 682" xmlns="http://www.w3.org/2000/svg"><path d="m640-1.667969-640 272.039063 167.777344 66.585937 59.726562 224.507813 109.976563-106.558594 178.917969 123.570312zm-403.78125 367.402344-6.457031 58.535156-24.800781-93.234375 435.039062-332.703125zm0 0"/></svg>
                  </a>
                  </div>
                  <div className="upload-section" style={{ marginTop: "20px" }}>
                <p className="upload-title">Загрузите скрин подписки</p>
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
                    Пожалуйста, загрузите изображение подтверждения подписки на социальную сеть бренда.
                  </p>
                )}
              </div>
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
                  Оформил(а) подписку на социальную сеть бренда
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
      case 5:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">
                Шаг 5: Реквизиты для перевода кешбэка
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
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Введите номер телефона или СБП"
                />
                {errors.phone && <p className="red-error">Заполните поле</p>}
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
      case 6:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 6: Оформление заказа</p>
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
                  onChange={(e) => handleFileUpload(e, "image4")}
                />
                {imageError.image3 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
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
      case 7:
        return (
          <div className="purchase-step-page">
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 7: Получение товара</p>
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
                  onChange={(e) => handleFileUpload(e, "image5")}
                />
                {imageError.image4 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
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
      case 8:
        return (
          <div className="purchase-step-page">
            {showPopup && (
              <Popup
                message="Спасибо за покупку! Ожидайте поступление кешбека в течение 3-10 рабочих дней"
                onClose={closePopup}
              />
            )}
            <div className="purchase-step-header">
              <p className="title-class-step">Шаг 8: Отчет об отзыве</p>
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
                  Будем благодарны если в своём отзыве Вы упомяните название нашего бренда INHOMEKA, 
                  например «Спасибо бренду INHOMEKA!»;
                </li>
                <li>
                  Сделайте скриншот с разрезанным штрих-кодом на фоне товара;
                </li>
                <li>
                  Прикрепите скриншот, где видно, что отзыв уже опубликован;
                </li>
                <li>Прикрепите скриншот с разрезанным штрих-кодом.</li>
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
                  onChange={(e) => handleFileUpload(e, "image6")}
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
                  onChange={(e) => handleFileUpload(e, "image7")}
                />
                {imageError.image6 && (
                  <p className="red-error">Загрузите изображение</p>
                )}
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
                <br />
                Номер карты: {userStep.cardnumber}
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
                    "https://t.me/razdadim5",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                Поддержка
              </button>
              <p className="purchase-step-subtitle-12px-400">
              INHOMEKA - дизайнерские решения для каждого дома» после кнопки «поддержка
              </p>
            </div>
          </div>
        );
    }
  };

  return renderStepContent();
};

export default PurchaseStepsPage;
