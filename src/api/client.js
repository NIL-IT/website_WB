const DEFAULT_API_BASE_URL = "https://inhomeka.online:8000/";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL
);

const buildUrl = (path) => `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

const parseJsonResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP error ${response.status}`);
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
};

export const getJson = async (path, init = {}) => {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  return parseJsonResponse(response);
};

export const postJson = async (path, body, init = {}) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: JSON.stringify(body),
    ...init,
  });

  return parseJsonResponse(response);
};

export const postForm = async (path, body, init = {}) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    body,
    ...init,
  });

  return parseJsonResponse(response);
};
