function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const services = [
    { id: 1, title: "Corte Clásico + Fade", price: "$12.000", desc: "Corte fade con navaja y perfilado experto", img: "barber_haircut.png" },
    { id: 2, title: "Ritual Barba VIP", price: "$8.000", desc: "Recorte de barba, toalla caliente y aceites esenciales", img: "barber_beard.png" }
];

let myAppointments = [];
let barberAgenda = [
    { time: "12:00", client: "Juan Pérez", service: "Ritual Barba VIP", status: "pending" }
];

let selectedService = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderViews();
    switchView('services');
});

function renderViews() {
    document.getElementById('main-content').innerHTML = `
        <div id="services" class="view">
            <h1 class="section-title">Elige tu Servicio</h1>
            ${services.map(s => `
                <div class="service-card">
                    <img src="${s.img}" class="service-img">
                    <div class="service-info">
                        <div class="service-header">
                            <span class="service-title">${s.title}</span>
                            <span class="service-price">${s.price}</span>
                        </div>
                        <p class="service-desc">${s.desc}</p>
                        <button class="btn-primary" onclick="openBookingModal('${s.title}')">Reservar Turno</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div id="appointments" class="view">
            <h1 class="section-title">Mis Citas</h1>
            <div id="client-appointments-list"></div>
        </div>

        <div id="barber-panel" class="view">
            <h1 class="section-title">Agenda Barbero</h1>
            <div id="barber-agenda-list"></div>
        </div>
    `;
    updateLists();
}

function updateLists() {
    const clList = document.getElementById('client-appointments-list');
    clList.innerHTML = myAppointments.length === 0 ? '<p style="color:var(--text-muted)">No tienes citas programadas.</p>' :
        myAppointments.map(a => `
            <div class="appointment-item">
                <div class="a-time"><i class="fa-regular fa-clock"></i> Jueves, ${sanitize(a.time)}</div>
                <div class="a-client">${sanitize(a.service)}</div>
                <div class="a-service">Estado: Confirmado</div>
            </div>
        `).join('');

    const bList = document.getElementById('barber-agenda-list');
    bList.innerHTML = barberAgenda.map((a, i) => `
        <div class="appointment-item" id="ba-${i}">
            <div class="a-time">${sanitize(a.time)}</div>
            <div class="a-client">Cliente: ${sanitize(a.client)}</div>
            <div class="a-service">Servicio: ${sanitize(a.service)}</div>
            <button class="btn-finish" onclick="finishAppt(${i})">Completar Cita</button>
        </div>
    `).join('');
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.getAttribute('data-view'));
            updateLists();
        });
    });
}
function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openBookingModal(srv) {
    selectedService = srv;
    selectedTime = null;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btn-confirm-book').classList.add('disabled');
    document.getElementById('btn-confirm-book').disabled = true;
    document.getElementById('btn-confirm-book').innerText = "Confirmar Reserva";
    document.getElementById('booking-modal').classList.add('active');
}
function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
}
function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    const btn = document.getElementById('btn-confirm-book');
    btn.classList.remove('disabled');
    btn.disabled = false;
}
function confirmBooking() {
    const btn = document.getElementById('btn-confirm-book');
    btn.innerText = "Procesando...";
    setTimeout(() => {
        myAppointments.push({ time: selectedTime, service: selectedService });
        barberAgenda.push({ time: selectedTime, client: "Usuario Demo", service: selectedService, status: "pending" });
        barberAgenda.sort((a,b) => a.time.localeCompare(b.time));
        
        btn.innerText = "¡Cita Confirmada!";
        setTimeout(() => {
            closeBookingModal();
            document.querySelector('.nav-item[data-view="appointments"]').click();
        }, 1000);
    }, 1000);
}

function finishAppt(index) {
    const el = document.getElementById(`ba-${index}`);
    el.style.opacity = '0.5';
    el.querySelector('.btn-finish').innerText = "Finalizada";
}
