import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "../styles/AddProductPage.css";

const AddProductPage = ({ userInfo, categories, fetchProducts }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showInputPopup, setShowInputPopup] = useState(false);
  const navigate = useNavigate();

  const initializeAvailableDay = () => {
    const availableDay = {};
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      availableDay[dateString] = 0;
    }
    return availableDay;
  };

  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    category: "",
    image: "",
    keywords: "",
    article: "",
    tg_nick: userInfo.username,
    terms: "",
    marketPrice: "",
    yourPrice: "",
    availableDay: initializeAvailableDay(),
  });

  const [errors, setErrors] = useState({
    marketPrice: false,
    yourPrice: false,
    article: false,
    validationMessage: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for numeric fields
    if (["marketPrice", "yourPrice", "article"].includes(name) && isNaN(value)) {
      setErrors({ ...errors, [name]: true });
    } else {
      setErrors({ ...errors, [name]: false });
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 0.7,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, image: reader.result });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing the image:", error);
      }
    }
  };

  const handleAvailableDayChange = (e) => {
    const { name, value } = e.target;
  
    // Convert empty string to 0 if value is empty or not a valid number
    const numericValue = value === "" || isNaN(parseInt(value)) ? 0 : parseInt(value);
  
    setFormData(prevFormData => ({
      ...prevFormData,
      availableDay: {
        ...prevFormData.availableDay,
        [name]: numericValue,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseFloat(formData.yourPrice) >= parseFloat(formData.marketPrice)) {
      setErrors({
        ...errors,
        validationMessage: "Цена клиента должна быть меньше, чем цена на сайте.",
      });
      return;
    }

    if (
      Object.values(formData.availableDay).some(day => parseInt(day) > 1000 || parseInt(day) < 0)
    ) {
      setErrors({
        ...errors,
        validationMessage: "Недопустимое значение количества сделок.",
      });
      return;
    }

    fetch("https://testingnil.ru:8000/addProduct.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            fetchProducts();
            navigate("/catalog");
          }, 5000);
        } else {
          alert("Error: " + data.message);
          navigate("/catalog");
        }
      })
      .catch((error) => {
        alert("Error: " + error);
      });

    setFormData({
      brand: "",
      name: "",
      category: "",
      image: "",
      keywords: "",
      article: "",
      tg_nick: userInfo.username,
      terms: "",
      marketPrice: "",
      yourPrice: "",
      availableDay: initializeAvailableDay(),
    });
  };

  return (
    <div className="add-product-page">
      <div className="title-class">Размещение товара</div>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>
          Бренд товара<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Введите бренд товара"
            required
          />
        </label>
        <label>
          Название товара<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Введите название товара"
            required
          />
        </label>
        <label>
          Категория<span style={{ color: "red" }}> *</span>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Без категории
            </option>
            {categories.map((category_base, index) => (
              <option key={index} value={category_base}>
                {category_base}
              </option>
            ))}
          </select>
        </label>
        <label>
          Цена на сайте (руб)<span style={{ color: "red" }}> *</span>
          <input
            type="number"
            name="marketPrice"
            value={formData.marketPrice}
            onChange={handleChange}
            placeholder="Укажите цену на маркетплейсе"
            required
            className={errors.marketPrice ? "error" : ""}
          />
        </label>
        <label>
          Цена клиента<span style={{ color: "red" }}> *</span>
          <input
            type="number"
            name="yourPrice"
            value={formData.yourPrice}
            onChange={handleChange}
            placeholder="Введите цену клиента"
            required
            className={errors.yourPrice ? "error" : ""}
          />
        </label>
        <label>
          Фото товара<span style={{ color: "red" }}> *</span>
          <input
            name="image"
            type="file"
            id="file-upload"
            onChange={handleImageUpload}
            required
          />
          <label htmlFor="file-upload" className="file-label">
            {formData.image ? "Изображение загружено" : "Выберите изображение"}
          </label>
        </label>
        <label>
          Ключевые слова для поиска<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="Например: красная рубашка, рубашка мужская "
            required
          />
          <span className="warning-message">
            Вводите обязательно через , (запятую), как показано в примере
          </span>
        </label>
        <label>
          Артикул<span style={{ color: "red" }}> *</span>
          <input
            type="number"
            name="article"
            value={formData.article}
            onChange={handleChange}
            placeholder="Введите артикул"
            required
            className={errors.article ? "error" : ""}
          />
        </label>
        <label>
          Ваш ник в телеграм<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="tg_nick"
            value={formData.tg_nick}
            onChange={handleChange}
            placeholder="Например: Alexon"
            required
          />
          <span className="warning-message">
            Ваш ник не должен содержать @, https://t.me/
          </span>
        </label>
        <label>
          Условия для отзыва<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            placeholder="Например: отзыв с фото, количество звезд 5 "
            required
          />
        </label>
        <label>
          <button
            type="button"
            onClick={() => setShowInputPopup(true)}
            className="input-popup-button"
          >
            Кол-во сделок со скидкой в день
          </button>
          </label>
        {errors.validationMessage && (
          <div className="error-message">{errors.validationMessage}</div>
        )}
        <div>
          <div className="required-label">
            <span style={{ color: "red" }}>* </span>Обязательное поле для
            заполнения
          </div>
          <button type="submit" className="continue-button">
            Продолжить
          </button>
        </div>
      </form>
      {showPopup && (
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
              Ваш товар отправлен на модерацию. Если вашего товара долго нет, то напишите в поддержку
            </p>
          </div>
        </div>
      )}
 {showInputPopup && (
          <div className="input-popup-overlay" onClick={() => setShowInputPopup(false)}>
            <div className="input-popup" onClick={(e) => e.stopPropagation()}>
              <h3>Установить количество сделок со скидкой в день</h3>
              {[...Array(14)].map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);
                const dateString = date.toISOString().split('T')[0];
                return (
                  <label key={index}>
                    {dateString}
                    <input
                      type="number"
                      name={dateString}
                      value={formData.availableDay[dateString]}
                      onChange={handleAvailableDayChange}
                    />
                  </label>
                );
              })}
              <button onClick={() => setShowInputPopup(false)}>Сохранить</button>
            </div>
          </div>
        )}
    </div>
  );
};

export default AddProductPage;
