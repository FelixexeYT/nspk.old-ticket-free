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

// ===== Таймеры =====
let timerIntervalOld = null;
let timerIntervalNew = null;

function startTimerOld(startTimestamp) {
    if (timerIntervalOld) clearInterval(timerIntervalOld);
    function tick() {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;
        const str = h > 0
            ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        const el = document.getElementById('timerOld');
        if (el) el.textContent = str;
    }
    tick();
    timerIntervalOld = setInterval(tick, 1000);
}

function startTimerNew(startTimestamp) {
    if (timerIntervalNew) clearInterval(timerIntervalNew);
    function tick() {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;
        const str = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        const el = document.getElementById('timerNew');
        if (el) el.textContent = str;
    }
    tick();
    timerIntervalNew = setInterval(tick, 1000);
}

// ===== Переключение экранов =====
function switchView(view) {
    ['inputSection', 'oldTicketSection', 'newTicketSection', 'gisTicketSection', 'receiptSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty('display', 'none', 'important');
    });

    let showId = null;
    if (view === 'form') showId = 'inputSection';
    else if (view === 'oldsbp') showId = 'oldTicketSection';
    else if (view === 'sbp') showId = 'newTicketSection';
    else if (view === '2gis') showId = 'gisTicketSection';
    else if (view === 'receipt') showId = 'receiptSection';

    if (showId) {
        const el = document.getElementById(showId);
        if (el) {
            // У 2ГИС свой position: fixed, поэтому display: block
            el.style.setProperty('display', 'block', 'important');
        }
    }

    window.scrollTo(0, 0);
}
function goTo(view) {
    switchView(view);
    history.pushState({ view: view }, '', location.pathname + '#' + view);
}

// ===== Отрисовка «Старый СБП» =====
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

    startTimerOld(data.startTime);
}

// ===== Отрисовка «СБП» (новый) =====
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

    startTimerNew(data.startTime);
}

// ===== Отрисовка чека =====
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
        } else if (ticketType === '2gis') {
            renderGisTicket(data);
            goTo('2gis');
        } else {
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
});
// ===== Выбор типа билета через кнопки-иконки =====
document.addEventListener('DOMContentLoaded', function() {
    const btns = document.querySelectorAll('.ticket-type-btn');
    const hiddenInput = document.getElementById('ticketType');
    const label = document.getElementById('ticketTypeLabel');

    if (!btns.length || !hiddenInput) return;

    const names = {
        oldsbp: 'Старый СБП',
        sbp: 'СБП',
        '2gis': '2ГИС'
    };

    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.dataset.value;

            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            hiddenInput.value = value;

            if (label) label.textContent = names[value] || value;
        });
    });
});
// ============================================
// 2ГИС — ЛОГИКА
// ============================================

// Генерация уникальной строки в base64
function b64(str) {
    try {
        return btoa(unescape(encodeURIComponent(String(str))));
    } catch (e) {
        return '';
    }
}

// Случайный hex
function randHex(len) {
    let s = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
    return s;
}

// UUID v4-подобный
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Показать экран 2ГИС
function renderGisTicket(data) {
    // Иконка транспорта
    let icon = 'Bus.svg';
    if (data.type === 'Троллейбус') icon = 'trolleyBus.svg';
    // Трамвай пока не выбирается в форме, но пусть будет
    if (data.type === 'Трамвай') icon = 'TramV.svg';

    const iconEl = document.getElementById('gisTransportIcon');
    if (iconEl) iconEl.src = icon;

    // Номер маршрута
    document.getElementById('gisRouteNumber').textContent = data.route;

    // Номер ТС (в зелёной плашке) — берём из формы
    document.getElementById('gisVehicleNum').textContent = data.vehicle;

    // Гос. номер — пусть пока будет заглушка (потом заменим на актуальный)
    document.getElementById('gisGosNum').textContent = 'у — — вх | — —';

    // Дата и цена
    const now = new Date();
    const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    document.getElementById('gisDateTime').textContent = dateStr;

    const priceStr = data.price + ' ₽';
    document.getElementById('gisPrice').textContent = priceStr;
    document.getElementById('gisTotalSum').textContent = priceStr;
    document.getElementById('gisTicketHeader').textContent = 'Билет №1 · ' + priceStr;

    // Генерируем ID для QR (i — ticket id, o — order id, и т.д.)
    const ticketId = uuid();
    const orderId = uuid();
    const ticketNumShort = randHex(8);
    const orderNumShort = randHex(8);

    document.getElementById('gisTicketNum').textContent = ticketNumShort;
    document.getElementById('gisOrderNum').textContent = orderNumShort;

    // Собираем строку параметров для QR (как у 2ГИС)
    const params = [
        'i=' + b64(ticketId + ticketNumShort),
        'o=' + b64(orderId),
        'c=' + b64(Date.now()),
        'n=' + b64(Date.now()),
        'p=' + b64(Number(data.price) * 100),
        'op=' + b64(Number(data.price) * 100),
        'oc=' + b64(1),
        'vi=' + b64('0x' + randHex(12)),
        'ri=' + b64('0x' + randHex(12)),
        'fsi=' + b64('0x' + randHex(12)),
        's=' + b64('paid'),
        'srv=' + b64('<nil>'),
        'obj=' + b64('<nil>'),
        'vl=' + b64('С' + data.vehicle + 'ХХ 55'),
        'vb=' + b64(data.vehicle),
        'rn=' + b64(data.route),
        'fsn=' + b64('Академия транспорта'),
        'sgn=' + b64(randHex(80))
    ].join('&');

    // Генерируем QR: цвет 0b3045, размер большой, ecc=H (высокий уровень коррекции)
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=H&margin=1&color=0b3045&bgcolor=ffffff&data=' + encodeURIComponent(params);
    document.getElementById('gisQrCode').src = qrUrl;
}

// Открыть/закрыть модалку "Детали"
function openGisModal() {
    const m = document.getElementById('gisDetailsModal');
    if (m) m.style.display = 'flex';
}
function closeGisModal() {
    const m = document.getElementById('gisDetailsModal');
    if (m) m.style.display = 'none';
}

// Обработчики для 2ГИС (добавляем к существующему DOMContentLoaded через отдельный слушатель)
document.addEventListener('DOMContentLoaded', function() {
    const detailsBtn = document.getElementById('gisDetailsBtn');
    const modalClose = document.getElementById('gisModalClose');
    const modalBackdrop = document.getElementById('gisModalBackdrop');

    if (detailsBtn) detailsBtn.addEventListener('click', openGisModal);
    if (modalClose) modalClose.addEventListener('click', closeGisModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeGisModal);
});
