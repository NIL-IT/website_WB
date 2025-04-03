import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "../styles/AddProductPage.css";

const AddProductPage = ({ userInfo, categories, fetchProducts }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showInputPopup, setShowInputPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [inputFields, setInputFields] = useState([{ keyword: "", count: "" }]);
  const [keywordsWithCount, setKeywordsWithCount] = useState([]); // Массив для ключевых слов с количеством
  const [popupMessage, setPopupMessage] = useState(
    "Ваш товар отправлен на модерацию. Если вашего товара долго нет, то напишите в поддержку"
  );

  const navigate = useNavigate();

  const initializeAvailableDay = () => {
    const availableDay = {};
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
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
    tg_nick_manager: "",
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

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteDate, setDeleteDate] = useState("");
  const [stateValue, setStateValue] = useState(0b00); // 0 - оба выключены

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Если изменяется поле keywords, то очищаем поля попапа
    if (name === "keywords") {
      setInputFields([{ keyword: "", count: "" }]);
      setKeywordsWithCount([]); // Очистка массива при вводе в поле keywords
    }

    // Валидация для числовых полей
    if (["marketPrice", "yourPrice", "article"].includes(name) && isNaN(value)) {
      setErrors({ ...errors, [name]: true });
    } else {
      setErrors({ ...errors, [name]: false });
      setFormData({ ...formData, [name]: value });
    }
  };

  // Функция для изменения полей в попапе
  const handleFieldChange = (index, event) => {
    const newFields = [...inputFields];
    newFields[index][event.target.name] = event.target.value;
    setInputFields(newFields);

    // Если изменяются поля в попапе, то очищаем поле keywords
    setFormData({ ...formData, keywords: "" });
  };

// Добавление нового поля в попапе
const handleAddField = (event) => {
  event.preventDefault(); // Предотвращает выполнение стандартного действия
  setInputFields([...inputFields, { keyword: "", count: "" }]);
};

