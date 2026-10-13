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

// ===== Таймеры (для двух билетов отдельно) =====
let timerIntervalOld = null;
let timerIntervalNew = null;

function startTimer(elementId, startTimestamp, withHours, intervalRef) {
    if (intervalRef.value) clearInterval(intervalRef.value);

    function tick() {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;

        let str;
        if (withHours) {
            str = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        } else {
            str = h > 0
                ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
                : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        const el = document.getElementById(elementId);
        if (el) el.textContent = str;
    }

    tick();
    intervalRef.value = setInterval(tick, 1000);
}

// ===== Переключение экранов =====
function switchView(view) {
    ['inputSection', 'oldTicketSection', 'newTicketSection', 'receiptSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (view === 'form') document.getElementById('inputSection').style.display = 'block';
    else if (view === 'oldsbp') document.getElementById('oldTicketSection').style.display = 'block';
    else if (view === 'sbp') document.getElementById('newTicketSection').style.display = 'block';
    else if (view === 'receipt') document.getElementById('receiptSection').style.display = 'block';

    window.scrollTo(0, 0);
}

function goTo(view) {
    switchView(view);
    history.pushState({ view: view }, '', location.pathname + '#' + view);
}

// ===== Отрисовка билета «Старый СБП» =====
function renderOldTicket(data) {
    document.getElementById('displayTypeOld').textContent = data.type;
    document.getElementById('displayBusNumberOld').textContent = data.route;
    document.getElementById('displayVehicleNumberOld').textContent = data.vehicle;
    document.getElementById('displayPriceOld').textContent = data.price;
    document.getElementById('currentDateOld').textContent = data.displayDate;
    document.getElementById('displaySerialOld').textContent = data.serial;
    document.getElementById('displayTicketNumberOld').textContent = data.ticketNumber;

    document.getElementById('qrCodeOld').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(data.qrText)}`;

    startTimer('timerOld', data.startTime, false, { get value() { return timerIntervalOld; }, set value(v) { timerIntervalOld = v; } });
}

// ===== Отрисовка билета «СБП» (новый) =====
function renderNewTicket(data) {
    document.getElementById('displayTypeNew').textContent = data.type;
    document.getElementById('displayBusNumberNew').textContent = data.route;
    document.getElementById('displayVehicleNumberNew').textContent = data.vehicle;
    document.getElementById('displayPriceNew').textContent = data.price;
    document.getElementById('currentDateNew').textContent = data.displayDate;
    document.getElementById('displaySerialNew').textContent = data.serial;
    document.getElementById('displayTicketNumberNew').textContent = data.ticketNumber;

    document.getElementById('qrCodeNew').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(data.qrText)}`;

    startTimer('timerNew', data.startTime, true, { get value() { return timerIntervalNew; }, set value(v) { timerIntervalNew = v; } });
}

// ===== Отрисовка чека (зависит от типа) =====
function renderReceipt(data) {
    document.getElementById('receiptDate').textContent = data.qrDate.replace('A', ' ');
    document.getElementById('receiptSerial').textContent = data.serial;
    document.getElementById('receiptNumber').textContent = data.ticketNumber;
    document.getElementById('receiptTransport').textContent = data.type;
    document.getElementById('receiptRoute').textContent = data.route;
    document.getElementById('receiptVehicle').textContent = data.vehicle;
    document.getElementById('receiptDateTime').textContent = data.qrDate.replace('A', ' ');
    document.getElementById('receiptPrice').textContent = data.price + '.0 руб.';

    if (data.ticketType === 'oldsbp') {
        document.getElementById('receiptType').textContent = 'Разовый билет QRPay';
        document.getElementById('receiptInn').textContent = '5507022628';
        document.getElementById('receiptCarrier').textContent = 'АО "Пассажирское предприятие № 8"';
    } else if (data.ticketType === 'sbp') {
        document.getElementById('receiptType').textContent = 'Разовый билет (QR) в Омске';
        document.getElementById('receiptInn').textContent = '5507301149';
        document.getElementById('receiptCarrier').textContent = 'АКЦИОНЕРНОЕ ОБЩЕСТВО "ПАССАЖИРСКОЕ ПРЕДПРИЯТИЕ № 8"';
    } else {
        document.getElementById('receiptType').textContent = 'Разовый билет';
        document.getElementById('receiptInn').textContent = '—';
        document.getElementById('receiptCarrier').textContent = '—';
    }

    document.getElementById('receiptQrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(data.qrText)}`;
}

// ===== Показ билета =====
function showTicket() {
    try {
        const type = document.getElementById('transportType').value || 'Автобус';
        const ticketType = document.getElementById('ticketType').value || 'oldsbp';
        const route = document.getElementById('routeNumber').value.trim() || '125';
        const vehicle = document.getElementById('vehicleNumber').value.trim() || '363';
        const price = document.getElementById('price').value.trim() || '40';

        const { displayDate, qrDate } = getDates();
        const serial = generateSerial();
        const ticketNumber = generateTicketNumber();

        const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
        const qrText = `https://qr.bilet.nspk.ru/payment?paytagid=${serial}&type=${typeEng}&route=${route}&ts=${vehicle}&date=${qrDate}&price=${price}`;

        const data = {
            type, ticketType, route, vehicle, price, qrDate, displayDate,
            serial, ticketNumber, typeEng, qrText,
            startTime: Date.now()
        };

        sessionStorage.setItem('ticketData', JSON.stringify(data));
        window._ticketData = data;

        renderReceipt(data);

        if (ticketType === 'oldsbp') {
            renderOldTicket(data);
            goTo('oldsbp');
        } else if (ticketType === 'sbp') {
            renderNewTicket(data);
            goTo('sbp');
        } else {
            // 2ГИС — пока не реализован, показываем старый
            renderOldTicket(data);
            goTo('oldsbp');
        }
    } catch (err) {
        console.error('ОШИБКА:', err);
        alert('Произошла ошибка: ' + err.message);
    }
}

// ===== Открыть чек =====
function openReceipt() {
    const d = window._ticketData;
    if (!d) {
        alert('Сначала создайте билет!');
        return;
    }
    goTo('receipt');
}

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const downloadBtnOld = document.getElementById('downloadBtnOld');
    const downloadBtnNew = document.getElementById('downloadBtnNew');
    const receiptBackBtn = document.getElementById('receiptBackBtn');

    if (continueBtn) continueBtn.addEventListener('click', e => { e.preventDefault(); showTicket(); });
    if (downloadBtnOld) downloadBtnOld.addEventListener('click', e => { e.preventDefault(); openReceipt(); });
    if (downloadBtnNew) downloadBtnNew.addEventListener('click', e => { e.preventDefault(); openReceipt(); });
    if (receiptBackBtn) receiptBackBtn.addEventListener('click', e => { e.preventDefault(); history.back(); });

    const hash = location.hash.replace('#', '');
    const savedData = sessionStorage.getItem('ticketData');

    if ((hash === 'oldsbp' || hash === 'sbp' || hash === 'receipt') && savedData) {
        try {
            const data = JSON.parse(savedData);
            window._ticketData = data;

            if (data.ticketType === 'oldsbp') renderOldTicket(data);
            else if (data.ticketType === 'sbp') renderNewTicket(data);

            renderReceipt(data);

            history.replaceState({ view: 'form' }, '', location.pathname + '#form');
            switchView(hash);
            history.pushState({ view: hash }, '', location.pathname + '#' + hash);
            return;
        } catch (e) {
            console.error('Ошибка:', e);
            sessionStorage.removeItem('ticketData');
        }
    }

    sessionStorage.removeItem('ticketData');
    window._ticketData = null;
    switchView('form');
    history.replaceState({ view: 'form' }, '', location.pathname);
});

