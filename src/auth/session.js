const SESSION_KEY = "wb_browser_session";

const readStoredSession = () => {
  const rawSession = window.sessionStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch (error) {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const createSessionId = () => {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    const uuid = window.crypto.randomUUID().replace(/-/g, "");
    return Number.parseInt(uuid.slice(0, 12), 16);
  }

  return Date.now();
};

export const getBrowserSessionUser = () => {
  const storedSession = readStoredSession();

  if (storedSession) {
    return storedSession;
  }

  const id = createSessionId();
  const user = {
    id,
    username: `webuser${String(id).slice(-6)}`,
  };

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

  return user;
};
