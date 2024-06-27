import React, { useState } from "react";
import "../styles/AddProductPage.css";

const AddProductPage = ({ products, setProducts, categories, fetchProducts }) => {
  const [formData, setFormData] = useState({
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

    fetch('https://nilurl.ru:8000/addProduct.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchProducts(); 
        setProducts([...products, data.newProduct]);
      } else {
        console.error('Error:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
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
              Выберите категорию
            </option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
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
          <span className="warning-message">Вводите обязательно через , (запятую), как показано в примере</span>
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
          <span className="warning-message">Ваш ник не должен содержать @, https://t.me/</span>
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
          <span style={{ color: "red" }}>* </span>Обязательное поле для заполнения
        </div>
        <button type="submit" className="continue-button">
          Продолжить
        </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