// ===== Системная кнопка «Назад» =====
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.view) {
        switchView(e.state.view);
    } else {
        switchView('form');
    }
});// ===== Утилиты =====
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

// ===== Таймер =====
let timerInterval = null;

function startTimerFrom(startTimestamp) {
    if (timerInterval) clearInterval(timerInterval);

    function tick() {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;
        const str = h > 0
            ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        const el = document.getElementById('timer');
        if (el) el.textContent = str;
    }

    tick();
    timerInterval = setInterval(tick, 1000);
}

// ===== Переключение экранов =====
function switchView(view) {
    ['inputSection', 'ticketSection', 'receiptSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (view === 'form') {
        document.getElementById('inputSection').style.display = 'block';
    } else if (view === 'ticket') {
        document.getElementById('ticketSection').style.display = 'block';
    } else if (view === 'receipt') {
        document.getElementById('receiptSection').style.display = 'block';
    }

    window.scrollTo(0, 0);
}

function goTo(view) {
    switchView(view);
    history.pushState({ view: view }, '', location.pathname + '#' + view);
}

// ===== Отрисовка =====
function renderTicket(data) {
    document.getElementById('displayType').textContent = data.type;
    document.getElementById('displayBusNumber').textContent = data.route;
    document.getElementById('displayVehicleNumber').textContent = data.vehicle;
    document.getElementById('displayPrice').textContent = data.price;
    document.getElementById('currentDate').textContent = data.displayDate;
    document.getElementById('displaySerial').textContent = data.serial;
    document.getElementById('displayTicketNumber').textContent = data.ticketNumber;

    document.getElementById('qrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(data.qrText)}`;

    window._ticketData = data;
    startTimerFrom(data.startTime);
}

function renderReceipt(data) {
    document.getElementById('receiptDate').textContent = data.qrDate.replace('A', ' ');
    document.getElementById('receiptSerial').textContent = data.serial;
    document.getElementById('receiptNumber').textContent = data.ticketNumber;
    document.getElementById('receiptTransport').textContent = data.type;
    document.getElementById('receiptRoute').textContent = data.route;
    document.getElementById('receiptVehicle').textContent = data.vehicle;
    document.getElementById('receiptDateTime').textContent = data.qrDate.replace('A', ' ');
    document.getElementById('receiptPrice').textContent = data.price + '.0 ₽';

    document.getElementById('receiptQrCode').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&data=${encodeURIComponent(data.qrText)}`;
}

// ===== Показ билета =====
function showTicket() {
    try {
        const type = document.getElementById('transportType').value || 'Троллейбус';
        const route = document.getElementById('routeNumber').value.trim() || '7М';
        const vehicle = document.getElementById('vehicleNumber').value.trim() || '422';
        const price = document.getElementById('price').value.trim() || '40';

        const { displayDate, qrDate } = getDates();
        const serial = generateSerial();
        const ticketNumber = generateTicketNumber();

        const typeEng = type === 'Автобус' ? 'bus' : 'trolleybus';
        const qrText = `https://qr.bilet.nspk.ru/payment?paytagid=${serial}&type=${typeEng}&route=${route}&ts=${vehicle}&date=${qrDate}&price=${price}`;

        const data = {
            type, route, vehicle, price, qrDate, displayDate,
            serial, ticketNumber, typeEng, qrText,
            startTime: Date.now()
        };

        // sessionStorage вместо localStorage — данные живут только пока вкладка открыта
        sessionStorage.setItem('ticketData', JSON.stringify(data));

        renderTicket(data);
        renderReceipt(data);
        goTo('ticket');
    } catch (err) {
        console.error('ОШИБКА:', err);
        alert('Произошла ошибка: ' + err.message);
    }
}

