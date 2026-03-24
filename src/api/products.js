import { getJson, postJson } from "./client";

export const getProducts = () => getJson("getProducts.php");

export const addProduct = (payload) => postJson("addProduct.php", payload);

export const publishWithChanges = (payload) =>
  postJson("publishWithChanges.php", payload);

export const deleteProduct = (productId, userId) =>
  postJson("deleteProduct.php", { productId, userId });

export const confirmProduct = (productId, userId) =>
  postJson("confirmProduct.php", { productId, userId });