// Удаление последнего поля в попапе
const handleRemoveField = (event) => {
  event.preventDefault(); // Предотвращает выполнение стандартного действия
  if (inputFields.length > 1) {
    setInputFields(inputFields.slice(0, -1));
  }
};

  // Валидация и логика для кнопки "Применить" в попапе
  const handleApply = () => {
    const validFields = inputFields.every(
      (field) => field.keyword.trim() !== "" && field.count.trim() !== ""
    );

    if (!validFields) {
      setErrors({
        ...errors,
        validationMessage: "Все поля в попапе должны быть заполнены.",
      });
      return;
    }

    // Сохранение данных из попапа в массив
    const newKeywordsWithCount = inputFields.map((field) => ({
      [field.keyword]: field.count,
    }));
    setKeywordsWithCount(newKeywordsWithCount);
    setShowPopup2(false); // Закрываем попап при успешной проверке
  };

  // Обработка загрузки изображений
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = { maxSizeMB: 0.7, useWebWorker: true };
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
    const numericValue =
      value === "" || isNaN(parseInt(value)) ? 0 : parseInt(value);

    setFormData((prevFormData) => ({
      ...prevFormData,
      availableDay: {
        ...prevFormData.availableDay,
        [name]: numericValue,
      },
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
  
    setStateValue((prev) => {
      if (name === "publishWithChanges") {
        return checked ? prev | 0b10 : prev & 0b01;
      } else if (name === "deleteOnly") {
        return checked ? prev | 0b01 : prev & 0b10;
      }
      return prev;
    });
  
    if (name === "publishWithChanges" && !checked) setSelectedDate("");
    if (name === "deleteOnly" && !checked) setDeleteDate("");
  };
  
  const validateDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    if (selectedDate && new Date(selectedDate) < tomorrow) {
      alert("Дата отложенной публикации должна быть не раньше завтрашнего дня.");
      setSelectedDate("");
      return false;
    }
  
    if (deleteDate && new Date(deleteDate) < tomorrow) {
      alert("Дата удаления должна быть не раньше завтрашнего дня.");
      setDeleteDate("");
      return false;
    }
  
    if (selectedDate && deleteDate && new Date(deleteDate) <= new Date(selectedDate)) {
      alert("Дата удаления должна быть как минимум на следующий день после даты отложенной публикации.");
      setDeleteDate("");
      return false;
    }
  
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const hasKeywords = formData.keywords.trim() !== "";
    const hasInputFields = keywordsWithCount.length > 0;

    // Проверка: либо заполнено поле "keywords", либо данные из попапа
    if (!hasKeywords && !hasInputFields) {
      setErrors({
        ...errors,
        validationMessage: "Необходимо заполнить либо поле ключевых слов, либо хотя бы одно поле в попапе.",
      });
      return;
    }

    if (parseFloat(formData.yourPrice) >= parseFloat(formData.marketPrice)) {
      setErrors({
        ...errors,
        validationMessage: "Цена клиента должна быть меньше, чем цена на сайте.",
      });
      return;
    }

    // Если пользователь админ, открываем меню дополнительных настроек
    if (userInfo?.status === "admin") {
      setShowAdminMenu(true);
      return;
    }

    // Отправка через старый запрос (addProduct.php) для не админов
    const dataToSend = {
      ...formData,
      keywordsWithCount: hasInputFields ? keywordsWithCount : undefined,
    };

    fetch("https://inhomeka.online:8000/addProduct.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage(
            "Ваш товар отправлен на модерацию. Если вашего товара долго нет, то напишите в поддержку"
          );
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            fetchProducts();
            navigate("/catalog");
          }, 5000);
        } else {
          alert("Ошибка: " + data.message);
          navigate("/catalog");
        }
      })
      .catch((error) => alert("Ошибка: " + error));
  };

  // Обработчик для изменения состояния галочек
  const handleAdminSubmit = (type) => {
    if (!validateDates()) return;
  
    if (type === "publishWithChanges" && ((stateValue & 0b10 && !selectedDate) || (stateValue & 0b01 && !deleteDate))) {
      alert("Пожалуйста, заполните все поля для выбранных настроек.");
      return;
    }
  
    const dataToSend = {
      ...formData,
      selectedDate: stateValue & 0b10 ? selectedDate : undefined,
      deleteDate: stateValue & 0b01 ? deleteDate : undefined,
    };
  
    const url = type === "publishWithChanges"
      ? "https://inhomeka.online:8000/publishWithChanges.php"
      : "https://inhomeka.online:8000/addProduct.php";
  
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setShowAdminMenu(false);
          setPopupMessage(
            type === "publishWithChanges"
              ? "Ваш товар был подтверждён и будет опубликован в соответствии с выбранными настройками"
              : "Ваш товар отправлен на модерацию. Если вашего товара долго нет, то напишите в поддержку"
          );
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            fetchProducts();
            navigate("/catalog");
          }, 5000);
        } else {
          alert("Ошибка: " + data.message);
        }
      })
      .catch((error) => alert("Ошибка: " + error));
  };

  return (
    <div className="add-product-page">
      <div className="title-class">Размещение товара</div>
      <form className="add-product-form" onSubmit={handleSubmit}>
        {/* Поля формы */}
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
            onWheel={(e) => e.target.blur()} // Отключение изменения при прокрутке
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
            onWheel={(e) => e.target.blur()} // Отключение изменения при прокрутке
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
          />
          <div className="add-flex-container">
            <span className="warning-message flex-text">
            Вводите обязательно через , (запятую), как показано в примере. <div>При введении данных в меню "Количество", данное поле оставить пустым.</div>
            </span>
            <button
              type="button"
              onClick={() => setShowPopup2(true)}
              style={{
                padding: "7px 19px",
                borderRadius: "8px",
                border: "0.5px solid #000000",
                background: "#690DC9",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 400,
                color: "#fff",
                marginLeft: "10px",
              }}
            >
              Количество
            </button>
          </div>
        </label>

       {/* Попап */}
{showPopup2 && (
  <div className="input-popup-overlay" onClick={() => setShowPopup2(false)}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        height: "auto",
        boxSizing: "border-box",
        fontFamily: '"Helvetica Neue Cyr", sans-serif',
        overflowY: "auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: "Inter",
          fontSize: "12px",
          fontWeight: 700,
          backgroundColor: "#D9D9D9",
          padding: "7px",
        }}
      >
        Укажите количество показов для ключевых слов
      </div>

      {/* Уведомление о правильном заполнении формы */}
      <p style={{ color: "blue", textAlign: "center", margin: "10px 0" }}>
        Пожалуйста, убедитесь, что название категории состоит из одного слова или словосочетания без запятых.
      </p>

      <div
        style={{
          padding: "10px",
          height: "150px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
        }}
      >
        {inputFields.map((field, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <input
              className="add-product-page input"
              type="text"
              name="keyword"
              placeholder="Ключевое слово"
              value={field.keyword}
              onChange={(e) => handleFieldChange(index, e)}
              style={{
                width: "75%",
                border: "0.5px solid rgba(0, 0, 0, 1)",
                borderRadius: "8px",
                backgroundColor: "rgba(188, 122, 255, 1)",
                color: "white",
                fontFamily: '"Helvetica Neue Cyr"',
                fontSize: "15px",
                fontWeight: 400,
                padding: "12px",
                marginTop: "5px",
              }}
            />
            <input
              className="add-product-page input"
              type="number"
              name="count"
              placeholder="Кол-во"
              value={field.count}
              onChange={(e) => handleFieldChange(index, e)}
              style={{
                width: "25%",
                border: "0.5px solid rgba(0, 0, 0, 1)",
                borderRadius: "8px",
                backgroundColor: "rgba(188, 122, 255, 1)",
                color: "white",
                fontFamily: '"Helvetica Neue Cyr"',
                fontSize: "15px",
                fontWeight: 400,
                padding: "12px",
                marginTop: "5px",
                textAlign: "center",
              }}
              onWheel={(e) => e.target.blur()} // Отключение изменения при прокрутке
            />
          </div>
        ))}
      </div>

      {/* Ошибка, если поля пустые или неправильно заполнены */}
      {inputFields.some(field => !field.keyword || !field.count || /[,]/.test(field.keyword)) && (
        <p style={{ color: "red", textAlign: "center" }}>
          Пожалуйста, заполните все поля и убедитесь, что ключевое слово не содержит запятых.
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={handleAddField}
          style={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: "#47A76A",
            padding: "7px 7px",
            width: "29px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          +
        </button>

        {/* Кнопка для удаления последнего поля */}
        <button
          onClick={handleRemoveField}
          style={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: "#FF0000",
            padding: "7px 7px",
            width: "29px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          -
        </button>

        <button
          onClick={() => {
            handleApply(); // Вызываем handleApply, если все поля заполнены
          }}
          style={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: inputFields.some(field => !field.keyword || !field.count || /[,]/.test(field.keyword))
              ? "rgba(188, 122, 255, 0.5)" // Цвет для неактивной кнопки
              : "rgba(188, 122, 255, 1)", // Цвет для активной кнопки
            padding: "7px 26px",
            borderRadius: "8px",
            border: "none",
            cursor: inputFields.some(field => !field.keyword || !field.count || /[,]/.test(field.keyword))
              ? "not-allowed" // Указатель для неактивной кнопки
              : "pointer", // Указатель для активной кнопки
            flex: 1,
            marginLeft: "10px",
          }}
          disabled={inputFields.some(field => !field.keyword || !field.count || /[,]/.test(field.keyword))} // Отключаем кнопку
        >
          Применить
        </button>
      </div>

      {/* Футер */}
      <div
        style={{
          borderTop: "1px solid #000000",
          padding: "6px 10px",
          fontFamily: "Inter",
          fontSize: "10px",
          fontWeight: 400,
          textAlign: "left",
          display: "flex",
        }}
      >
        Изначально будет показываться первое ключевое слово, после
        исчерпания количества показов этого ключевого слова будет
        показано следующее. Важно, чтобы суммарное количество показов не
        превышало "Количество сделок со скидкой".
      </div>
    </div>
  </div>
)}

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
            onWheel={(e) => e.target.blur()} // Отключение изменения при прокрутке
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
          Ник менеджера оплаты<span style={{ color: "red" }}> *</span>
          <input
            type="text"
            name="tg_nick_manager"
            value={formData.tg_nick_manager}
            onChange={handleChange}
            placeholder="Например: Alexon"
            required
          />
          <span className="warning-message">
            Ник не должен содержать @, https://t.me/
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
          <button type="submit" className="continue-button" style={{ marginBottom: "200px" }}>
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
              {popupMessage}
            </p>
          </div>
        </div>
      )}
      {showInputPopup && (
        <div
          className="input-popup-overlay"
          onClick={() => setShowInputPopup(false)}
        >
          <div className="input-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Установить количество сделок со скидкой в день</h3>
            {[...Array(14)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const dateString = date.toISOString().split("T")[0];
              return (
                <label key={index}>
                  {dateString}
                  <input
                    type="number"
                    name={dateString}
                    value={formData.availableDay[dateString] === 0 ? "" : formData.availableDay[dateString]}
                    onFocus={() => setFormData(prev => ({
                      ...prev,
                      availableDay: {
                        ...prev.availableDay,
                        [dateString]: ""
                      }
                    }))}
                    onBlur={() => setFormData(prev => ({
                      ...prev,
                      availableDay: {
                        ...prev.availableDay,
                        [dateString]: prev.availableDay[dateString] === "" ? 0 : prev.availableDay[dateString]
                      }
                    }))}

                    onChange={handleAvailableDayChange}
                    onWheel={(e) => e.target.blur()} // Отключение изменения при прокрутке
                  />
                </label>
              );
            })}
            <button onClick={() => setShowInputPopup(false)}>Сохранить</button>
          </div>
        </div>
      )}
      {showAdminMenu && userInfo && userInfo.status === 'admin' && (
        <div className="admin-menu-overlay" onClick={() => setShowAdminMenu(false)}>
          <div className="admin-menu-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Дополнительные настройки</h3>
            <div style={{ marginBottom: "10px" }}></div> {/* Отступ после заголовка */}
            <div>
              <label>
                <input
                  type="checkbox"
                  name="publishWithChanges"
                  checked={!!(stateValue & 0b10)}
                  onChange={handleCheckboxChange}
                />
                Отложенная публикация
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={!(stateValue & 0b10)}
                />
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="deleteOnly"
                  checked={!!(stateValue & 0b01)}
                  onChange={handleCheckboxChange}
                />
                Удаление товара в выбранный день
                <input
                  type="date"
                  value={deleteDate}
                  onChange={(e) => setDeleteDate(e.target.value)}
                  disabled={!(stateValue & 0b01)}
                />
              </label>
            </div>
            <div className="admin-menu-buttons">
              <button
                onClick={() => handleAdminSubmit("publish")}
                disabled={stateValue !== 0b00} // "Опубликовать" только при 00
              >
                Опубликовать
              </button>
              <button
                onClick={() => handleAdminSubmit("publishWithChanges")}
                disabled={stateValue === 0b00} // "Опубликовать с дополнениями" при 10, 01, 11
              >
                Опубликовать с дополнениями
              </button>
            </div>
            <button className="close-admin-menu" onClick={() => setShowAdminMenu(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductPage;