// ===== Открыть чек =====
function openReceipt() {
    const d = window._ticketData;
    if (!d) {
        alert('Сначала создайте билет!');
        return;
    }
    goTo('receipt');
}

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const receiptBackBtn = document.getElementById('receiptBackBtn');

    if (continueBtn) continueBtn.addEventListener('click', e => { e.preventDefault(); showTicket(); });
    if (downloadBtn) downloadBtn.addEventListener('click', e => { e.preventDefault(); openReceipt(); });
    if (receiptBackBtn) receiptBackBtn.addEventListener('click', e => { e.preventDefault(); history.back(); });

    const hash = location.hash.replace('#', '');
    const savedData = sessionStorage.getItem('ticketData');

    // СЛУЧАЙ 1: URL с #ticket или #receipt И есть данные — восстанавливаем
    if ((hash === 'ticket' || hash === 'receipt') && savedData) {
        try {
            const data = JSON.parse(savedData);
            renderTicket(data);
            renderReceipt(data);

            // Правильная цепочка истории:
            // 1) текущую запись делаем "form" (без новой записи)
            // 2) показываем нужный экран
            // 3) добавляем новую запись для него
            history.replaceState({ view: 'form' }, '', location.pathname + '#form');
            switchView(hash);
            history.pushState({ view: hash }, '', location.pathname + '#' + hash);
            return;
        } catch (e) {
            console.error('Ошибка:', e);
            sessionStorage.removeItem('ticketData');
        }
    }

    // СЛУЧАЙ 2: обычный заход — показываем форму
    sessionStorage.removeItem('ticketData');
    window._ticketData = null;
    if (timerInterval) clearInterval(timerInterval);
    switchView('form');
    // Убираем хеш из URL, чтобы кнопка Назад уходила за пределы сайта корректно
    history.replaceState({ view: 'form' }, '', location.pathname);
});

// ===== Системная кнопка «Назад» (Android/iOS/Alt+Left) =====
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.view) {
        switchView(e.state.view);
    } else {
        switchView('form');
    }
});
