import React, { useEffect, useState } from "react";

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");

const isStandaloneDisplay = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isTelegramContext = () =>
  Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneDisplay();
    setIsStandalone(standalone);

    if (!standalone && isIosDevice() && !isTelegramContext()) {
      setShowIosHint(true);
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowIosHint(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone || isTelegramContext()) {
    return null;
  }

  if (!deferredPrompt && !showIosHint) {
    return null;
  }

  return (
    <div className="install-prompt" role="status" aria-live="polite">
      <div className="install-prompt__content">
        <strong>Установить приложение</strong>
        <span>
          {deferredPrompt
            ? "Добавьте WB App на экран домой для быстрого запуска."
            : "В Safari нажмите Поделиться и выберите На экран Домой."}
        </span>
      </div>
      {deferredPrompt ? (
        <button className="install-prompt__button" onClick={handleInstallClick}>
          Установить
        </button>
      ) : null}
    </div>
  );
};

export default InstallPrompt;
