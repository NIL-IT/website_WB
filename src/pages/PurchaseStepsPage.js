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
                <br /> 2. Подпишитесь на социальную сеть бренда;
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
                <div className="social-media-buttons" style={{ marginTop: "20px" }}>
                  <a href="https://www.instagram.com/inhomeka.ru?igsh=ZGJpMTYwejA0YmVu" target="_blank" rel="noopener noreferrer">
                    <button
                      className={`social-media-button ${
                        socialMedia === "instagram"? "active" : ""
                      }`}
                      onClick={() => setSocialMedia("instagram")}
                    >
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 551.034 551.034" style="enable-background:new 0 0 551.034 551.034;" xml:space="preserve"><g><linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)"><stop offset="0" style="stop-color:#E09B3D"/><stop offset="0.3" style="stop-color:#C74C4D"/><stop offset="0.6" style="stop-color:#C21975"/><stop offset="1" style="stop-color:#7024C4"/></linearGradient><path style="fill:url(#SVGID_1_);" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722 c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156 C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156 c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722 c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"/><linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)"><stop offset="0" style="stop-color:#E09B3D"/><stop offset="0.3" style="stop-color:#C74C4D"/><stop offset="0.6" style="stop-color:#C21975"/><stop offset="1" style="stop-color:#7024C4"/></linearGradient><path style="fill:url(#SVGID_2_);" d="M275.517,133C196.933,133,133,196.933,133,275.516s63.933,142.517,142.517,142.517 S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6c-48.095,0-87.083-38.988-87.083-87.083 s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083C362.6,323.611,323.611,362.6,275.517,362.6z"/><linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="418.31" y1="4.57" x2="418.31" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)"><stop offset="0" style="stop-color:#E09B3D"/><stop offset="0.3" style="stop-color:#C74C4D"/><stop offset="0.6" style="stop-color:#C21975"/><stop offset="1" style="stop-color:#7024C4"/></linearGradient><circle style="fill:url(#SVGID_3_);" cx="418.31" cy="134.07" r="34.15"/></g></svg>
                    </button>
                  </a>
                  <a href="https://vk.com/inhomeka" target="_blank" rel="noopener noreferrer">
                    <button
                      className={`social-media-button ${
                        socialMedia === "vk"? "active" : ""
                      }`}
                      onClick={() => setSocialMedia("vk")}
                    >
                      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 112.196 112.196" style="enable-background:new 0 0 112.196 112.196;" xml:space="preserve"><g><g><circle id="XMLID_11_" style="fill:#4D76A1;" cx="56.098" cy="56.098" r="56.098"/></g><path style="fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;" d="M53.979,80.702h4.403c0,0,1.33-0.146,2.009-0.878 c0.625-0.672,0.605-1.934,0.605-1.934s-0.086-5.908,2.656-6.778c2.703-0.857,6.174,5.71,9.853,8.235 c2.782,1.911,4.896,1.492,4.896,1.492l9.837-0.137c0,0,5.146-0.317,2.706-4.363c-0.2-0.331-1.421-2.993-7.314-8.463 c-6.168-5.725-5.342-4.799,2.088-14.702c4.525-6.031,6.334-9.713,5.769-11.29c-0.539-1.502-3.867-1.105-3.867-1.105l-11.076,0.069 c0,0-0.821-0.112-1.43,0.252c-0.595,0.357-0.978,1.189-0.978,1.189s-1.753,4.667-4.091,8.636c-4.932,8.375-6.904,8.817-7.71,8.297 c-1.875-1.212-1.407-4.869-1.407-7.467c0-8.116,1.231-11.5-2.397-12.376c-1.204-0.291-2.09-0.483-5.169-0.514 c-3.952-0.041-7.297,0.012-9.191,0.94c-1.26,0.617-2.232,1.992-1.64,2.071c0.732,0.098,2.39,0.447,3.269,1.644 c1.135,1.544,1.095,5.012,1.095,5.012s0.652,9.554-1.523,10.741c-1.493,0.814-3.541-0.848-7.938-8.446 c-2.253-3.892-3.954-8.194-3.954-8.194s-0.328-0.804-0.913-1.234c-0.71-0.521-1.702-0.687-1.702-0.687l-10.525,0.069 c0,0-1.58,0.044-2.16,0.731c-0.516,0.611-0.041,1.875-0.041,1.875s8.24,19.278,17.57,28.993 C44.264,81.287,53.979,80.702,53.979,80.702L53.979,80.702z"/></g></svg>
                    </button>
                  </a>
                  <a href="https://t.me/inhomeka" target="_blank" rel="noopener noreferrer">
                    <button
                      className={`social-media-button ${
                        socialMedia === "t"? "active" : ""
                      }`}
                      onClick={() => setSocialMedia("t")}
                    >
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                      x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><circle style="fill:#7AA5DA;" 
                      cx="256" cy="256" r="256"/><path style="fill:#5786B5;" 
                      d="M511.924,250.077L398.283,136.625l-185.108,225.63l133.284,133.284 C443.197,458.988,512,365.535,512,256C512,254.019,511.969,252.045,511.924,250.077z"/><path style="fill:#FFFFFF;" 
                      d="M383.717,133.52c10.206-3.982,20.756,4.948,18.515,15.67l-45.77,218.781 c-2.138,10.257-14.188,14.877-22.635,8.671l-69.094-50.717l-35.219,35.961c-6.189,6.31-16.86,3.741-19.515-4.672l-25.41-80.662 l-68.112-20.118c-8.947-2.638-9.464-15.084-0.793-18.48L383.717,133.52z M350.118,182.065c2.982-2.638-0.483-7.292-3.862-5.189 l-147.015,91.177c-2.586,1.603-3.775,4.758-2.862,7.671l20.049,88.04c0.397,1.345,2.327,1.155,2.5-0.241l4.482-67.094 c0.172-1.655,0.965-3.172,2.207-4.275L350.118,182.065z"/><path style="fill:#9EC2E5;" d="M346.257,176.876c3.379-2.103,6.844,2.551,3.862,5.189l-124.5,110.089 c-1.241,1.103-2.034,2.62-2.207,4.275l-4.482,67.094c-0.172,1.396-2.103,1.586-2.5,0.241l-20.049-88.04 c-0.914-2.913,0.276-6.068,2.862-7.671L346.257,176.876z"/><path style="fill:#FFFFFF;" 
                      d="M217.154,364.678c-3.241-1.155-5.982-3.741-7.154-7.465l-25.41-80.662l-68.112-20.118 c-8.947-2.638-9.464-15.084-0.793-18.48L383.717,133.52c6.585-2.569,13.326,0.241,16.653,5.448 c-0.621-0.948-1.362-1.827-2.189-2.603L216.343,284.81v6.499l-1-0.724l1,40.926v32.823c0.259,0.121,0.534,0.224,0.81,0.31V364.678 L217.154,364.678z"/><g><path style="fill:#D1D1D1;" d="M402.525,145.518c0.052,1.172-0.034,2.413-0.293,3.672l-45.77,218.781 c-2.138,10.257-14.188,14.877-22.635,8.671l-69.094-50.717l-48.39-34.616v-6.499l181.838-148.446 c0.827,0.776,1.569,1.655,2.189,2.603c0.121,0.207,0.241,0.396,0.362,0.586c0.103,0.207,0.224,0.414,0.328,0.603 c0.103,0.207,0.207,0.414,0.293,0.621c0.103,0.224,0.19,0.431,0.276,0.655c0.069,0.19,0.155,0.396,0.224,0.621 c0.224,0.672,0.396,1.362,0.517,2.086C402.439,144.587,402.491,145.036,402.525,145.518z"/><path style="fill:#D1D1D1;" d="M264.733,325.925l-35.219,35.961c-0.293,0.293-0.603,0.586-0.914,0.845 c-0.31,0.259-0.621,0.483-0.948,0.707c-0.017,0.017-0.017,0.017-0.017,0.017c-0.655,0.431-1.327,0.793-2.034,1.086 c-0.362,0.138-0.707,0.276-1.069,0.362c-1.5,0.448-3.034,0.569-4.551,0.414c-0.396-0.034-0.793-0.103-1.172-0.172 c-0.052,0-0.103-0.017-0.155-0.034c-0.379-0.103-0.759-0.207-1.138-0.328c-0.121-0.034-0.241-0.069-0.362-0.138l-0.81-33.133 v-40.202L264.733,325.925z"/></g><g><path style="fill:#DADDE0;" d="M228.6,362.73c-0.31,0.259-0.621,0.5-0.948,0.724v-0.017 C227.98,363.213,228.29,362.989,228.6,362.73z"/><path style="fill:#DADDE0;" d="M227.652,363.437v0.017c0,0,0-0.017-0.017,0C227.635,363.454,227.635,363.454,227.652,363.437z"/><path style="fill:#DADDE0;" d="M225.601,364.541c0.707-0.293,1.379-0.655,2.034-1.086 C226.98,363.885,226.29,364.247,225.601,364.541z"/><path style="fill:#DADDE0;" d="M219.981,365.316c1.517,0.155,3.051,0.034,4.551-0.414c-1.086,0.345-2.207,0.5-3.327,0.5 c-0.345,0-0.69-0.017-1.017-0.052C220.119,365.351,220.05,365.351,219.981,365.316z"/></g><g>
                      <path style="fill:#FFFFFF;" d="M221.205,365.402c-0.345,0-0.69-0.017-1.017-0.052C220.515,365.385,220.86,365.402,221.205,365.402z "/><path style="fill:#FFFFFF;" d="M219.981,365.316c0.069,0.034,0.138,0.034,0.207,0.034c-0.362-0.017-0.69-0.069-1.034-0.138 C219.429,365.265,219.705,365.299,219.981,365.316z"/></g><g><path style="fill:#DADDE0;" d="M219.981,365.316c-0.276-0.017-0.552-0.052-0.827-0.103c-0.121-0.017-0.241-0.034-0.345-0.069 C219.188,365.213,219.584,365.282,219.981,365.316z"/>
                      <path style="fill:#DADDE0;" d="M217.516,364.782c0.379,0.121,0.759,0.224,1.138,0.328c-0.155-0.034-0.31-0.069-0.465-0.103 c-0.069-0.017-0.138-0.034-0.19-0.069C217.843,364.903,217.671,364.851,217.516,364.782z"/></g><g><path style="fill:#FFFFFF;" d="M218.188,365.006c0.155,0.034,0.31,0.069,0.465,0.103 C218.498,365.092,218.343,365.058,218.188,365.006z"/><path style="fill:#FFFFFF;" d="M217.516,364.782c0.155,0.069,0.328,0.121,0.483,0.155c-0.259-0.052-0.517-0.138-0.776-0.241 C217.326,364.73,217.412,364.765,217.516,364.782z"/></g><path style="fill:#DADDE0;" d="M217.516,364.782c-0.103-0.017-0.19-0.052-0.293-0.086c-0.017,0.017-0.052,0-0.069-0.017v-0.034 C217.274,364.713,217.395,364.747,217.516,364.782z"/><path style="fill:#D1D1D1;" d="M216.343,331.511l0.81,33.133c-0.276-0.086-0.552-0.19-0.81-0.31V331.511z"/><polygon style="fill:#DADDE0;" points="216.343,291.309 216.343,331.511 215.343,290.585 "/><path style="fill:#ADBCC9;" d="M350.118,182.065l-124.5,110.089c-1.241,1.103-2.034,2.62-2.207,4.275l-4.474,67.1 c-0.172,1.396-2.103,1.586-2.517,0.241l-20.04-88.045c-0.914-2.913,0.276-6.068,2.862-7.671l147.015-91.177 C349.636,174.773,353.101,179.428,350.118,182.065z"/></svg>
                    </button>
                  </a>
                  </div>
                  <div className="upload-section" style={{ marginTop: "20px" }}>
                <p className="upload-title">Загрузите скрин подтверждения подписки на социальную сеть бренда</p>
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
            </div>
          </div>
        );
    }
  };

  return renderStepContent();
};

export default PurchaseStepsPage;
