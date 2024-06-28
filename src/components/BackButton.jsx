import React, { useEffect } from "react";

const BackButton = () => {
  const goBack = () => {
    window.history.back();
  };
  useEffect(() => {
    window.Telegram.WebApp.BackButton.onClick(goBack);
    window.Telegram.WebApp.BackButton.show();

    return () => {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick(goBack);
    };
  }, []);
  return <></>;
};

export default BackButton;