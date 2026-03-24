import {
  getTelegramUser,
  initializeTelegramWebApp,
  isTelegramWebApp,
} from "./telegram";
import { getBrowserUser } from "./browser";

export const initializePlatform = () => {
  if (isTelegramWebApp()) {
    initializeTelegramWebApp();
  }
};

export const getPlatformContext = () => {
  if (isTelegramWebApp()) {
    const telegramUser = getTelegramUser();

    if (telegramUser) {
      return {
        type: "telegram",
        user: telegramUser,
      };
    }
  }

  return {
    type: "browser",
    user: getBrowserUser(),
  };
};
