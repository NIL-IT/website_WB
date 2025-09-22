let originalData = []; // Сохраняем изначальные данные
let zeroReportsData = []; // Данные для нулевых отчётов
let isZeroReportsMode = false; // Флаг режима

document.addEventListener("DOMContentLoaded", function () {
    loadDefaultReports();
});

function loadDefaultReports() {
    showZeroLoading(false);
    fetch("fetchApplications.php")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                applicationsData = data.data;
                originalData = [...applicationsData];
                sortByCompletedAt('asc');
                setActiveButton('completed_at', 'asc');
            } else {
                console.error("Ошибка при получении данных:", data.error);
            }
            showZeroLoading(false);
        })
        .catch((error) => {
            console.error("Ошибка при получении данных:", error);
            showZeroLoading(false);
        });
}

function loadZeroReports() {
    showZeroLoading(true);
    fetch("fetchZeroReports.php")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                zeroReportsData = data.data;
                applicationsData = [...zeroReportsData];
                renderApplications('zero');
            } else {
                console.error("Ошибка при получении нулевых отчётов:", data.error);
            }
            showZeroLoading(false);
        })
        .catch((error) => {
            console.error("Ошибка при получении нулевых отчётов:", error);
            showZeroLoading(false);
        });
}

// Обработчик переключателя
function toggleZeroReports() {
    const toggle = document.getElementById('zero-toggle');
    isZeroReportsMode = toggle.checked;
    if (isZeroReportsMode) {
        applicationsData = [];
        originalData = [];
        loadZeroReports();
    } else {
        zeroReportsData = [];
        loadDefaultReports();
    }
}

document.addEventListener('click', function (event) {
    const suggestionsContainer = document.getElementById('manager-suggestions');
    if (!document.getElementById('manager-filter').contains(event.target)) {
        suggestionsContainer.style.display = 'none';
    }
});

function toggleSortMenu() {
    const sortMenu = document.getElementById('sort-menu');
    sortMenu.style.display = sortMenu.style.display === 'none' ? 'block' : 'none';

    // Снимаем выделение с кнопки "Сортировка"
    document.querySelector('.sort-buttons button').classList.remove('active');
}

function renderApplications(sortBy = 'status', order = 'desc') {
    const applicationsContainer = document.getElementById('applications');
    applicationsContainer.innerHTML = '';

    let sortedApplications;
    // Сортировка работает для всех режимов
    switch (sortBy) {
        case 'status':
            sortedApplications = applicationsData.slice().sort((a, b) => a.status - b.status);
            break;
        case 'cardholder':
            sortedApplications = applicationsData.slice().sort((a, b) => order === 'asc' ? a.cardholder.localeCompare(b.cardholder) : b.cardholder.localeCompare(a.cardholder));
            break;
        case 'profit':
            sortedApplications = applicationsData.slice().sort((a, b) => order === 'asc' ? parseFloat(a.profit) - parseFloat(b.profit) : parseFloat(b.profit) - parseFloat(a.profit));
            break;
        case 'product_name':
            sortedApplications = applicationsData.slice().sort((a, b) => order === 'asc' ? a.product_name.localeCompare(b.product_name) : b.product_name.localeCompare(a.product_name));
            break;
        case 'completed_at':
            sortedApplications = applicationsData.slice().sort((a, b) => {
                const dateA = a.completed_at ? new Date(a.completed_at) : null;
                const dateB = b.completed_at ? new Date(b.completed_at) : null;

                if (dateA === null && dateB === null) return 0;
                if (dateA === null) return order === 'asc' ? -1 : 1;
                if (dateB === null) return order === 'asc' ? 1 : -1;

                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });
            break;
        default:
            sortedApplications = applicationsData.slice().sort((a, b) => b.status - a.status);
    }

    // Ensure status 2 is above status 1
    sortedApplications = sortedApplications.sort((a, b) => {
        if (a.status === 2 && b.status !== 2) return -1;
        if (a.status !== 2 && b.status === 2) return 1;
        if (a.status === 1 && b.status !== 1) return -1;
        if (a.status !== 1 && b.status === 1) return 1;
        return 0;
    });

    sortedApplications.forEach((app, index) => {
        // Проверка на "просроченность"
        let showWarning = false;
        if (app.updated_at) {
            const updatedDate = new Date(app.updated_at);
            const now = new Date();
            const threeMonthsLater = new Date(updatedDate);
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
            if (threeMonthsLater < now) {
                showWarning = true;
            }
        }

        const warningHtml = showWarning
            ? `<span class="expire-warning" title="Данный товар подлежит удалению из-за срока давности (более 3 месяцев), оплатите его в первую очередь!">
                    <span class="circle"><span class="icon">&#10071;</span></span>
                </span>`
            : '';

        // Для нулевых отчётов - синий цвет и оранжевая кнопка
        let isZeroReport = isZeroReportsMode;
        const cardholderClass = isZeroReport
            ? 'zero-report'
            : `${getStatusClass(app.status)}${showWarning ? ' expire-header' : ''}`;

        let buttonHtml;
        if (isZeroReport) {
            buttonHtml = `<button class="button zero-action" onclick="handleZeroButtonClick(${index})">Перейти к отчёту</button>`;
        } else {
            buttonHtml = `<button class="button ${getButtonClass(app.status)}" onclick="handleButtonClick(${index})">${getButtonText(app.status)}</button>`;
        }

        const appDiv = document.createElement('div');
        appDiv.className = `application`;
        appDiv.innerHTML = `
            <div class="cardholder ${cardholderClass}" style="position:relative;">
                ${app.cardholder}
                ${warningHtml}
            </div>
            <div class="application-content">
                <p><strong>Банк:</strong> <span class="black">${app.bank}</span></p>
                <p><strong>Телефон:</strong> <span class="black">${app.phone}</span></p>
                <p><strong>Номер карты:</strong> <span class="black">${app.cardnumber}</span></p>
                <p><strong>Выгода:</strong> <span class="black">${app.profit}</span></p>
                <p><strong>Товар:</strong> <span class="black">${app.product_name}</span></p>
                <p><strong>Менеджер:</strong> <span class="black">${app.tg_nick_manager}</span></p>
                <p><strong>Дата поступления:</strong> <span class="black">${app.completed_at ? app.completed_at : 'Не указано'}</span></p>
            </div>
            <div class="status-container">
                <span class="status ${getStatusClass(app.status)}">${getStatusText(app.status)}</span>
                ${buttonHtml}
            </div>
        `;
        applicationsContainer.appendChild(appDiv);
    });

    // Ensure main content is scrollable
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.overflowY = 'auto';
    }

    // Adjust footer positioning
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.position = 'sticky';
        footer.style.bottom = '0';
        footer.style.borderTop = '1px solid #000000';
    }
}

