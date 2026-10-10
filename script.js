// ===== Утилиты =====
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
    const qrDate = `${day}-${month}-${year}A${hours}:${minutes}:${seconds}`;

    return { displayDate, qrDate };
}

function generateSerial() {
    return 'QR' + Math.floor(100000000000 + Math.random() * 900000000000);
}

function generateTicketNumber() {
    const n = new Date();
    const stamp = String(n.getFullYear()) +
                  String(n.getMonth() + 1).padStart(2, '0') +
                  String(n.getDate()).padStart(2, '0') +
                  String(n.getHours()).padStart(2, '0') +
                  String(n.getMinutes()).padStart(2, '0') +
                  String(n.getSeconds()).padStart(2, '0');
    return stamp + Math.floor(100000 + Math.random() * 900000);
}

// ===== Основная логика =====
let time = 0;
let timerInterval = null;

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        time++;
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = time % 60;
        const str = h > 0
            ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        const el = document.getElementById('timer');
        if (el) el.textContent = str;
    }, 1000);
}

function showTicket() {
    try {
        console.log('=== showTicket запущена ===');

        const typeEl = document.getElementById('transportType');
        const routeEl = document.getElementById('routeNumber');
        const vehicleEl = document.getElementById('vehicleNumber');
        const priceEl = document.getElementById('price');

        if (!typeEl || !routeEl || !vehicleEl || !priceEl) {
            console.error('Не найдены поля ввода!');
            alert('Ошибка: не найдены поля ввода');
            return;
        }

        const type = typeEl.value || 'Троллейбус';
        const route = routeEl.value.trim() || '7М';
        const vehicle = vehicleEl.value.trim() || '422';
        const price = priceEl.value.trim() || '40';

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

        // QR-код
        const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
        const qrText = `https://qr.bilet.nspk.ru/payment?paytagid=${serial}&type=${typeEng}&route=${route}&ts=${vehicle}&date=${qrDate}&price=${price}`;
        console.log('QR text:', qrText);

        document.getElementById('qrCode').src =
            `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(qrText)}`;

        // Сохраняем данные для чека
        window._ticketData = {
            type, route, vehicle, price, qrDate, displayDate,
            serial, ticketNumber, typeEng
        };

        // Переключаем экраны
        const inputSection = document.getElementById('inputSection');
        const ticketSection = document.getElementById('ticketSection');
        console.log('Скрываем форму, показываем билет');
        inputSection.style.display = 'none';
        ticketSection.style.display = 'block';
        window.scrollTo(0, 0);

        startTimer();
        console.log('=== Готово ===');
    } catch (err) {
        console.error('ОШИБКА в showTicket:', err);
        alert('Произошла ошибка: ' + err.message);
    }
}

function downloadTicket() {
    const d = window._ticketData;
    if (!d) {
        alert('Сначала создайте билет!');
        return;
    }

    const receiptHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Чек</title>
<style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; }
    .label { color: #666; font-size: 12px; display: block; margin-top: 12px; }
    .value { font-size: 15px; }
    .qr { margin-top: 20px; }
    .qr img { width: 400px; height: 400px; }
</style>
</head>
<body>
    <div class="value">${d.qrDate.replace('A', ' ')}</div>
    <span class="label">Вид билета</span><div class="value">Разовый билет QRPay</div>
    <span class="label">Серия билета</span><div class="value">${d.serial}</div>
    <span class="label">Номер билета</span><div class="value">${d.ticketNumber}</div>
    <span class="label">ИНН перевозчика</span><div class="value">5507022628</div>
    <span class="label">Наименование перевозчика</span><div class="value">АО "Пассажирское предприятие № 8"</div>
    <span class="label">Вид транспорта</span><div class="value">${d.type}</div>
    <span class="label">Маршрут/Станция</span><div class="value">${d.route}</div>
    <span class="label">Номер ТС</span><div class="value">${d.vehicle}</div>
    <span class="label">Дата и время поездки</span><div class="value">${d.qrDate}</div>
    <span class="label">Стоимость</span><div class="value">${d.price}.0 ₽</div>
    <div class="qr">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent('https://qr.bilet.nspk.ru/payment?paytagid=' + d.serial + '&type=' + d.typeEng + '&route=' + d.route + '&ts=' + d.vehicle + '&date=' + d.qrDate + '&price=' + d.price)}" alt="QR">
    </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.write(receiptHTML);
    w.document.close();
}

// ===== Навешиваем обработчики после загрузки =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Страница загружена ===');
    console.log('Кнопка «Продолжить»:', document.getElementById('continueBtn'));
    console.log('Кнопка «Скачать»:', document.getElementById('downloadBtn'));

    const continueBtn = document.getElementById('continueBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            console.log('Клик по кнопке «Продолжить»');
            e.preventDefault();
            showTicket();
        });
    } else {
        console.error('Кнопка continueBtn НЕ найдена!');
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            console.log('Клик по кнопке «Скачать»');
            e.preventDefault();
            downloadTicket();
        });
    }
});
