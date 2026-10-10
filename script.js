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

function showTicket() {
    const type = document.getElementById('transportType').value;
    const ticketType = document.getElementById('ticketType').value; // spb / 2gis / oldspb
    const route = document.getElementById('routeNumber').value.trim() || '125';
    const vehicle = document.getElementById('vehicleNumber').value.trim() || '455';
    const price = document.getElementById('price').value.trim() || '40';

    const { displayDate, qrDate } = getDates();

    document.getElementById('displayType').textContent = type;
    document.getElementById('displayBusNumber').textContent = route;
    document.getElementById('displayVehicleNumber').textContent = vehicle;
    document.getElementById('displayPrice').textContent = price + ' ₽';
    document.getElementById('currentDate').textContent = displayDate;

    // QR-код
    const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
    const qrText = `Транспорт: ${typeEng}, Маршрут: ${route}, ТС: ${vehicle}, Время входа: ${qrDate}, Стоимость: ${price}₽`;
    document.getElementById('qrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=410x410&ecc=H&margin=2&data=${encodeURIComponent(qrText)}`;

    // Применяем класс для разных типов билета (для будущих стилей)
    const ticketPage = document.getElementById('ticketSection');
    ticketPage.className = 'ticket-page ticket-' + ticketType;

    document.getElementById('inputSection').style.display = 'none';
    ticketPage.style.display = 'block';

    startTimer();
}

let time = 0;
let timerInterval = null;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            time++;
            const h = Math.floor(time / 3600);
            const m = Math.floor((time % 3600) / 60);
            const s = time % 60;
            document.getElementById('timer').textContent =
                `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }, 1000);
    }
}

function saveTicket() {
    alert('Билет сохранён в памяти телефона!');
}
