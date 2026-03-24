import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUsername } from "../api/users";
import "../styles/ProfilePage.css";

const ProfilePage = ({ userInfo }) => {
  const [username, setUsername] = useState(userInfo?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const verificationLabel = userInfo?.confirmation ? "Подтверждён" : "Требуется пройти";
  const profileName = userInfo?.username || "Имя пользователя не указано";

  const handleInstructionClick = () => {
    window.open(
      "https://telegra.ph/Instrukciya-razmeshcheniya-06-21",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleServiceClick = () => {
    window.open("https://telegra.ph/O-servise-06-21", "_blank", "noopener,noreferrer");
  };

  const handleSaveClick = () => {
    setIsSaving(true);

    updateUsername(username, userInfo.id_usertg)
      .then((data) => {
        if (data.success) {
          setIsEditing(false);
          window.location.reload();
        } else {
          alert("Ошибка при обновлении имени пользователя");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero__top">
          <div className="profile-identity">
            <div className="profile-icon">WB</div>
            <div className="profile-identity__copy">
              <span>Аккаунт</span>
              <strong>{profileName}</strong>
              <p>ID: {userInfo?.id_usertg || "не указан"}</p>
            </div>
          </div>
          <span
            className={`profile-status ${userInfo?.confirmation ? "profile-status--ok" : "profile-status--alert"}`}
          >
            {verificationLabel}
          </span>
        </div>

        <div className="profile-edit-card">
          <div className="profile-edit-card__copy">
            <span>Контактное имя</span>
            <p>Используется для связи и отображения в сервисных сценариях.</p>
          </div>
          <div className="profile-edit-card__form">
            {isEditing || !userInfo?.username ? (
              <>
                <input
                  className="profile-name-input"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isSaving}
                  placeholder="Введите username без @"
                />
                <button type="button" onClick={handleSaveClick} disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)}>
                Изменить username
              </button>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {userInfo && userInfo.status === "admin" && (
            <button className="profile-action-button" onClick={handleInstructionClick}>
              Инструкция
            </button>
          )}
          <button className="profile-action-button" onClick={handleServiceClick}>
            О сервисе
          </button>
        </div>
      </section>

      <section className="profile-metrics">
        <article className="profile-metric-card">
          <span>Статус аккаунта</span>
          <strong>{verificationLabel}</strong>
        </article>
        <article className="profile-metric-card">
          <span>Роль</span>
          <strong>{userInfo?.status === "admin" ? "Модератор" : "Пользователь"}</strong>
        </article>
      </section>

      <div className="profile-content">
        <div className="profile-item" onClick={() => navigate("/purchases")}>
          <div className="item-text">
            <span className="item-title">Операции</span>
            <span className="item-subtitle">Ваши активные и завершённые операции</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>

        <div className="profile-item" onClick={() => navigate("/add-product")}>
          <div className="item-text">
            <span className="item-title">Разместить предложение</span>
            <span className="item-subtitle">Панель для партнёров и брендов</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>

        <div className="profile-item" onClick={() => navigate("/catalog")}>
          <div className="item-text">
            <span className="item-title">Предложения</span>
            <span className="item-subtitle">Доступные предложения и задания</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>

        <div className="profile-item" onClick={() => navigate("/support")}>
          <div className="item-text">
            <span className="item-title">Поддержка</span>
            <span className="item-subtitle">Центр поддержки и история обращений</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>

        <div
          className="profile-item"
          onClick={() => {
            window.open(
              "https://inhomeka.ru/main?utm_source=tg&utm_medium=club&utm_campaign=profile",
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          <div className="item-text">
            <span className="item-title">О бренде INHOMEKA</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>

        {userInfo && userInfo.status === "admin" && (
          <div className="profile-item" onClick={() => navigate("/catalog-moderate")}>
            <div className="item-text">
              <span className="item-title">Модерация</span>
              <span className="item-subtitle">Данная вкладка доступна только модераторам</span>
            </div>
            <span className="profile-item__arrow">›</span>
          </div>
        )}

        <div className="profile-item" onClick={() => navigate("/confirmation")}>
          <div className="item-text">
            <div className="item-title item-title--split">
              <span>Верификация</span>
              <span
                className={`profile-dot ${userInfo?.confirmation ? "profile-dot--ok" : "profile-dot--alert"}`}
              />
            </div>
            <span className="item-subtitle">Статус проверки аккаунта</span>
          </div>
          <span className="profile-item__arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
