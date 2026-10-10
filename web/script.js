function updateDateTime() {
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