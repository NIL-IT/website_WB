import React, { useState } from "react";
import "../styles/PurchasesPage.css";

const PurchasesPage = ({ products }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (event) => {
    event.target.style.display = "none";
  };

  return (
    <div className="purchases-page">
      <div className="title-class">Мои покупки</div>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="purchase-item">
            {!isLoaded && <div className="purchase-skeleton"></div>}
            <img
              src={product.image}
              alt={product.name}
              className="purchase-image"
              style={{ display: isLoaded ? "block" : "none" }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="purchase-details">
              <h2 className="purchase-title">{product.name}</h2>
              <p className="purchase-price">Цена для вас: {product.yourPrice} ₽</p>
              <p className="purchase-step">
                Шаги: {product.step}
                {product.isComplete && (
                  <span style={{ marginLeft: '4px' }}>
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0 4C0 1.79086 1.79086 0 4 0C6.20915 0 8 1.79086 8 4C8 6.20915 6.20915 8 4 8C1.79086 8 0 6.20915 0 4Z"
                        fill="#04B800"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M5.6858 2.87243C5.79479 2.98141 5.79479 3.15811 5.6858 3.26708L3.96442 4.9885C3.71014 5.24279 3.29782 5.24279 3.04354 4.9885L2.3144 4.25935C2.20542 4.15036 2.20542 3.97365 2.3144 3.86467C2.42339 3.75568 2.60008 3.75568 2.70907 3.86467L3.43821 4.59382C3.47453 4.63014 3.53343 4.63014 3.56974 4.59382L5.29116 2.87243C5.40014 2.76345 5.57681 2.76345 5.6858 2.87243Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                )}
              </p>
            </div>
            <div className="purchase-arrow">
              <svg
                width="6"
                height="11"
                viewBox="0 0 6 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.247666 10.7527C0.573851 11.0781 1.10275 11.0781 1.42893 10.7527L5.51127 6.67579C6.16312 6.02488 6.16287 4.97004 5.51077 4.31938L1.42592 0.244075C1.09974 -0.0813583 0.570844 -0.0813583 0.244651 0.244075C-0.0815504 0.569517 -0.0815504 1.09715 0.244651 1.42259L3.74081 4.91062C4.06707 5.23604 4.06707 5.76371 3.74081 6.08913L0.247666 9.57421C-0.0785353 9.89962 -0.0785353 10.4272 0.247666 10.7527Z"
                  fill="black"
                />
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchasesPage;