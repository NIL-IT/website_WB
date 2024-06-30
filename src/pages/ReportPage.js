import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const ReportPage = ({userInfo}) => {
  const { id } = useParams();
  const [stepData, setStepData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://nilurl.ru:8000/getTrans.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            id_usertg: userInfo.id_usertg,
          }),
        });

        const result = await response.json();
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
  }, [id]);

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
        <p className="title-class-step">Отчет для транзакции №{id}</p>
      </div>
      <div className="purchase-step-content" style={{ paddingBottom: "8vh" }}>
        <div>
          <p className="purchase-step-text">ФИО держателя карты: {stepData.cardholder}</p>
          <p className="purchase-step-text">Банк: {stepData.bankname}</p>
          <p className="purchase-step-text">Номер: {stepData.phone}</p>
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
