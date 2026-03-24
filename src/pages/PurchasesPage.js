import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PurchasesPage.css";

const PurchasesPage = ({ userSteps, userInfo }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const navigate = useNavigate();

  const operations = useMemo(
    () =>
      userSteps.filter(
        (userStep) => userStep.step > 0 || userStep.step === "Завершено"
      ),
    [userSteps]
  );

  const activeOperations = operations.filter(
    (userStep) => userStep.step !== "Завершено"
  );
  const completedOperations = operations.filter(
    (userStep) => userStep.step === "Завершено"
  );
  const nextOperation = activeOperations[0] || null;

  const handleImageLoad = (userStepId) => {
    setLoadedImages((prevState) => ({
      ...prevState,
      [userStepId]: true,
    }));
  };

  const handleImageError = (event, userStepId) => {
    event.target.style.display = "none";
    setLoadedImages((prevState) => ({
      ...prevState,
      [userStepId]: false,
    }));
  };

  const handleProductClick = (userStepId) => {
    if (userInfo && !userInfo.confirmation) {
      navigate("/confirmation", { state: { from: `/purchase-steps/${userStepId}` } });
      return;
    }

    navigate(`/purchase-steps/${userStepId}`);
  };

  const getStatusMeta = (step) => {
    if (step === "Завершено") {
      return { label: "Завершено", tone: "success" };
    }

    if (Number(step) > 0) {
      return { label: `Шаг ${step}`, tone: "active" };
    }

    return { label: "Ожидает запуска", tone: "idle" };
  };

  return (
    <div className="purchases-page">
      <section className="operations-summary">
        <article className="operations-summary-card operations-summary-card--accent">
          <span>Следующее действие</span>
          <strong>{nextOperation ? nextOperation.name : "Свободно"}</strong>
          <p>
            {nextOperation
              ? `Продолжите операцию №${nextOperation.id} и завершите текущий шаг.`
              : "Активных шагов нет. Можно выбрать новое предложение из каталога."}
          </p>
          <button
            type="button"
            onClick={() =>
              nextOperation
                ? handleProductClick(nextOperation.id)
                : navigate("/catalog")
            }
          >
            {nextOperation ? "Продолжить" : "Открыть предложения"}
          </button>
        </article>

        <article className="operations-summary-card">
          <span>Активные операции</span>
          <strong>{activeOperations.length}</strong>
          <p>Операции, которые требуют действий на текущем шаге.</p>
        </article>

        <article className="operations-summary-card">
          <span>Завершённые</span>
          <strong>{completedOperations.length}</strong>
          <p>Операции, по которым уже сформирован итоговый результат.</p>
        </article>
      </section>

      <section className="operations-list">
        {operations.length === 0 ? (
          <div className="operations-empty">
            <strong>Операций пока нет</strong>
            <p>Откройте предложения и возьмите первое подходящее задание.</p>
            <button type="button" onClick={() => navigate("/catalog")}>
              Перейти к предложениям
            </button>
          </div>
        ) : (
          operations.map((userStep) => {
            const status = getStatusMeta(userStep.step);

            return (
              <article
                key={userStep.id}
                className="purchase-item"
                onClick={() => handleProductClick(userStep.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleProductClick(userStep.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="purchase-media">
                  <div
                    className="purchase-skeleton"
                    style={{ display: loadedImages[userStep.id] ? "none" : "block" }}
                  />
                  <img
                    src={userStep.image}
                    alt={userStep.name}
                    className="purchase-image"
                    style={{ display: loadedImages[userStep.id] ? "block" : "none" }}
                    onLoad={() => handleImageLoad(userStep.id)}
                    onError={(event) => handleImageError(event, userStep.id)}
                  />
                </div>

                <div className="purchase-details">
                  <div className="purchase-meta">
                    <span className={`purchase-status purchase-status--${status.tone}`}>
                      {status.label}
                    </span>
                    <span className="purchase-id">Операция #{userStep.id}</span>
                  </div>

                  <h2 className="purchase-title">{userStep.name}</h2>

                  <div className="purchase-stats">
                    <div>
                      <span>Цена для вас</span>
                      <strong>{userStep.yourprice} ₽</strong>
                    </div>
                    <div>
                      <span>Статус</span>
                      <strong>{userStep.step === "Завершено" ? "Закрыта" : "В работе"}</strong>
                    </div>
                  </div>
                </div>

                <div className="purchase-arrow" aria-hidden="true">
                  <svg
                    width="8"
                    height="14"
                    viewBox="0 0 8 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L7 7L1 13"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

export default PurchasesPage;
