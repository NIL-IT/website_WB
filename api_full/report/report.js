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
          <p class="purchase-step-text">ФИО держателя карты: ${(data.data.cardholder === null || data.data.cardholder === '') ? 'Данные отсутствуют' : data.data.cardholder}</p>
          <p class="purchase-step-text">Банк: ${(data.data.bankname === null || data.data.bankname === '') ? 'Данные отсутствуют' : data.data.bankname}</p>
          <p class="purchase-step-text">Номер: ${(data.data.phone === null || data.data.phone === '') ? 'Данные отсутствуют' : data.data.phone}</p>
          <p class="purchase-step-text">Номер карты: ${(data.data.cardnumber === null || data.data.cardnumber === '') ? 'Данные отсутствуют' : data.data.cardnumber}</p>
          <p class="purchase-step-text">Выгода: ${(data.benefit === null || data.benefit === '') ? 'Данные отсутствуют' : data.benefit + ' руб.'}</p>
          <p class="purchase-step-text">Комментарий: ${(data.data.comment === null || data.data.comment === undefined || data.data.comment === '') ? 'Данные отсутствуют' : data.data.comment}</p>
        `;
        // Добавляем разделительную линию после комментария
        const commentSeparator = document.createElement("hr");
        commentSeparator.className = "top-section-separator";
        userInfoDiv.appendChild(commentSeparator);

        // --- Новое: отображение скриншота профиля WB из users.confirmation_image ---
        const profileWrapper = document.createElement("div");
        profileWrapper.className = "screenshot-wrapper";
        profileWrapper.style.marginBottom = "20px";

        const profileCaption = document.createElement("div");
        profileCaption.className = "screenshot-caption";
        profileCaption.style.display = "flex";
        profileCaption.style.alignItems = "center";
        profileCaption.style.justifyContent = "center";
        profileCaption.style.gap = "8px";

        const profileArrow = document.createElement("span");
        profileArrow.className = "screenshot-arrow";
        profileArrow.textContent = "▲";

        profileCaption.appendChild(profileArrow);
        const profileCaptionText = document.createElement("span");
        profileCaptionText.textContent = data.user && data.user.confirmation_image ? "Профиль WB:" : "Профиль WB не приложен";
        profileCaption.appendChild(profileCaptionText);

        let profileImg = null;
        // Показываем изображение и кнопку только если есть confirmation_image
        if (data.user && data.user.confirmation_image) {
          if (data.user.confirmation_image === null || data.user.confirmation_image === '') {
            // ничего не добавляем, только подпись 'Профиль WB не приложен' выше
          } else {
            profileImg = document.createElement("img");
            profileImg.src = data.user.confirmation_image;
            profileImg.alt = "Профиль WB";
            profileImg.className = "product-image-detail";
          }
          // Обработчик для сворачивания
          profileCaption.addEventListener("click", function () {
            profileImg.classList.toggle("collapsed-image");
            profileArrow.textContent = profileImg.classList.contains("collapsed-image") ? "▼" : "▲";
          });
        } else {
          // Если нет изображения, стрелку скрываем
          profileArrow.style.display = "none";
        }

        profileWrapper.appendChild(profileCaption);
        if (profileImg) profileWrapper.appendChild(profileImg);

        // Кнопка "Профиль не соответствует скришоту"
        if (data.user && data.user.confirmation_image) {
          const mismatchBtn = document.createElement("button");
          mismatchBtn.className = "btn btn-gray";
          mismatchBtn.style.marginTop = "8px";
          mismatchBtn.textContent = "Профиль не соответствует скришоту";
          mismatchBtn.addEventListener("click", function () {
            if (!confirm("Удалить изображение профиля WB и отметить подтверждение как ложное?")) return;
            mismatchBtn.disabled = true;
            fetch("removeConfirmation.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id_usertg: data.user.id_usertg // используем id_usertg (поле есть в users)
              }),
            })
              .then((resp) => resp.json())
              .then((res) => {
                if (res.success) {
                  // Обновим страницу, чтобы отразить изменения
                  location.reload();
                } else {
                  alert("Ошибка при удалении профиля: " + (res.error || 'unknown'));
                  mismatchBtn.disabled = false;
                }
              })
              .catch((err) => {
                console.error(err);
                alert("Ошибка при соединении с сервером");
                mismatchBtn.disabled = false;
              });
          });
          profileWrapper.appendChild(mismatchBtn);
        }

        const profileSeparator = document.createElement("hr");
        profileSeparator.className = "screenshot-separator";
        profileWrapper.appendChild(profileSeparator);
        userInfoDiv.appendChild(profileWrapper);
        // --- Конец блока профиля WB ---

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

          screenshotWrapper.appendChild(captionDiv);
          if (screenshot.url === null || screenshot.url === '') {
            const noImg = document.createElement('div');
            noImg.textContent = 'Данные отсутствуют';
            noImg.style.color = '#888';
            screenshotWrapper.appendChild(noImg);
          } else {
            const img = document.createElement("img");
            img.src = screenshot.url;
            img.alt = `Шаг ${index + 1}`;
            img.className = "product-image-detail";
            captionDiv.addEventListener("click", function () {
              img.classList.toggle("collapsed-image");
              arrow.textContent = img.classList.contains("collapsed-image") ? "▼" : "▲";
            });
            screenshotWrapper.appendChild(img);
          }
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
        if (data.data.receipt_image === null || data.data.receipt_image === '') {
          receiptArrow.style.display = "none";
          // ничего не добавляем, только подпись 'Чек не приложен' выше
        } else {
          receiptImg = document.createElement("img");
          receiptImg.src = data.data.receipt_image;
          receiptImg.alt = "Чек";
          receiptImg.className = "product-image-detail";
          // Обработчик для сворачивания
          receiptCaption.addEventListener("click", function () {
            receiptImg.classList.toggle("collapsed-image");
            receiptArrow.textContent = receiptImg.classList.contains("collapsed-image") ? "▼" : "▲";
          });
          receiptImageDiv.appendChild(receiptImg);
        }
        receiptImageDiv.appendChild(receiptCaption);
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

        // --- Блок для выбора и подтверждения банка ---
        let bankList = [
          "Сбербанк","Тинькофф Банк","Альфа Банк","ВТБ","Райффайзен Банк","ТОЧКА (ФК ОТКРЫТИЕ)","Газпромбанк","Норвик Банк","Банк Кремлевский","Томскпромстройбанк","Банк Заречье","МЕЖДУНАРОДНЫЙ ФИНАНСОВЫЙ КЛУБ","Северный Народный Банк","Центр-инвест","ВЛАДБИЗНЕСБАНК","КБ Хлынов","НОКССБАНК","ГТ банк","Банк Объединенный капитал","Банк РЕСО Кредит","Земский банк","Кредит Урал Банк","Нацинвестпромбанк","СДМ-Банк","ТАТСОЦБАНК","РУСНАРБАНК","КБ Стройлесбанк","НС Банк","Датабанк","КБЭР Банк Казани","Трансстройбанк","Кузнецкбизнесбанк","ИШБАНК","Алмазэргиэнбанк","РосДорБанк","Дальневосточный банк","Банк ДОМ.РФ","Форштадт","СКБ Примсоцбанк","Банк ПСКБ","ЭЛПЛАТ","БАНК СНГБ","Банк Екатеринбург","АБ РОССИЯ","ЧЕЛЯБИНВЕСТБАНК","Углеметбанк","БыстроБанк","КБ Модульбанк","КБ РостФинанс","Банк ФК Открытие","МЕТКОМБАНК","Банк Русский Стандарт","Банк Акцепт","Совкомбанк","НБД-Банк","Росбанк","КБ ЭНЕРГОТРАНСБАНК","МТС-Банк","Почта Банк","АИКБ Енисейский объединенный банк","ЮМани","УРАЛПРОМБАНК","Россельхозбанк","МБ Банк","МКБ (Московский кредитный банк)","КОШЕЛЕВ-БАНК","Тимер Банк","Банк Санкт-Петербург","Банк АВАНГАРД","Кредит Европа Банк (Россия)","СИНКО-БАНК","Банк Аверс","Банк Венец","УБРиР","Тольяттихимбанк","ЮниКредит Банк","Урал ФД","ГЕНБАНК","Банк ИТУРУП","ТРАНСКАПИТАЛБАНК","Энергобанк","Банк ФИНАМ","КБ ЛОКО-Банк","ЮГ-Инвестбанк","Экспобанк","Газэнергобанк","Банк Снежинский","Банк СКС","Абсолют Банк","Металлинвестбанк","Банк ЗЕНИТ","СИБСОЦБАНК","Банк ВБРР","Банк Развитие-Столица","МОРСКОЙ БАНК","Банк Интеза","МОСКОМБАНК","Первый Инвестиционный Банк","Банк Левобережный","Таврический Банк","Джей энд Ти Банк (АО)","Банк АЛЕКСАНДРОВСКИЙ","ФОРА-БАНК","ВУЗ-банк","Банк Агророс","СОЦИУМ БАНК","Новобанк","АКИБАНК","Прио-Внешторгбанк","ЧЕЛИНДБАНК","Банк БКФ","Эс-Би-Ай Банк","Солид Банк","АКБ Держава","Алеф-Банк","ГАРАНТ-ИНВЕСТ БАНК","Реалист Банк","КБ АГРОПРОМКРЕДИТ","НИКО-БАНК","ГОРБАНК","МСП Банк","Банк Синара","БАНК ОРЕНБУРГ","Банк Национальный стандарт","ИК Банк","КБ АРЕСБАНК","Ак Барс Банк","Хакасский муниципальный банк","ВНЕШФИНБАНК","Банк Саратов","Банк Раунд","РНКБ Банк","РН БАНК","Промсвязьбанк","Автоградбанк","АКБ СЛАВИЯ","Банк СОЮЗ","Ситибанк","Сетелем Банк","НОВИКОМБАНК","Автоторгбанк","Кубаньторгбанк","Новый век","Банк МБА МОСКВА","ББР Банк","ОТП Банк","Тойота Банк","БАНК УРАЛСИБ","Хоум Кредит Банк","КБ Долинск","Ренессанс Кредит","Хайс","СМП Банк","Алтайкапиталбанк","Русьуниверсалбанк","ЮНИСТРИМ БАНК","БКС Банк","Кубань Кредит","АКБ Тендер Банк","КБ Крокус Банк","БАНК СГБ","КБ Пойдём","МОСОБЛБАНК","Банк Приморье","УКБ Белгородсоцбанк","МС Банк Рус","Азиатско Тихоокеанский Банк","КБ Москоммерцбанк","Банк ЦентроКредит","НК Банк","ИС Банк","ПроБанк","Банк ИПБ","КБ Солидарность","АКБ Ланта Банк","Инбанк","Банк Финсервис","БАНК МОСКВА СИТИ","Точка Банк","Банк Вологжанин","Банк СИАБ","Банк БЖФ","Банк Уралфинанс","банк Элита","Яндекс Банк","ГУТА-БАНК","АКБ ЕВРОФИНАНС МОСНАРБАНК","Озон Банк (Ozon)"
        ];
        bankList = bankList.sort((a, b) => a.localeCompare(b, 'ru'));

        const bankFieldBlock = document.createElement('div');
        bankFieldBlock.style.display = 'flex';
        bankFieldBlock.style.alignItems = 'center';
        bankFieldBlock.style.gap = '10px';
        bankFieldBlock.style.marginBottom = '12px';
        // label
        const bankLabel = document.createElement('label');
        bankLabel.textContent = 'Банк:';
        bankLabel.style.fontWeight = 'bold';
        bankLabel.style.fontSize = '16px';
        bankFieldBlock.appendChild(bankLabel);
        // select
        let bankSelect = document.createElement('select');
        bankSelect.style.height = '32px';
        bankSelect.style.fontSize = '15px';
        bankSelect.style.minWidth = '220px';
        // пустой option
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '';
        bankSelect.appendChild(emptyOpt);
        let found = false;
        bankList.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b;
          opt.textContent = b;
          if (b === data.data.bankname) {
            opt.selected = true;
            found = true;
          }
          bankSelect.appendChild(opt);
        });
        if (!found) {
          bankSelect.selectedIndex = 0;
        }
        let confirmBankBtn = document.createElement('button');
        confirmBankBtn.textContent = 'Подтвердить банк';
        confirmBankBtn.className = 'btn btn-gray';
        confirmBankBtn.style.height = '32px';
        confirmBankBtn.style.marginLeft = '8px';
        confirmBankBtn.disabled = !bankSelect.value;
        let selectedBank = data.data.bankname;
        let bankConfirmed = false;
        bankSelect.addEventListener('change', function() {
          confirmBankBtn.disabled = !bankSelect.value;
        });
        bankFieldBlock.appendChild(bankSelect);
        bankFieldBlock.appendChild(confirmBankBtn);
        userInfoDiv.prepend(bankFieldBlock);
        // --- замки для verifyBtn ---
        let fioLock = document.createElement('span');
        fioLock.className = 'disabled-icon fio-lock';
        fioLock.textContent = '🔒';
        let bankLock = document.createElement('span');
        bankLock.className = 'disabled-icon bank-lock';
        bankLock.textContent = '🔒';
        if (!document.querySelector('.fio-lock')) verifyBtn.appendChild(fioLock);
        if (!document.querySelector('.bank-lock')) verifyBtn.appendChild(bankLock);
        // --- подтверждение банка ---
        confirmBankBtn.addEventListener('click', function() {
          if (!bankSelect.value) return;
          bankConfirmed = true;
          selectedBank = bankSelect.value;
          confirmBankBtn.textContent = 'Банк подтвержден';
          confirmBankBtn.classList.remove('btn-gray');
          confirmBankBtn.classList.add('btn-green');
          if (bankLock) bankLock.remove();
          verifyBtn.disabled = !(fioConfirmed && bankConfirmed);
        });
        bankSelect.addEventListener('change', function() {
          bankConfirmed = false;
          confirmBankBtn.textContent = 'Подтвердить банк';
          confirmBankBtn.classList.remove('btn-green');
          confirmBankBtn.classList.add('btn-gray');
          if (!document.querySelector('.bank-lock') && bankLock) verifyBtn.appendChild(bankLock);
          verifyBtn.disabled = true;
        });

        // --- Блок для редактирования ФИО ---
        const fioBlock = document.createElement("div");
        fioBlock.style.display = "flex";
        fioBlock.style.gap = "16px";
        fioBlock.style.marginBottom = "16px";
        fioBlock.style.alignItems = "flex-end";
        fioBlock.style.justifyContent = "flex-start";

        // Разделяем ФИО на части
        const fioOriginal = data.data.cardholder ? data.data.cardholder.trim().split(/\s+/) : [];
        const [surname, name, patronymic] = [fioOriginal[0] || '', fioOriginal[1] || '', fioOriginal[2] || ''];
        const fioVariants = fioOriginal;

        function createFioInput(value, placeholder, variants, isPatronymic = false) {
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'center';
          wrapper.style.minWidth = '140px';
          // Подпись сверху внутри ячейки
          const label = document.createElement('label');
          label.style.fontSize = '14px';
          label.style.marginBottom = '4px';
          label.style.fontWeight = 'bold';
          label.style.textAlign = 'center';
          if (isPatronymic) {
            const labelWrap = document.createElement('div');
            labelWrap.style.display = 'flex';
            labelWrap.style.alignItems = 'center';
            labelWrap.style.justifyContent = 'center';
            labelWrap.style.gap = '4px';
            const sub = document.createElement('span');
            sub.textContent = '(если есть)';
            sub.style.fontSize = '12px';
            sub.style.color = '#888';
            label.textContent = placeholder;
            labelWrap.appendChild(label);
            labelWrap.appendChild(sub);
            wrapper.appendChild(labelWrap);
          } else {
            label.textContent = placeholder;
            wrapper.appendChild(label);
          }
          const input = document.createElement('input');
          input.type = 'text';
          input.value = value;
          input.placeholder = placeholder;
          input.style.width = '120px';
          input.style.marginBottom = isPatronymic ? '0px' : '2px';
          input.style.textAlign = 'left'; // Исправлено с center на left для корректного выравнивания с datalist
          // datalist для выбора из вариантов (всегда все части ФИО)
          const datalist = document.createElement('datalist');
          datalist.id = 'list_' + placeholder;
          variants.forEach(v => {
            if (v) {
              const opt = document.createElement('option');
              opt.value = v;
              datalist.appendChild(opt);
            }
          });
          input.setAttribute('list', datalist.id);
          wrapper.appendChild(input);
          wrapper.appendChild(datalist);
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
        confirmFioBtn.style.height = '40px';
        confirmFioBtn.style.marginBottom = '0px';
        fioBlock.appendChild(confirmFioBtn);

        userInfoDiv.prepend(fioBlock);

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
          if (fioLock) fioLock.remove();
          verifyBtn.disabled = !(fioConfirmed && bankConfirmed);
        });
        verifyBtn.disabled = true;

        // Добавление логики для кнопки verifyBtn
        verifyBtn.addEventListener("click", function () {
          if (!fioConfirmed) {
            alert('Сначала подтвердите ФИО!');
            return;
          }
          if (!bankConfirmed) {
            alert('Сначала подтвердите банк!');
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
        
          verifyBtn.classList.add('loading');
          verifyBtn.disabled = true;
          fetch("toggleVerify.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: id,
              comment: commentField.value,
              modified_payment: modifiedPaymentField.value, // Отправка изменённой выплаты
              cardholder: fioValue, // Новое ФИО
              bankname: selectedBank // Новый банк
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              verifyBtn.classList.remove('loading');
              verifyBtn.disabled = false;
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
              verifyBtn.classList.remove('loading');
              verifyBtn.disabled = false;
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
          payBtn.disabled = true;
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
                  payBtn.disabled = false;
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
                  payBtn.disabled = false;
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