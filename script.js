// --- Дата и время ---
function getDates() {
    const now = new Date();

    const displayDate = now.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '');

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const qrDate = `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;

    return { displayDate, qrDate };
}

// --- Показ билета ---
function showTicket() {
    const type = document.getElementById('transportType').value;
    const route = document.getElementById('routeNumber').value.trim() || '125';
    const vehicle = document.getElementById('vehicleNumber').value.trim() || '455';
    const price = document.getElementById('price').value.trim() || '40';

    const { displayDate, qrDate } = getDates();

    document.getElementById('displayType').textContent = type;
    document.getElementById('displayBusNumber').textContent = route;
    document.getElementById('displayVehicleNumber').textContent = vehicle;
    document.getElementById('displayPrice').textContent = price + ' ₽';
    document.getElementById('currentDate').textContent = displayDate;

    // Динамический QR-код
    const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
    const qrText = `Транспорт: ${typeEng}, Маршрут: ${route}, ТС: ${vehicle}, Время входа: ${qrDate}, Стоимость: ${price}₽`;
    document.getElementById('qrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=410x410&ecc=H&margin=2&data=${encodeURIComponent(qrText)}`;

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('topBar').style.display = 'none';
    document.getElementById('ticketSection').style.display = 'block';

    startTimer();
}

// --- Таймер вверх ---
let time = 0;
let timerInterval = null;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            time++;
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            document.getElementById('timer').textContent =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
}

// --- Скачать билет ---
function saveTicket() {
    alert('Билет сохранён в памяти телефона!');
}

// --- Верхняя панель ---
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        console.log('Выбран вид чека:', this.dataset.type);
    });
});// --- Дата и время ---
function getDates() {
    const now = new Date();

    const displayDate = now.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '');

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const qrDate = `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;

    return { displayDate, qrDate };
}

// --- Показать билет ---
function showTicket() {
    const type = document.getElementById('transportType').value;
    const route = document.getElementById('routeNumber').value.trim() || '125';
    const vehicle = document.getElementById('vehicleNumber').value.trim() || '455';
    const price = document.getElementById('price').value.trim() || '40';

    const { displayDate, qrDate } = getDates();

    document.getElementById('displayType').textContent = type;
    document.getElementById('displayBusNumber').textContent = route;
    document.getElementById('displayVehicleNumber').textContent = vehicle;
    document.getElementById('displayPrice').textContent = price + ' ₽';
    document.getElementById('currentDate').textContent = displayDate;

    // Формируем QR-код (стандартный QR: с 3 угловыми квадратами и выравнивателями)
    const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
    const qrText = `Транспорт: ${typeEng}, Маршрут: ${route}, ТС: ${vehicle}, Время входа: ${qrDate}, Стоимость: ${price}₽`;

    // ecc=H (высокий уровень коррекции), margin=2 — отступ от края
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=410x410&ecc=H&margin=2&qzone=2&data=${encodeURIComponent(qrText)}`;
    document.getElementById('qrCode').src = qrUrl;

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('ticketSection').style.display = 'block';

    startTimer();
}

// --- Таймер вверх ---
let time = 0;
let timerInterval = null;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            time++;
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            document.getElementById('timer').textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
}

// --- Сохранить билет ---
function saveTicket() {
    alert('Билет сохранён в памяти телефона!');
}

// --- Верхняя панель: переключение вида чека ---
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Здесь можно добавить логику переключения вида чека в будущем
        console.log('Выбран вид чека:', this.dataset.type);
    });
});function updateDateTime() {
    const now = new Date();
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return now.toLocaleString('ru-RU', dateOptions).replace(',', '');
}

function showTicket() {
    const busInput = document.getElementById('busNumber')?.value || '';
    const vehicleNumber = document.getElementById('vehicleNumber')?.value || '539';
    const priceInput = document.getElementById('price')?.value || '35';
    const price = `${priceInput} ₽`;
    const busNumber = busInput ? `№${busInput}` : '№125';

    if (!document.getElementById('displayBusNumber') || !document.getElementById('displayPrice') || !document.getElementById('displayVehicleNumber') || !document.getElementById('currentDate')) {
        console.error('Не найдены элементы для отображения билета');
        return;
    }

    document.getElementById('displayBusNumber').textContent = busNumber;
    document.getElementById('displayPrice').textContent = price;
    document.getElementById('displayVehicleNumber').textContent = vehicleNumber;
    document.getElementById('currentDate').textContent = updateDateTime();

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('ticketSection').style.display = 'flex';
    startTimer();

    // Обновляем URL в адресной строке
    window.history.pushState({}, document.title, 'https://qr.bilet.nspk.ru/result?open');
}

let time = 0;
let timerInterval = null;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            time++;
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            document.getElementById('timer').textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
}

function saveTicket() {
    alert('Билет сохранён в памяти телефона!');
}

setInterval(() => {
    if (document.getElementById('ticketSection').style.display !== 'none') {
        document.getElementById('currentDate').textContent = updateDateTime();
    }
}, 60000);
