function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const catalog = [
    { id: 1, title: "Frutas de Estación", price: 3500, img: "almacen_fruits.png" },
    { id: 2, title: "Pack Snacks Tarde", price: 5400, img: "almacen_snacks.png" }
];

let cart = { 1: 0, 2: 0 };
let orders = [
    { id: "#PED-901", time: "Hace 10 min", items: ["1x Pack Snacks Tarde", "2x Bebida Cola"], total: 8400 }
];

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderViews();
    switchView('store');
    document.getElementById('cart-pill').addEventListener('click', openModal);
});

function renderViews() {
    document.getElementById('main-content').innerHTML = `
        <div id="store" class="view">
            <h1 class="section-title">Góndola Fresca</h1>
            <div class="products-grid">
                ${catalog.map(p => `
                    <div class="prod-card">
                        <img src="${p.img}" class="prod-img">
                        <div class="prod-title">${p.title}</div>
                        <div class="prod-price">$${p.price.toLocaleString('es-CL')}</div>
                        <div class="prod-actions">
                            <button class="btn-circle" onclick="updateCart(${p.id}, -1)">-</button>
                            <span class="prod-count" id="count-${p.id}">${cart[p.id]}</span>
                            <button class="btn-circle add" onclick="updateCart(${p.id}, 1)">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div id="cashier" class="view">
            <h1 class="section-title">Pedidos por Empacar</h1>
            <div id="orders-list"></div>
        </div>
    `;
    updateCashier();
}

function updateCart(id, change) {
    if(cart[id] + change >= 0) {
        cart[id] += change;
        document.getElementById(`count-${id}`).innerText = cart[id];
        
        // Update header pill
        const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
        const pill = document.getElementById('cart-pill');
        document.getElementById('cart-count').innerText = totalItems;
        pill.classList.remove('bump');
        void pill.offsetWidth;
        pill.classList.add('bump');
    }
}

function openModal() {
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    if(totalItems === 0) {
        alert("El carrito está vacío");
        return;
    }
    
    let html = '';
    let total = 0;
    catalog.forEach(p => {
        if(cart[p.id] > 0) {
            const subtotal = p.price * cart[p.id];
            total += subtotal;
            html += `<div class="cart-item"><span>${cart[p.id]}x ${p.title}</span><span>$${subtotal.toLocaleString('es-CL')}</span></div>`;
        }
    });
    html += `<div class="cart-total"><span>Total a Pagar</span><span>$${total.toLocaleString('es-CL')}</span></div>`;
    
    document.getElementById('cart-summary').innerHTML = html;
    document.getElementById('payment-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function processPayment() {
    const btn = document.getElementById('btn-pay');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Pedido Pagado';
        
        setTimeout(() => {
            // Generate order
            let items = [];
            let total = 0;
            catalog.forEach(p => {
                if(cart[p.id] > 0) {
                    items.push(`${cart[p.id]}x ${p.title}`);
                    total += p.price * cart[p.id];
                    cart[p.id] = 0; // reset
                    document.getElementById(`count-${p.id}`).innerText = 0;
                }
            });
            orders.unshift({ id: `#PED-${Math.floor(Math.random()*1000)+1000}`, time: "Recién", items, total });
            
            // Reset UI
            document.getElementById('cart-count').innerText = 0;
            closeModal();
            btn.innerHTML = 'Pagar Pedido';
            updateCashier();
            
            alert("¡Exito! El pedido fue enviado a la Caja para su Empaque.");
            document.querySelector('.nav-item[data-view="cashier"]').click();
        }, 1000);
    }, 1500);
}

function updateCashier() {
    document.getElementById('orders-list').innerHTML = orders.map(o => `
        <div class="order-card">
            <div class="order-id">${sanitize(o.id)} <span><i class="fa-regular fa-clock"></i> ${sanitize(o.time)}</span></div>
            <div class="order-list">${o.items.map(i => sanitize(i)).join('<br>')}</div>
            <div style="font-weight: 800; color: var(--primary); margin-top: 5px;">Total Pagado: $${o.total.toLocaleString('es-CL')}</div>
        </div>
    `).join('');
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.getAttribute('data-view'));
        });
    });
}
function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
