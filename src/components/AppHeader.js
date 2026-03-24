import React from "react";
import { useLocation } from "react-router-dom";
import { getPlatformContext } from "../platform";
import "../styles/AppHeader.css";

const PAGE_META = {
  "/": {
    title: "Главная",
    description: "Операции, предложения и ключевые статусы",
  },
  "/catalog": {
    title: "Предложения",
    description: "Лента доступных заданий и новых размещений",
  },
  "/catalog-moderate": {
    title: "Модерация",
    description: "Проверка и публикация предложений",
  },
  "/add-product": {
    title: "Размещение",
    description: "Добавление нового предложения партнёра",
  },
  "/publishWithChanges": {
    title: "Размещение",
    description: "Публикация обновлённого предложения",
  },
  "/purchases": {
    title: "Операции",
    description: "Активные шаги, завершённые операции и история",
  },
  "/support": {
    title: "Поддержка",
    description: "Обращения, контакты и быстрые каналы связи",
  },
  "/profile": {
    title: "Профиль",
    description: "Статусы аккаунта, настройки и сервисные разделы",
  },
  "/confirmation": {
    title: "Верификация",
    description: "Проверка аккаунта и статус доступа",
  },
};

const resolvePageMeta = (pathname) => {
  if (pathname.startsWith("/product/")) {
    return {
      title: "Детали предложения",
      description: "Информация по предложению и следующему действию",
    };
  }

  if (pathname.startsWith("/purchase-steps/")) {
    return {
      title: "Детали операции",
      description: "Текущий шаг, инструкции и подтверждения",
    };
  }

  if (pathname.startsWith("/report/")) {
    return {
      title: "Отчёт",
      description: "Финальные данные по завершённой операции",
    };
  }

  return (
    PAGE_META[pathname] || {
      title: "WB App",
      description: "Standalone и Telegram-совместимый интерфейс",
    }
  );
};

const AppHeader = ({ userInfo, userSteps }) => {
  const location = useLocation();
  const { title, description } = resolvePageMeta(location.pathname);
  const platformType = getPlatformContext()?.type === "telegram" ? "Telegram" : "Web";
  const verificationLabel = userInfo?.confirmation ? "Верифицирован" : "Требует проверки";
  const activeOperations = userSteps.filter(
    (step) => step.step !== "Завершено" && Number(step.step) > 0
  ).length;

  return (
    <header className="app-header">
      <div className="app-header__copy">
        <span className="app-header__eyebrow">WB App</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="app-header__status-row">
        <span className="app-header__pill">{platformType}</span>
        <span className="app-header__pill">{verificationLabel}</span>
        <span className="app-header__pill">{activeOperations} активн.</span>
      </div>
    </header>
  );
};

export default AppHeader;
