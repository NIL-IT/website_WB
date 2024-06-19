import React from 'react';
//import './AddProductPage.css';

const AddProductPage = () => {
  return (
    <div className="add-product-page">
      <h1>Add New Product</h1>
      <form>
        <input type="text" placeholder="Product Name" required />
        <input type="number" placeholder="Marketplace Price" required />
        <input type="number" placeholder="Customer Price" required />
        <input type="number" placeholder="Cashback Amount" required />
        <input type="number" placeholder="Discount Quantity" required />
        <input type="text" placeholder="Keyword" required />
        <input type="text" placeholder="Article Number" required />
        <input type="text" placeholder="Telegram Nickname" required />
        <input type="text" placeholder="Review Conditions" required />
        <select required>
          <option value="wildberries">Wildberries</option>
          <option value="ozon">Ozon</option>
        </select>
        <input type="file" placeholder="Product Photo" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddProductPage;