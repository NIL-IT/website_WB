import React, { useState } from "react";
import "../styles/AddProductPage.css";

const AddProductPage = ({ products, setProducts, categories }) => {
  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    category: "",
    price: "",
    clientPrice: "",
    image: "",
    discountCode: "",
    discountCodeDay: "",
    keywords: "",
    bonusLink: "",
    description: "",
    terms: "",
    availableDay: "",
    marketPrice: "",
    yourPrice: "",
    discount: "",
    step: "",
    isComplete: false,
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
    const newProduct = { ...formData, id: products.length + 1 };
    setProducts([...products, newProduct]);
    setFormData({
      brand: "",
      name: "",
      category: "",
      price: "",
      clientPrice: "",
      image: "",
      discountCode: "",
      discountCodeDay: "",
      keywords: "",
      bonusLink: "",
      description: "",
      terms: "",
      availableDay: "",
      marketPrice: "",
      yourPrice: "",
      discount: "",
      step: "",
      isComplete: false,
    });
  };

  return (
    <div className="add-product-page">
      <div className="title-class">Размещение товара</div>
      <form onSubmit={handleSubmit}>
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
            name="discount"
            value={formData.discount}
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
            name="discountCodeDay"
            value={formData.discountCodeDay}
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
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите артикул"
            required
          />
        </label>
        <label>
        Ваш ник в телеграм<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="terms"
            value={formData.terms}
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
            name="availableDay"
            value={formData.availableDay}
            onChange={handleChange}
            placeholder="Например: отзыв с фото, количество звезд 5 "
            required
          />
        </label>
        <div className="required-label">
          <span style={{ color: "red" }}>* </span>Обязательное поле для заполнения
        </div>
        <button type="submit" className="continue-button">
          Продолжить
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
