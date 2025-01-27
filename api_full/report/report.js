document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  fetch("fetchReport.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("report-title").textContent = `Отчет для транзакции №${id}`;
        const userInfoDiv = document.getElementById("user-info");
        userInfoDiv.innerHTML = `
          <p class="purchase-step-text">ФИО держателя карты: ${data.data.cardholder}</p>
          <p class="purchase-step-text">Банк: ${data.data.bankname}</p>
          <p class="purchase-step-text">Номер: ${data.data.phone}</p>
          <p class="purchase-step-text">Номер карты: ${data.data.cardnumber}</p>
          <p class="purchase-step-text">Выгода: ${data.benefit} руб.</p>
        `;
        
        const screenshotsDiv = document.getElementById("screenshots");
        const screenshots = [
          { url: data.data.image1, caption: "Скриншот товара в конкурентной выдаче" },
          { url: data.data.image2, caption: "Скриншот корзины" },
          { url: data.data.image3, caption: "Скриншот подписки" },
          { url: data.data.image4, caption: "Скриншот заказа" },
          { url: data.data.image5, caption: "Скриншот, подтверждающий, что заказ доставлен" },
          { url: data.data.image6, caption: "Скриншот опубликованного отзыва" },
          { url: data.data.image7, caption: "Фотография с разрезанным штрих-кодом на фоне товара" },
        ];

        screenshots.forEach((screenshot, index) => {
          const screenshotDiv = document.createElement("div");
          screenshotDiv.style.marginBottom = "20px";
          screenshotDiv.innerHTML = `
            <p class="purchase-step-text">${screenshot.caption}</p>
            <img src="${screenshot.url}" alt="Шаг ${index + 1}" class="product-image-detail" />
          `;
          screenshotsDiv.appendChild(screenshotDiv);
        });

        // Установка текста и стилей для кнопки verifyBtn
        const verifyBtn = document.getElementById("verifyBtn");
        if (data.data.verified) {
          verifyBtn.textContent = "Отменить верификацию товара";
          verifyBtn.classList.add("btn-green");
        } else {
          verifyBtn.textContent = "Подтвердить верификацию товара";
          verifyBtn.classList.add("btn-gray");
        }

        // Установка текста и стилей для кнопки payBtn
        const payBtn = document.getElementById("payBtn");
        if (data.data.paid) {
          payBtn.textContent = "Отменить оплату";
          payBtn.classList.add("btn-green");
        } else {
          payBtn.textContent = "Подтвердить оплату";
          payBtn.classList.add("btn-gray");
        }

        // Добавление логики для кнопки verifyBtn
        verifyBtn.addEventListener("click", function () {
          fetch("toggleVerify.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: id
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                if (data.verified) {
                  verifyBtn.textContent = "Отменить верификацию товара";
                  verifyBtn.classList.remove("btn-green");
                  verifyBtn.classList.add("btn-gray");
                } else {
                  verifyBtn.textContent = "Подтвердить верификацию товара";
                  verifyBtn.classList.remove("btn-gray");
                  verifyBtn.classList.add("btn-green");
                }
              } else {
                console.error("Ошибка при выполнении запроса для verifyBtn:", data.error);
              }
            })
            .catch((error) => {
              console.error("Ошибка при выполнении запроса для verifyBtn:", error);
            });
        });

        // Добавление логики для кнопки payBtn
        payBtn.addEventListener("click", function () {
          fetch("togglePay.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: id
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                if (data.paid) {
                  payBtn.textContent = "Отменить оплату";
                  payBtn.classList.remove("btn-green");
                  payBtn.classList.add("btn-gray");
                } else {
                  payBtn.textContent = "Подтвердить оплату";
                  payBtn.classList.remove("btn-gray");
                  payBtn.classList.add("btn-green");
                }
              } else {
                console.error("Ошибка при выполнении запроса для payBtn:", data.error);
              }
            })
            .catch((error) => {
              console.error("Ошибка при выполнении запроса для payBtn:", error);
            });
        });

      } else {
        document.getElementById("app").innerHTML = `<div class="error">${data.error}</div>`;
      }
    })
    .catch((error) => {
      document.getElementById("app").innerHTML = `<div class="error">Ошибка при получении данных</div>`;
    });
});