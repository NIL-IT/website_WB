document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const app = document.getElementById("app");
  
  try {
    const response = await fetch("fetchReport.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Ошибка получения данных");
    
    document.getElementById("report-title").textContent = `Отчет для транзакции №${id}`;
    
    document.getElementById("user-info").innerHTML = `
      <p class="purchase-step-text">ФИО держателя карты: ${data.data.cardholder}</p>
      <p class="purchase-step-text">Банк: ${data.data.bankname}</p>
      <p class="purchase-step-text">Номер: ${data.data.phone}</p>
      <p class="purchase-step-text">Номер карты: ${data.data.cardnumber}</p>
      <p class="purchase-step-text">Выгода: ${data.benefit} руб.</p>
    `;
    
    const screenshotsDiv = document.getElementById("screenshots");
    const screenshotCaptions = [
      "Скриншот товара в конкурентной выдаче",
      "Скриншот корзины",
      "Скриншот подписки",
      "Скриншот заказа",
      "Скриншот, подтверждающий, что заказ доставлен",
      "Скриншот опубликованного отзыва",
      "Фотография с разрезанным штрих-кодом на фоне товара"
    ];
    
    screenshotCaptions.forEach((caption, index) => {
      const imageUrl = data.data[`image${index + 1}`];
      if (imageUrl) {
        const screenshotDiv = document.createElement("div");
        screenshotDiv.classList.add("screenshot-block");
        screenshotDiv.innerHTML = `
          <p class="purchase-step-text">${caption}</p>
          <img src="${imageUrl}" alt="${caption}" class="product-image-detail"/>
        `;
        screenshotsDiv.appendChild(screenshotDiv);
      }
    });
    
    const receiptImageDiv = document.createElement("div");
    receiptImageDiv.innerHTML = data.data.receipt_image
      ? `<p class="purchase-step-text">Изображение чека:</p>
         <img src="${data.data.receipt_image}" alt="Чек" class="product-image-detail"/>`
      : `<p class="purchase-step-text">Чек не приложен</p>`;
    screenshotsDiv.appendChild(receiptImageDiv);
    
    const verifyBtn = document.getElementById("verifyBtn");
    updateButtonState(verifyBtn, data.data.verified, "Отменить верификацию товара", "Подтвердить верификацию и передать в оплату");
    
    const payBtn = document.getElementById("payBtn");
    updateButtonState(payBtn, data.data.paid, "Отменить оплату", "Подтвердить оплату");
    payBtn.disabled = !data.data.verified;
    
    const receiptUpload = document.getElementById("receiptUpload");
    receiptUpload.addEventListener("change", function () {
      handleReceiptUpload(receiptUpload, payBtn);
    });
    
    verifyBtn.addEventListener("click", () => toggleVerification(id, verifyBtn, payBtn));
    payBtn.addEventListener("click", () => handlePayment(id, receiptUpload, payBtn));
    
  } catch (error) {
    app.innerHTML = `<div class="error">${error.message}</div>`;
  }
});

function updateButtonState(button, isActive, activeText, inactiveText) {
  button.textContent = isActive ? activeText : inactiveText;
  button.classList.toggle("btn-green", isActive);
  button.classList.toggle("btn-gray", !isActive);
}

async function toggleVerification(id, verifyBtn, payBtn) {
  try {
    const response = await fetch("toggleVerify.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    
    updateButtonState(verifyBtn, data.verified, "Отменить верификацию товара", "Подтвердить верификацию и передать в оплату");
    payBtn.disabled = !data.verified;
  } catch (error) {
    console.error("Ошибка при верификации:", error);
  }
}

function handleReceiptUpload(input, payBtn) {
  const file = input.files[0];
  if (!file) return;
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    alert("Можно загружать только изображения форматов JPG и PNG.");
    input.value = "";
    return;
  }
  payBtn.disabled = false;
}

async function handlePayment(id, receiptUpload, payBtn) {
  if (receiptUpload.files.length === 0) {
    alert("Пожалуйста, загрузите изображение чека.");
    return;
  }
  
  payBtn.classList.add("loading");
  
  try {
    const file = receiptUpload.files[0];
    const reader = new FileReader();
    
    reader.onload = async function (event) {
      const imageData = event.target.result;
      const response = await fetch("togglePay.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, receipt: imageData }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      updateButtonState(payBtn, data.paid, "Отменить оплату", "Подтвердить оплату");
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Ошибка при обработке платежа:", error);
  } finally {
    payBtn.classList.remove("loading");
  }
}
