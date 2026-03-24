import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/SupportPage.css";

const STORAGE_KEY = "wb_support_tickets";

const readTickets = () => {
  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeTickets = (tickets) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

const SupportPage = () => {
  const location = useLocation();
  const context = useMemo(() => location.state || {}, [location.state]);
  const [tickets, setTickets] = useState([]);
  const [submitState, setSubmitState] = useState(null);
  const [formData, setFormData] = useState({
    topic: context.topic || "operation",
    title: context.title || "",
    description: context.description || "",
  });

  useEffect(() => {
    setTickets(readTickets());
  }, []);

  const contextSummary = useMemo(() => {
    const parts = [];

    if (context.orderId) {
      parts.push(`Операция #${context.orderId}`);
    }

    if (context.productName) {
      parts.push(context.productName);
    }

    if (context.stepLabel) {
      parts.push(context.stepLabel);
    }

    return parts.join(" • ");
  }, [context]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setSubmitState({
        type: "error",
        message: "Заполните тему и описание обращения.",
      });
      return;
    }

    const ticket = {
      id: `SUP-${Date.now().toString().slice(-6)}`,
      topic: formData.topic,
      title,
      description,
      createdAt: new Date().toLocaleString("ru-RU"),
      contextSummary,
      status: "Принято",
    };

    const nextTickets = [ticket, ...tickets].slice(0, 6);
    setTickets(nextTickets);
    writeTickets(nextTickets);
    setSubmitState({
      type: "success",
      message: `Обращение ${ticket.id} сохранено в центре поддержки.`,
    });
    setFormData((prevState) => ({
      ...prevState,
      title: context.title || "",
      description: context.description || "",
    }));
  };

  return (
    <div className="support-page">
      <div className="support-hero">
        <p className="support-eyebrow">Центр поддержки</p>
        <h1>Поддержка внутри приложения</h1>
        <p className="support-lead">
          Оставьте обращение по операции, верификации, начислению или работе приложения.
        </p>
      </div>

      {contextSummary ? (
        <div className="support-context-card">
          <span className="support-context-label">Контекст обращения</span>
          <strong>{contextSummary}</strong>
        </div>
      ) : null}

      <div className="support-grid">
        <section className="support-card">
          <h2>Новое обращение</h2>
          <form className="support-form" onSubmit={handleSubmit}>
            <label>
              Тип вопроса
              <select name="topic" value={formData.topic} onChange={handleChange}>
                <option value="operation">Операция</option>
                <option value="verification">Верификация</option>
                <option value="payout">Начисление</option>
                <option value="technical">Техническая проблема</option>
              </select>
            </label>

            <label>
              Тема
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Кратко опишите вопрос"
              />
            </label>

            <label>
              Описание
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Опишите ситуацию и ожидаемый результат"
              />
            </label>

            <button type="submit" className="support-primary-button">
              Сохранить обращение
            </button>
          </form>

          {submitState ? (
            <p
              className={`support-submit-message support-submit-message--${submitState.type}`}
            >
              {submitState.message}
            </p>
          ) : null}
        </section>

        <section className="support-card">
          <h2>Что можно решить здесь</h2>
          <ul className="support-checklist">
            <li>Вопрос по активной операции или шагу.</li>
            <li>Проблема с начислением или статусом.</li>
            <li>Повторная отправка на верификацию.</li>
            <li>Техническая ошибка в приложении.</li>
          </ul>

          <div className="support-note">
            История ниже хранится локально в приложении как переходный сценарий, пока не подключён backend тикетов.
          </div>

          <div className="support-links">
            <a href="https://t.me/razdadim5" target="_blank" rel="noopener noreferrer">
              Поддержка в Telegram
            </a>
            <a href="https://t.me/inhomeka" target="_blank" rel="noopener noreferrer">
              Telegram-бот
            </a>
          </div>
        </section>
      </div>

      <section className="support-history-card">
        <div className="support-history-head">
          <h2>Последние обращения</h2>
          <span>{tickets.length} шт.</span>
        </div>

        {tickets.length === 0 ? (
          <p className="support-empty-state">
            Обращений пока нет. Используйте форму выше, чтобы завести первое.
          </p>
        ) : (
          <div className="support-ticket-list">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="support-ticket">
                <div className="support-ticket-head">
                  <strong>{ticket.id}</strong>
                  <span>{ticket.status}</span>
                </div>
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
                {ticket.contextSummary ? (
                  <div className="support-ticket-context">{ticket.contextSummary}</div>
                ) : null}
                <small>{ticket.createdAt}</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SupportPage;
