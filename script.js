// --- Дата и время ---
function getDates() {
    const now = new Date();

    // Для отображения: "08.10.2026 14:02"
    const displayDate = now.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '');

    // Для QR и чека: "08-10-2026A14:02:32"
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const qrDate = `${day}-${month}-${year}A${hours}:${minutes}:${seconds}`;

    return { displayDate, qrDate };
}

// --- Генерация серии и номера билета ---
function generateSerial() {
    return 'QR' + Math.floor(100000000000 + Math.random() * 900000000000);
}
function generateTicketNumber() {
    const now = new Date();
    const stamp = String(now.getFullYear()) +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0') +
                  String(now.getHours()).padStart(2, '0') +
                  String(now.getMinutes()).padStart(2, '0') +
                  String(now.getSeconds()).padStart(2, '0');
    return stamp + Math.floor(100000 + Math.random() * 900000);
}

// --- Показ билета ---
function showTicket() {
    const type = document.getElementById('transportType').value;
    const route = document.getElementById('routeNumber').value.trim() || '7М';
    const vehicle = document.getElementById('vehicleNumber').value.trim() || '422';
    const price = document.getElementById('price').value.trim() || '40';

    const { displayDate, qrDate } = getDates();
    const serial = generateSerial();
    const ticketNumber = generateTicketNumber();

    // Заполняем билет
    document.getElementById('displayType').textContent = type;
    document.getElementById('displayBusNumber').textContent = route;
    document.getElementById('displayVehicleNumber').textContent = vehicle;
    document.getElementById('displayPrice').textContent = price;
    document.getElementById('currentDate').textContent = displayDate;
    document.getElementById('displaySerial').textContent = serial;
    document.getElementById('displayTicketNumber').textContent = ticketNumber;

    // QR-код (длинная строка, чтобы QR был плотным — как на скрине)
    const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
    const qrText = `https://qr.bilet.nspk.ru/payment?paytagid=${serial}&type=${typeEng}&route=${route}&ts=${vehicle}&date=${qrDate}&price=${price}`;
    document.getElementById('qrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(qrText)}`;

    // Сохраняем данные для чека
    window._ticketData = {
        type, route, vehicle, price, qrDate, displayDate,
        serial, ticketNumber, typeEng
    };

    // Переключаем экраны
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('ticketSection').style.display = 'block';

    startTimer();
}

// --- Таймер (MM:SS, тикает вверх) ---
let time = 0;
let timerInterval = null;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            time++;
            const h = Math.floor(time / 3600);
            const m = Math.floor((time % 3600) / 60);
            const s = time % 60;

            let str;
            if (h > 0) {
                str = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            } else {
                str = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            }
            document.getElementById('timer').textContent = str;
        }, 1000);
    }
}

// --- Скачивание билета → открывает чек в новой вкладке ---
function downloadTicket() {
    const d = window._ticketData;
    if (!d) return;

    const receiptHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Чек</title>
<style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; }
    .line { margin: 8px 0; }
    .label { color: #666; font-size: 12px; display: block; margin-top: 12px; }
    .value { font-size: 15px; }
    .qr { margin-top: 20px; }
    .qr img { width: 400px; height: 400px; }
</style>
</head>
<body>
    <div class="value">${d.qrDate.replace('A', ' ')}</div>

    <span class="label">Вид билета</span>
    <div class="value">Разовый билет QRPay</div>

    <span class="label">Серия билета</span>
    <div class="value">${d.serial}</div>

    <span class="label">Номер билета</span>
    <div class="value">${d.ticketNumber}</div>

    <span class="label">ИНН перевозчика</span>
    <div class="value">5507022628</div>

    <span class="label">Наименование перевозчика</span>
    <div class="value">АО "Пассажирское предприятие № 8"</div>

    <span class="label">Вид транспорта</span>
    <div class="value">${d.type}</div>

    <span class="label">Маршрут/Станция</span>
    <div class="value">${d.route}</div>

    <span class="label">Номер ТС</span>
    <div class="value">${d.vehicle}</div>

    <span class="label">Дата и время поездки</span>
    <div class="value">${d.qrDate}</div>

    <span class="label">Стоимость</span>
    <div class="value">${d.price}.0 ₽</div>

    <div class="qr">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent('https://qr.bilet.nspk.ru/payment?paytagid=' + d.serial + '&type=' + d.typeEng + '&route=' + d.route + '&ts=' + d.vehicle + '&date=' + d.qrDate + '&price=' + d.price)}" alt="QR">
    </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.write(receiptHTML);
    w.document.close();
}function getDates() {
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
