import React from "react";
import "./PurchaseStepsPage"; // не забудьте создать CSS файл для стилей

const ReportPage = ({ transactionId, userInfo }) => {
  const screenshots = [
    { url: "/Canada.jpg", caption: "Скриншот корзины" },
    {
      url: "/Canada.jpg",
      caption: "Скриншот товара в конкурентной выдаче",
    },
    {
      url: "/Canada.jpg",
      caption: 'Скриншот из раздела "Доставки" в личном кабинете',
    },
    {
      url: "/Canada.jpg",
      caption: "Скриншот о том, что заказ доставлен",
    },
    {
      url: "/Canada.jpg",
      caption: "Скриншот опубликованного отзыва",
    },
    {
      url: "/Canada.jpg",
      caption: "Фотография с разрезанным штрих-кодом на фоне товара",
    },
  ];

  return (
    <div className="purchase-step-page">
      <div className="purchase-step-header">
        <p className="title-class-step">Отчет для транзакции №599</p>
      </div>
      <div className="purchase-step-content" style={{ paddingBottom: "8vh" }}>
        <div className="">
          <p className="purchase-step-text">Имя в Telegram: tetyakoff</p>
          <p className="purchase-step-text">Имя держателя карты: Илья</p>
          <p className="purchase-step-text">Банк: Т-банк</p>
          <p className="purchase-step-text">Номер: 89237503769</p>
        </div>

        <div className="">
          {screenshots.map((screenshot, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <p className="purchase-step-text">{screenshot.caption}</p>
              <img
                src={screenshot.url}
                alt={`Шаг ${index + 1}`}
                className="product-image-detail"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
