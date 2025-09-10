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
          <p class="purchase-step-text">Комментарий: ${data.data.comment || 'Комментарий отсутствует'}</p>
        `;
        // Добавляем разделительную линию после комментария
        const commentSeparator = document.createElement("hr");
        commentSeparator.className = "top-section-separator";
        userInfoDiv.appendChild(commentSeparator);
        
        const screenshotsDiv = document.getElementById("screenshots");

        // Вставляем визуальное отделение и заголовок для блока скриншотов
        const screenshotsHeader = document.createElement("div");
        screenshotsHeader.style.textAlign = "center";
        screenshotsHeader.style.fontSize = "22px";
        screenshotsHeader.style.fontWeight = "bold";
        screenshotsHeader.style.marginBottom = "18px";
        screenshotsHeader.textContent = "Скриншоты:";
        screenshotsDiv.appendChild(screenshotsHeader);

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
          const screenshotWrapper = document.createElement("div");
          screenshotWrapper.className = "screenshot-wrapper";

          // Создаём подпись, стрелку и изображение
          const captionDiv = document.createElement("div");
          captionDiv.className = "screenshot-caption";
          captionDiv.style.display = "flex";
          captionDiv.style.alignItems = "center";
          captionDiv.style.justifyContent = "center";
          captionDiv.style.gap = "8px";

          // Стрелка
          const arrow = document.createElement("span");
          arrow.className = "screenshot-arrow";
          arrow.textContent = "▲"; // вверх

          captionDiv.appendChild(arrow);
          const captionText = document.createElement("span");
          captionText.textContent = screenshot.caption;
          captionDiv.appendChild(captionText);

          const img = document.createElement("img");
          img.src = screenshot.url;
          img.alt = `Шаг ${index + 1}`;
          img.className = "product-image-detail";

          // Добавляем обработчик для сворачивания/разворачивания
          captionDiv.addEventListener("click", function () {
            img.classList.toggle("collapsed-image");
            arrow.textContent = img.classList.contains("collapsed-image") ? "▼" : "▲";
          });

          // Изначально все изображения развёрнуты
          screenshotWrapper.appendChild(captionDiv);
          screenshotWrapper.appendChild(img);
          const separator = document.createElement("hr");
          separator.className = "screenshot-separator";
          screenshotWrapper.appendChild(separator);
          screenshotsDiv.appendChild(screenshotWrapper);
        }); 

        // Добавление изображения receipt_image чека
        const receiptImageDiv = document.createElement("div");
        receiptImageDiv.className = "screenshot-wrapper";
        receiptImageDiv.style.marginBottom = "20px";

        const receiptCaption = document.createElement("div");
        receiptCaption.className = "screenshot-caption";
        receiptCaption.style.display = "flex";
        receiptCaption.style.alignItems = "center";
        receiptCaption.style.justifyContent = "center";
        receiptCaption.style.gap = "8px";

        const receiptArrow = document.createElement("span");
        receiptArrow.className = "screenshot-arrow";
        receiptArrow.textContent = "▲";

        receiptCaption.appendChild(receiptArrow);
        const receiptCaptionText = document.createElement("span");
        receiptCaptionText.textContent = data.data.receipt_image ? "Изображение чека:" : "Чек не приложен";
        receiptCaption.appendChild(receiptCaptionText);

        let receiptImg = null;
        if (data.data.receipt_image) {
          receiptImg = document.createElement("img");
          receiptImg.src = data.data.receipt_image;
          receiptImg.alt = "Чек";
          receiptImg.className = "product-image-detail";
          // Обработчик для сворачивания
          receiptCaption.addEventListener("click", function () {
            receiptImg.classList.toggle("collapsed-image");
            receiptArrow.textContent = receiptImg.classList.contains("collapsed-image") ? "▼" : "▲";
          });
        } else {
          // Если чека нет, стрелка не нужна
          receiptArrow.style.display = "none";
        }

        receiptImageDiv.appendChild(receiptCaption);
        if (receiptImg) receiptImageDiv.appendChild(receiptImg);
        const receiptSeparator = document.createElement("hr");
        receiptSeparator.className = "screenshot-separator";
        receiptImageDiv.appendChild(receiptSeparator);
        screenshotsDiv.appendChild(receiptImageDiv);

        // Установка текста и стилей для кнопки verifyBtn
        const verifyBtn = document.getElementById("verifyBtn");
        verifyBtn.textContent = data.data.verified ? "Отменить верификацию товара" : "Подтвердить верификацию и передать в оплату";
        verifyBtn.classList.add(data.data.verified ? "btn-green" : "btn-gray");

        // Установка текста и стилей для кнопки payBtn
        const payBtn = document.getElementById("payBtn");
        payBtn.textContent = data.data.paid ? "Отменить оплату" : "Подтвердить оплату";
        payBtn.classList.add(data.data.paid ? "btn-green" : "btn-gray");
        payBtn.disabled = !data.data.verified && !data.data.paid;
        if (!data.data.verified && !data.data.paid) {
          payBtn.innerHTML += ' <span class="disabled-icon verify-lock">🔒</span>';
        }
        payBtn.innerHTML += ' <span class="disabled-icon upload-lock">🔒</span>';

        // Получение поля для загрузки чека из HTML
        const receiptUpload = document.getElementById("receiptUpload");
        const commentField = document.getElementById("comment");
        commentField.value = data.data.comment || ""; // Установка значения комментария

        const modifiedPaymentField = document.getElementById("modifiedPayment");
        modifiedPaymentField.value = data.data.modified_payment || ""; // Установка значения изменённой выплаты

        const saveCommentBtn = document.getElementById("saveCommentBtn");

        // Блокировка кнопки payBtn до загрузки изображения
        receiptUpload.addEventListener("change", function () {
          const file = receiptUpload.files[0];
        
          if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            console.log("Тип файла:", file.type, "Имя файла:", file.name);
        
            if (allowedTypes.includes(file.type)) {
              payBtn.querySelector('.upload-lock')?.remove();
              if (!payBtn.querySelector('.verify-lock')) {
                payBtn.disabled = false;
              }
            } else {
              payBtn.disabled = true;
              if (!payBtn.querySelector('.upload-lock')) {
                payBtn.innerHTML += ' <span class="disabled-icon upload-lock">🔒</span>';
              }
              alert("Можно загружать только изображения форматов JPG и PNG.");
              receiptUpload.value = ""; // Очистка поля загрузки
            }
          }
        });

        // Добавление логики для кнопки saveCommentBtn
        saveCommentBtn.addEventListener("click", function () {
          const isCommentFilled = !!commentField.value.trim();
          const isModifiedPaymentFilled = !!modifiedPaymentField.value.trim();
          const isModifiedPaymentValid = Number.isInteger(Number(modifiedPaymentField.value)) && Number(modifiedPaymentField.value) >= 0;
        
          if (isCommentFilled !== isModifiedPaymentFilled) {
            alert("Пожалуйста, заполните оба поля: комментарий и изменённая выплата, либо оставьте их пустыми.");
            return;
          }
        
          if (isModifiedPaymentFilled && !isModifiedPaymentValid) {
            alert("Изменённая выплата должна быть целым положительным числом.");
            return;
          }
        
          fetch("saveComment.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: id,
              comment: commentField.value,
              modified_payment: modifiedPaymentField.value // Отправка изменённой выплаты
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                //alert("Комментарий сохранен");
              } else {
                console.error("Ошибка при сохранении комментария:", data.error);
              }
            })
            .catch((error) => {
              console.error("Ошибка при сохранении комментария:", error);
            });
        });

        // --- Блок для редактирования ФИО ---
        const fioBlock = document.createElement("div");
        fioBlock.style.display = "flex";
        fioBlock.style.gap = "10px";
        fioBlock.style.marginBottom = "16px";
        fioBlock.style.alignItems = "center";

        // Разделяем ФИО на части
        const fioOriginal = data.data.cardholder ? data.data.cardholder.trim().split(/\s+/) : [];
        const [surname, name, patronymic] = [fioOriginal[0] || '', fioOriginal[1] || '', fioOriginal[2] || ''];
        const fioVariants = fioOriginal;

        function createFioInput(value, placeholder, variants, isPatronymic = false) {
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'center';
          // Подпись сверху
          const label = document.createElement('label');
          label.textContent = placeholder;
          label.style.fontSize = '14px';
          label.style.marginBottom = '2px';
          wrapper.appendChild(label);
          const input = document.createElement('input');
          input.type = 'text';
          input.value = value;
          input.placeholder = placeholder;
          input.style.width = '120px';
          input.style.marginBottom = isPatronymic ? '0px' : '2px';
          // datalist для выбора из вариантов (всегда все части ФИО)
          const datalist = document.createElement('datalist');
          datalist.id = 'list_' + placeholder;
          ['Фамилия', 'Имя', 'Отчество'].forEach((_, idx) => {
            variants.forEach(v => {
              if (v) {
                const opt = document.createElement('option');
                opt.value = v;
                datalist.appendChild(opt);
              }
            });
          });
          input.setAttribute('list', datalist.id);
          wrapper.appendChild(input);
          wrapper.appendChild(datalist);
          // Подпись под отчеством
          if (isPatronymic) {
            const sub = document.createElement('div');
            sub.textContent = '(если есть)';
            sub.style.fontSize = '12px';
            sub.style.color = '#888';
            sub.style.marginTop = '2px';
            wrapper.appendChild(sub);
          }
          return {wrapper, input};
        }

        const surnameField = createFioInput(surname, 'Фамилия', fioVariants);
        const nameField = createFioInput(name, 'Имя', fioVariants);
        const patronymicField = createFioInput(patronymic, 'Отчество', fioVariants, true);

        fioBlock.appendChild(surnameField.wrapper);
        fioBlock.appendChild(nameField.wrapper);
        fioBlock.appendChild(patronymicField.wrapper);

        const confirmFioBtn = document.createElement('button');
        confirmFioBtn.textContent = 'Подтвердить ФИО';
        confirmFioBtn.className = 'btn btn-gray';
        fioBlock.appendChild(confirmFioBtn);

        userInfoDiv.prepend(fioBlock);

        let fioConfirmed = false;
        let fioValue = data.data.cardholder;
        confirmFioBtn.addEventListener('click', function() {
          fioValue = [surnameField.input.value.trim(), nameField.input.value.trim(), patronymicField.input.value.trim()].filter(Boolean).join(' ');
          if (!surnameField.input.value.trim() || !nameField.input.value.trim()) {
            alert('Поля Фамилия и Имя обязательны!');
            return;
          }
          fioConfirmed = true;
          confirmFioBtn.textContent = 'ФИО подтверждено';
          confirmFioBtn.classList.remove('btn-gray');
          confirmFioBtn.classList.add('btn-green');
          verifyBtn.disabled = false;
        });
        verifyBtn.disabled = true;

        // Добавление логики для кнопки verifyBtn
        verifyBtn.addEventListener("click", function () {
          if (!fioConfirmed) {
            alert('Сначала подтвердите ФИО!');
            return;
          }
          const isCommentFilled = !!commentField.value.trim();
          const isModifiedPaymentFilled = !!modifiedPaymentField.value.trim();
          const isModifiedPaymentValid = Number.isInteger(Number(modifiedPaymentField.value)) && Number(modifiedPaymentField.value) >= 0;
        
          if (isCommentFilled !== isModifiedPaymentFilled) {
            alert("Пожалуйста, заполните оба поля: комментарий и изменённая выплата, либо оставьте их пустыми.");
            return;
          }
        
          if (isModifiedPaymentFilled && !isModifiedPaymentValid) {
            alert("Изменённая выплата должна быть целым положительным числом.");
            return;
          }
        
          fetch("toggleVerify.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: id,
              comment: commentField.value,
              modified_payment: modifiedPaymentField.value, // Отправка изменённой выплаты
              cardholder: fioValue // Новое ФИО
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                if (data.verified) {
                  verifyBtn.textContent = "Отменить верификацию товара";
                  verifyBtn.classList.remove("btn-gray");
                  verifyBtn.classList.add("btn-green");
                  payBtn.querySelector('.verify-lock').remove();
                  if (!payBtn.querySelector('.upload-lock')) {
                    payBtn.disabled = false;
                  }
                } else {
                  verifyBtn.textContent = "Подтвердить верификацию и передать в оплату";
                  verifyBtn.classList.remove("btn-green");
                  verifyBtn.classList.add("btn-gray");
                  payBtn.disabled = true;
                  if (!payBtn.querySelector('.verify-lock')) {
                    payBtn.innerHTML += ' <span class="disabled-icon verify-lock">🔒</span>';
                  }
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
          if (receiptUpload.files.length === 0) {
            alert("Пожалуйста, загрузите изображение чека.");
            return;
          }
        
          payBtn.classList.add("loading");
          const file = receiptUpload.files[0];
          const reader = new FileReader();
        
          reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
              // Создаем canvas для конвертации в PNG
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
        
              // Устанавливаем размеры canvas равными размеру изображения
              canvas.width = img.width;
              canvas.height = img.height;
        
              // Рисуем изображение на canvas
              ctx.drawImage(img, 0, 0);
        
              // Получаем изображение в формате PNG
              const base64Image = canvas.toDataURL("image/png");
        
              // Отправляем изображение на сервер
              fetch("togglePay.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: id,
                  receipt: base64Image
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  payBtn.classList.remove("loading");
                  if (data.success) {
                    if (data.paid) {
                      payBtn.textContent = "Отменить оплату";
                      payBtn.classList.remove("btn-gray");
                      payBtn.classList.add("btn-green");
                    } else {
                      payBtn.textContent = "Подтвердить оплату";
                      payBtn.classList.remove("btn-green");
                      payBtn.classList.add("btn-gray");
                    }
                  } else {
                    console.error("Ошибка при выполнении запроса для payBtn:", data.error);
                  }
                })
                .catch((error) => {
                  payBtn.classList.remove("loading");
                  console.error("Ошибка при выполнении запроса для payBtn:", error);
                });
            };
            img.src = event.target.result;
          };
        
          reader.readAsDataURL(file); // Чтение файла как Data URL
        });

      } else {
        document.getElementById("app").innerHTML = `<div class="error">${data.error}</div>`;
      }
    })
    .catch((error) => {
      document.getElementById("app").innerHTML = `<div class="error">Ошибка при получении данных</div>`;
    });
});