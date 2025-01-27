const applicationsData = [
    {
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 2 // In progress
    },
    {
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    }
];

function renderApplications() {
    const applicationsContainer = document.getElementById('applications');
    applicationsContainer.innerHTML = '';

    // Sort applications by status: 2 (in progress) first, then 1 (waiting)
    const sortedApplications = applicationsData.sort((a, b) => b.status - a.status);

    sortedApplications.forEach((app, index) => {
        const appDiv = document.createElement('div');
        appDiv.className = `application ${getStatusClass(app.status)}`;
        appDiv.innerHTML = `
            <p><strong>Банк:</strong> ${app.bank}</p>
            <p><strong>Номер:</strong> ${app.phone}</p>
            <p><strong>Номер карты:</strong> ${app.cardNumber}</p>
            <p><strong>Выгода:</strong> ${app.profit}</p>
            <p class="status"><strong>Статус:</strong> ${getStatusText(app.status)}</p>
            <button class="button ${getButtonClass(app.status)}" onclick="handleButtonClick(${index})">${getButtonText(app.status)}</button>
        `;
        applicationsContainer.appendChild(appDiv);
    });
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
        app.status = 2; // Change to "In Progress"
        alert('Статус изменен на "В работе"');
    } else if (app.status === 2) {
        app.status = 3; // Change to "Completed"
        alert('Заявка завершена');
    }

    renderApplications();
}

function refreshApplications() {
    renderApplications();
}

// Initial render
renderApplications();
