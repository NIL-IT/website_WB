import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTransactionReport } from "../api/steps";

const ReportPage = ({userInfo}) => {
  const { id } = useParams();
  const [stepData, setStepData] = useState(null);
  const [error, setError] = useState(null);

  const maskCardNumber = (value) => {
    if (!value) {
      return "Не указано";
    }

    const digits = String(value).replace(/\D/g, "");

    if (digits.length < 4) {
      return "****";
    }

    return `**** **** **** ${digits.slice(-4)}`;
  };

  const maskPhone = (value) => {
    if (!value) {
      return "Не указано";
    }

    const digits = String(value).replace(/\D/g, "");

    if (digits.length < 4) {
      return "****";
    }

    return `+* *** *** ${digits.slice(-2)}`;
  };

  useEffect(() => {
    if (!userInfo?.id_usertg || !userInfo?.status) {
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getTransactionReport(id, userInfo.id_usertg, userInfo.status);
        if (result.success) {
          setStepData(result.data);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError("Ошибка при получении данных");
      }
    };

    fetchData();
  }, [id, userInfo?.id_usertg, userInfo?.status]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stepData) {
    return <div>Загрузка...</div>;
  }

  const screenshots = [
    { url: stepData.image1, caption: "Скриншот корзины" },
    { url: stepData.image2, caption: "Скриншот товара в конкурентной выдаче" },
    { url: stepData.image3, caption: 'Скриншот из раздела "Доставки" в личном кабинете' },
    { url: stepData.image4, caption: "Скриншот о том, что заказ доставлен" },
    { url: stepData.image5, caption: "Скриншот опубликованного отзыва" },
    { url: stepData.image6, caption: "Фотография с разрезанным штрих-кодом на фоне товара" },
  ];

  return (
    <div className="purchase-step-page">
      <div className="purchase-step-header">
        <p className="title-class-step">Отчёт по операции №{id}</p>
      </div>
      <div className="purchase-step-content" style={{ paddingBottom: "8vh" }}>
        <div>
          <p className="purchase-step-text">ФИО держателя карты: {stepData.cardholder}</p>
          <p className="purchase-step-text">Банк: {stepData.bankname}</p>
          <p className="purchase-step-text">Номер: {maskPhone(stepData.phone)}</p>
          <p className="purchase-step-text">Номер карты: {maskCardNumber(stepData.cardnumber)}</p>
        </div>
        <div>
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
