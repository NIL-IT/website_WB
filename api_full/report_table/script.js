document.addEventListener("DOMContentLoaded", function () {
    fetch("fetchApplications.php")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                applicationsData = data.data;
                // Сортируем так, чтобы сначала были status = 2, потом status = 1
                sortByDefault();
            } else {
                console.error("Ошибка при получении данных:", data.error);
            }
        })
        .catch((error) => {
            console.error("Ошибка при получении данных:", error);
        });
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
    switch (sortBy) {
        case 'status':
            sortedApplications = applicationsData.sort((a, b) => a.status - b.status);
            break;
        case 'cardholder':
            sortedApplications = applicationsData.sort((a, b) => order === 'asc' ? a.cardholder.localeCompare(b.cardholder) : b.cardholder.localeCompare(a.cardholder));
            break;
        case 'profit':
            sortedApplications = applicationsData.sort((a, b) => order === 'asc' ? parseFloat(a.profit) - parseFloat(b.profit) : parseFloat(b.profit) - parseFloat(a.profit));
            break;
        case 'product_name':
            sortedApplications = applicationsData.sort((a, b) => order === 'asc' ? a.product_name.localeCompare(b.product_name) : b.product_name.localeCompare(a.product_name));
            break;
        default:
            sortedApplications = applicationsData.sort((a, b) => b.status - a.status);
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
        const appDiv = document.createElement('div');
        appDiv.className = `application`;
        appDiv.innerHTML = `
            <div class="cardholder ${getStatusClass(app.status)}">${app.cardholder}</div>
            <div class="application-content">
                <p><strong>Банк:</strong> <span class="black">${app.bank}</span></p>
                <p><strong>Телефон:</strong> <span class="black">${app.phone}</span></p>
                <p><strong>Номер карты:</strong> <span class="black">${app.cardnumber}</span></p>
                <p><strong>Выгода:</strong> <span class="black">${app.profit}</span></p>
                <p><strong>Товар:</strong> <span class="black">${app.product_name}</span></p>
            </div>
            <div class="status-container">
                <span class="status ${getStatusClass(app.status)}">${getStatusText(app.status)}</span>
                <button class="button ${getButtonClass(app.status)}" onclick="handleButtonClick(${index})">${getButtonText(app.status)}</button>
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
        case 0: return 'Не попало';
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

function refreshApplications() {
    fetch("fetchApplications.php")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                applicationsData = data.data;
                renderApplications();
            } else {
                console.error("Ошибка при получении данных:", data.error);
            }
        })
        .catch((error) => {
            console.error("Ошибка при получении данных:", error);
        });
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
    }

    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Function for default sorting
function sortByDefault() {
    applicationsData.sort((a, b) => b.status - a.status);
    renderApplications();
    setActiveButton('default');
}
