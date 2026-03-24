import React, { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "../platform/telegram";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTelegramContext = Boolean(getTelegramWebApp()?.initDataUnsafe?.user?.id);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    const backButton = webApp?.BackButton;

    if (!backButton) {
      return undefined;
    }

    backButton.onClick(goBack);
    backButton.show();

    return () => {
      backButton.hide();
      backButton.offClick(goBack);
    };
  }, [goBack]);

  const hideBrowserBackButton = ["/", "/catalog"].includes(location.pathname);

  if (isTelegramContext || hideBrowserBackButton) {
    return null;
  }

  return (
    <button className="browser-back-button" onClick={goBack} type="button">
      Назад
    </button>
  );
};

export default BackButton;