function getStatusText(status) {
    switch (status) {
        case 0: return 'Не подтверждено';
        case 1: return 'Ждет оплаты';
        case 2: return 'В работе';
        case 3: return 'Завершено';
        default: return '';
    }
}

function getButtonText(status) {
    return status === 1 ? 'Начать' : status === 2 ? 'Завершить' : '';
}

function getStatusClass(status) {
    switch (status) {
        case 1: return 'waiting';
        case 2: return 'in-progress';
        case 3: return 'completed';
        default: return '';
    }
}

function getButtonClass(status) {
    return status === 1 ? 'start' : status === 2 ? 'complete' : '';
}

function handleButtonClick(index) {
    if (isZeroReportsMode) return; // Не обрабатываем в режиме нулевых отчётов

    const app = applicationsData[index];

    if (app.status === 1) {
        fetch("updateStatus.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: app.id
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                window.location.href = app.url;
            } else {
                console.error("Ошибка при обновлении статуса:", data.error);
            }
        })
        .catch((error) => {
            console.error("Ошибка при обновлении статуса:", error);
        });
    } else if (app.status === 2) {
        window.location.href = app.url;
    }
}

// Обработчик кнопки для нулевых отчётов
function handleZeroButtonClick(index) {
    const app = applicationsData[index];
    window.location.href = app.url;
}

function refreshApplications() {
    if (isZeroReportsMode) {
        loadZeroReports();
    } else {
        loadDefaultReports();
    }
}

// New functions for sorting
function sortByStatus() {
    renderApplications('status');
    setActiveButton('status');
}

function sortByCardholder(order) {
    renderApplications('cardholder', order);
    setActiveButton('cardholder', order);
}

function sortByProfit(order) {
    renderApplications('profit', order);
    setActiveButton('profit', order);
}

function sortByProductName(order) {
    renderApplications('product_name', order);
    setActiveButton('product_name', order);
}

function sortByCompletedAt(order) {
    renderApplications('completed_at', order);
    setActiveButton('completed_at', order);
}

function setActiveButton(sortBy, order = 'desc') {
    const buttons = document.querySelectorAll('.sort-menu button');
    buttons.forEach(button => button.classList.remove('active'));

    let activeButton;
    switch (sortBy) {
        case 'default':
            activeButton = buttons[0]; // Первая кнопка "По умолчанию"
            break;
        case 'cardholder':
            activeButton = order === 'asc' ? buttons[1] : buttons[2];
            break;
        case 'profit':
            activeButton = order === 'asc' ? buttons[3] : buttons[4];
            break;
        case 'product_name':
            activeButton = order === 'asc' ? buttons[5] : buttons[6];
            break;
        case 'completed_at':
            activeButton = order === 'asc' ? buttons[7] : buttons[8];
            break;
    }

    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Function for default sorting
function sortByDefault() {
    applicationsData = [...originalData]; // Восстанавливаем исходные данные
    renderApplications();
    setActiveButton('default');
}

// Function for filtering by manager
function filterByManager() {
    const managerInput = document.getElementById('manager-filter').value.toLowerCase();
    const filteredApplications = originalData.filter(app => app.tg_nick_manager.toLowerCase().includes(managerInput));
    applicationsData = filteredApplications;
    renderApplications();
    showManagerSuggestions(managerInput);
}

// Function to show manager suggestions
function showManagerSuggestions(input) {
    const suggestionsContainer = document.getElementById('manager-suggestions');
    suggestionsContainer.innerHTML = '';

    const suggestions = originalData
        .map(app => app.tg_nick_manager)
        .filter((value, index, self) => self.indexOf(value) === index) // Уникальные значения
        .filter(nick => input.length === 0 || nick.toLowerCase().includes(input))
        .slice(0, 5); // Ограничиваем количество предложений

    suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion';
        suggestionDiv.innerText = suggestion;
        suggestionDiv.onclick = () => {
            document.getElementById('manager-filter').value = suggestion;
            suggestionsContainer.style.display = 'none'; // Скрываем предложения
            filterByManager();
        };
        suggestionsContainer.appendChild(suggestionDiv);
    });

    suggestionsContainer.style.display = 'block'; // Показываем предложения
}

// Show suggestions on input focus
document.getElementById('manager-filter').addEventListener('focus', function () {
    showManagerSuggestions(this.value);
});

function showZeroLoading(show) {
    const spinner = document.getElementById('zero-loading');
    if (spinner) spinner.style.display = show ? 'inline-block' : 'none';
}