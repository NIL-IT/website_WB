import { postForm, postJson } from "./client";

export const getUserSteps = (id_usertg) => postJson("getSteps.php", { id_usertg });

export const createStep = (id_usertg, id_product) =>
  postJson("createStep.php", { id_usertg, id_product });

export const updateStep = (formData) => postForm("updateStep.php", formData);

export const getTransactionReport = (id, id_usertg, status) =>
  postJson("getTrans.php", { id, id_usertg, status });
