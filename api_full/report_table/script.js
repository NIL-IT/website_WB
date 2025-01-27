const applicationsData = [
    {
        cardholder: "Иванов Иван Иванович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 2 // In progress
    },
    {
        cardholder: "Петров Петр Петрович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        cardholder: "Сидоров Сидор Сидорович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        cardholder: "Иванов Иван Иванович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 2 // In progress
    },
    {
        cardholder: "Петров Петр Петрович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        cardholder: "Сидоров Сидор Сидорович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        cardholder: "Иванов Иван Иванович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 2 // In progress
    },
    {
        cardholder: "Петров Петр Петрович",
        bank: "Совкомбанк",
        phone: "+79062828242",
        cardNumber: "5536093455667888",
        profit: "2149 руб.",
        status: 1 // Waiting for payment
    },
    {
        cardholder: "Сидоров Сидор Сидорович",
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
        appDiv.className = `application`;
        appDiv.innerHTML = `
            <div class="cardholder ${getStatusClass(app.status)}">${app.cardholder}</div>
            <div class="application-content">
                <p><strong>Банк:</strong> <span class="black">${app.bank}</span></p>
                <p><strong>Телефон:</strong> <span class="black">${app.phone}</span></p>
                <p><strong>Номер карты:</strong> <span class="black">${app.cardNumber}</span></p>
                <p><strong>Выгода:</strong> <span class="black">${app.profit}</span></p>
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
        app.status = 2; // Change to "In Progress"
    } else if (app.status === 2) {
        app.status = 3; // Change to "Completed"
        applicationsData.splice(index, 1); // Remove the application from the array
    }

    renderApplications(); // Re-render the applications
}


function refreshApplications() {
    // Mock new data fetching for the demo (in real scenario, fetch updated data from server)
    applicationsData.push({
        cardholder: "Новиков Николай Николаевич",
        bank: "Новый банк",
        phone: "+79012345678",
        cardNumber: "1234567812345678",
        profit: "3000 руб.",
        status: 1 // Waiting for payment
    });

    renderApplications();
}

// Initial render
renderApplications();
