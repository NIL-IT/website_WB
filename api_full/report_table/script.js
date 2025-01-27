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

    applicationsData.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'application';
        appDiv.innerHTML = `
            <p>Банк: ${app.bank}</p>
            <p>Номер: ${app.phone}</p>
            <p>Номер карты: ${app.cardNumber}</p>
            <p>Выгода: ${app.profit}</p>
            <p class="status">Статус: ${getStatusText(app.status)}</p>
            <button class="button" onclick="handleButtonClick(${app.status})">${getButtonText(app.status)}</button>
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
    return status === 1 ? 'Начать' : 'Завершить';
}

function handleButtonClick(status) {
    // Logic to handle button click based on status
    if (status === 1) {
        alert('Статус изменен на "В работе"');
    } else {
        alert('Заявка завершена');
    }
}

function refreshApplications() {
    renderApplications();
}

// Initial render
renderApplications();
