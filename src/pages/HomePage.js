import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = ({ userInfo, userSteps, products }) => {
  const navigate = useNavigate();
  const activeOperations = userSteps.filter(
    (step) => step.step !== "Завершено" && Number(step.step) > 0
  );
  const completedOperations = userSteps.filter((step) => step.step === "Завершено");
  const availableOffers = products.filter((product) => product.is_confirmed && product.availableday > 0);

  const nextOperation = activeOperations[0] || null;
  const verificationStatus = userInfo?.confirmation ? "Подтверждён" : "Требуется пройти";

  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">WB App</p>
          <h1>Главная</h1>
          <p className="home-subtitle">
            Управляйте предложениями, операциями, верификацией и поддержкой в одном приложении.
          </p>
        </div>
        <button className="home-primary-action" onClick={() => navigate("/catalog")}>
          Открыть предложения
        </button>
      </section>

      <section className="home-metrics">
        <article className="home-metric-card">
          <span>Активные операции</span>
          <strong>{activeOperations.length}</strong>
        </article>
        <article className="home-metric-card">
          <span>Доступные предложения</span>
          <strong>{availableOffers.length}</strong>
        </article>
        <article className="home-metric-card">
          <span>Статус верификации</span>
          <strong>{verificationStatus}</strong>
        </article>
      </section>

      <section className="home-grid">
        <article className="home-panel home-panel--highlight">
          <div className="home-panel-head">
            <span>Следующее действие</span>
            <button onClick={() => navigate("/purchases")}>Все операции</button>
          </div>
          {nextOperation ? (
            <>
              <h2>{nextOperation.name}</h2>
              <p>Операция #{nextOperation.id}</p>
              <p>Текущий шаг: {nextOperation.step}</p>
              <button onClick={() => navigate(`/purchase-steps/${nextOperation.id}`)}>
                Продолжить операцию
              </button>
            </>
          ) : (
            <>
              <h2>Новых действий нет</h2>
              <p>Откройте предложения и выберите подходящее задание.</p>
              <button onClick={() => navigate("/catalog")}>Перейти к предложениям</button>
            </>
          )}
        </article>

        <article className="home-panel">
          <div className="home-panel-head">
            <span>Быстрые действия</span>
          </div>
          <div className="home-actions">
            <button onClick={() => navigate("/confirmation")}>Верификация</button>
            <button onClick={() => navigate("/support")}>Поддержка</button>
            <button onClick={() => navigate("/profile")}>Профиль</button>
            <button onClick={() => navigate("/add-product")}>Партнёрский кабинет</button>
          </div>
        </article>
      </section>

      <section className="home-summary">
        <div className="home-summary-card">
          <span>Завершённые операции</span>
          <strong>{completedOperations.length}</strong>
        </div>
        <div className="home-summary-card">
          <span>Поддержка</span>
          <p>Если вы открыли приложение из Telegram, бот и контакты продавцов продолжают работать как раньше.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
