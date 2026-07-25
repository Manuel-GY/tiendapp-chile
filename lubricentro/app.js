let currentServicePrice = 45000;
let oilExtra = 0;
let selectedBrand = 'Toyota';
let selectedModel = 'Corolla';

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (viewId === 'view-dashboard' && item.innerText.includes('Inicio')) item.classList.add('active');
        if (viewId === 'view-brands' && item.innerText.includes('Agenda')) item.classList.add('active');
    });
}

function selectBrand(brand, model) {
    selectedBrand = brand;
    selectedModel = model;
    document.getElementById('selected-car').innerText = `${brand} ${model.charAt(0).toUpperCase() + model.slice(1)}`;
    switchView('view-booking');
}

function selectService(name, price) {
    currentServicePrice = price;
    updateTotal();
    switchView('view-brands');
}

function setOil(name, extra) {
    oilExtra = extra;
    document.querySelectorAll('.oil-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.innerText.includes(name)) opt.classList.add('active');
    });
    updateTotal();
}

function updateTotal() {
    const total = currentServicePrice + oilExtra;
    document.getElementById('total-price').innerText = `$${total.toLocaleString('es-CL')}`;
}

function confirmBooking() {
    document.getElementById('overlay-success').classList.add('active');
}

// Date selection
document.querySelectorAll('.date-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
    });
});
