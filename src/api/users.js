import { getJson, postForm, postJson } from "./client";

export const getUser = (id, username) =>
  postJson("getUser.php", { id, username });

export const createUser = (id, username, referral_id = null) => {
  const payload = { id, username };

  if (referral_id) {
    payload.referral_id = referral_id;
  }

  return postJson("createUser.php", payload);
};

export const updateUsername = (username, id_usertg) =>
  postJson("update-username.php", { username, id_usertg });

export const getManagers = () => getJson("getManagers.php");

export const confirmAccount = (id_usertg, screenshot) => {
  const formData = new FormData();
  formData.append("id_usertg", id_usertg);
  formData.append("screenshot", screenshot);

  return postForm("confirmAccount.php", formData);
};
