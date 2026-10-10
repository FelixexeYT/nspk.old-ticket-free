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
function showView(view) {
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

// ===== Отрисовка билета =====
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

// ===== Отрисовка чека =====
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

// ===== Новый билет (сброс) =====
function newTicket() {
    if (confirm('Создать новый билет? Текущий будет удалён.')) {
        localStorage.removeItem('ticketData');
        localStorage.removeItem('currentView');
        window._ticketData = null;
        if (timerInterval) clearInterval(timerInterval);
        showView('form');
        // Очищаем поля формы
        document.getElementById('routeNumber').value = '';
        document.getElementById('vehicleNumber').value = '';
        document.getElementById('price').value = '';
    }
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

        localStorage.setItem('ticketData', JSON.stringify(data));
        localStorage.setItem('currentView', 'ticket');

        renderTicket(data);
        renderReceipt(data);
        showView('ticket');
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
    localStorage.setItem('currentView', 'receipt');
    showView('receipt');
}

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const receiptBackBtn = document.getElementById('receiptBackBtn');
    const newTicketBtn = document.getElementById('newTicketBtn');

    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showTicket();
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openReceipt();
        });
    }

    if (receiptBackBtn) {
        receiptBackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('currentView', 'ticket');
            showView('ticket');
        });
    }

    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', function(e) {
            e.preventDefault();
            newTicket();
        });
    }

    // Восстанавливаем состояние
    const savedData = localStorage.getItem('ticketData');
    const savedView = localStorage.getItem('currentView') || 'form';

    if (!savedData) {
        // Нет данных — показываем форму
        showView('form');
        return;
    }

    try {
        const data = JSON.parse(savedData);
        renderTicket(data);
        renderReceipt(data);

        // Показываем тот экран, который был
        if (savedView === 'receipt') showView('receipt');
        else if (savedView === 'ticket') showView('ticket');
        else showView('form');
    } catch (e) {
        console.error('Ошибка чтения данных:', e);
        localStorage.removeItem('ticketData');
        showView('form');
    }
});

// ===== Обработка «Назад» =====
window.addEventListener('popstate', function() {
    const savedData = localStorage.getItem('ticketData');
    const savedView = localStorage.getItem('currentView') || 'form';

    if (!savedData) {
        showView('form');
        return;
    }

    if (savedView === 'receipt') {
        showView('ticket');
        localStorage.setItem('currentView', 'ticket');
    } else {
        showView('form');
    }
});
