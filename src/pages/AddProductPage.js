import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddProductPage.css";

const AddProductPage = ({ userInfo, categories, fetchProducts }) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    category: "",
    image: "",
    availableDay: "",
    keywords: "",
    article: "",
    tg_nick: userInfo.username,
    terms: "",
    marketPrice: "",
    yourPrice: "",
    amountMax: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("https://nilurl.ru:8000/addProduct.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            fetchProducts();
          navigate('/catalog');
          }, 2000);
          
          
        } else {
          alert("Error: " + data.message);
          navigate('/catalog');
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
      availableDay: "",
      keywords: "",
      article: "",
      tg_nick: "",
      terms: "",
      marketPrice: "",
      yourPrice: "",
      amountMax: "",
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
          Кол-во сделок со скидкой<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="amountMax"
            value={formData.amountMax}
            onChange={handleChange}
            placeholder="Максимальное количество сделок"
            required
          />
        </label>
        <label>
          Кол-во сделок со скидкой в день
          <span style={{ color: "red" }}> *</span>
          <input
            type="number"
            name="availableDay"
            value={formData.availableDay}
            onChange={handleChange}
            placeholder="Сделок в день"
            required
          />
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
            type="text"
            name="article"
            value={formData.article}
            onChange={handleChange}
            placeholder="Введите артикул"
            required
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
        <div>
          <div className="required-label">
            <span style={{ color: "red" }}>* </span>Обязательное поле для
            заполнения
          </div>
          <button
            type="submit"
            className="continue-button"
          >
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
              Скоро ваш товар появится в каталоге товаров
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductPage;
