export const getTelegramWebApp = () => {
  if (typeof window === "undefined" || !window.Telegram) {
    return null;
  }

  return window.Telegram.WebApp || null;
};

export const isTelegramWebApp = () => Boolean(getTelegramWebApp());

export const initializeTelegramWebApp = () => {
  const webApp = getTelegramWebApp();

  if (!webApp) {
    return null;
  }

  if (typeof webApp.ready === "function") {
    webApp.ready();
  }

  if (typeof webApp.expand === "function") {
    webApp.expand();
  }

  if (typeof webApp.disableVerticalSwipes === "function") {
    webApp.disableVerticalSwipes();
  }

  return webApp;
};

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  const user = webApp?.initDataUnsafe?.user;

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    username: user.username || "",
  };
};
