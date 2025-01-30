document.addEventListener("DOMContentLoaded", function () {
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
});

function renderApplications() {
    const applicationsContainer = document.getElementById('applications');
    applicationsContainer.innerHTML = '';

    // Sort applications by status: 2 (in progress) first, then 1 (waiting)
    const sortedApplications = applicationsData.sort((a, b) => b.status - a.status);

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
