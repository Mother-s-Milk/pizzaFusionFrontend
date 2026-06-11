//Script de estado abierto/cerrado
(function () {
    const now = new Date();
    const day = now.getDay();   // 0=Dom, 1=Lun ... 6=Sáb
    const h = now.getHours() + now.getMinutes() / 60;

    function isOpen() {
        if (day >= 1 && day <= 6) {
            if (h >= 11 && h < 15) return true;   // mediodía Lun-Sáb
            if (h >= 20 || h < 2) return true;   // noche Lun-Sáb
        }
        if (day === 0) return h >= 20 || h < 2;    // noche Dom
        return false;
    }

    function todayRowIndex() {
        if (day === 0) return 2;  // domingo
        if (h >= 11 && h < 15) return 0;  // turno mediodía
        return 1;                              // turno noche (default)
    }

    const open = isOpen();
    const status = document.getElementById('contact-status');
    const txt = document.getElementById('contact-status-txt');

    if (status && txt) {
        status.classList.add(open ? 'contact-status--open' : 'contact-status--closed');
        txt.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
    }

    const row = document.getElementById('contact-hr-' + todayRowIndex());
    if (row) row.classList.add('contact-hours-row--today');
})();