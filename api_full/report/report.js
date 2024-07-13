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
        `;
        
        const screenshotsDiv = document.getElementById("screenshots");
        const screenshots = [
          { url: data.data.image1, caption: "Скриншот корзины" },
          { url: data.data.image2, caption: "Скриншот товара в конкурентной выдаче" },
          { url: data.data.image3, caption: 'Скриншот из раздела "Доставки" в личном кабинете' },
          { url: data.data.image4, caption: "Скриншот о том, что заказ доставлен" },
          { url: data.data.image5, caption: "Скриншот опубликованного отзыва" },
          { url: data.data.image6, caption: "Фотография с разрезанным штрих-кодом на фоне товара" },
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
      } else {
        document.getElementById("app").innerHTML = `<div class="error">${data.error}</div>`;
      }
    })
    .catch((error) => {
      document.getElementById("app").innerHTML = `<div class="error">Ошибка при получении данных</div>`;
    });
});