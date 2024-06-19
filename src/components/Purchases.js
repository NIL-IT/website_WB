import React from 'react';
//import './PurchasesPage.css';

const PurchasesPage = () => {
  const purchases = [
    { id: 1, name: 'Product 1', status: 'Delivered', date: '2023-01-01' },
    { id: 2, name: 'Product 2', status: 'Pending', date: '2023-02-01' },
    // ...other purchases
  ];

  return (
    <div className="purchases-page">
      <h1>My Purchases</h1>
      <ul>
        {purchases.map(purchase => (
          <li key={purchase.id}>
            <span>{purchase.name}</span>
            <span>{purchase.status}</span>
            <span>{purchase.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchasesPage;