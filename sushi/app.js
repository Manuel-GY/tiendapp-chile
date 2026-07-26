// Sanitizar HTML para prevenir XSS
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Datos Ficticios Premium
let products = [
    {
        id: 1,
        title: "Kibo Signature Roll",
        price: "$14.990",
        desc: "Nuestra creación maestra. Salmón noruego gravlax, palta hass y texturas de caviar Oscietra con toques ahumados, presentado sobre piedra laja.",
        image: "premium_roll.webp",
        stock: 15
    },
    {
        id: 2,
        title: "Omakase Nigiri Experience",
        price: "$28.500",
        desc: "Auténtica experiencia japonesa. Selección del Itamae con cortes madurados de salmón, bluefin tuna y ebi, sazonados al estilo edomae.",
        image: "premium_nigiri.webp",
        stock: 8
    }
];

const mockOrders = [
    {
        id: "ORD-708X",
        time: "Hace 2 min",
        items: [
            { name: "1x Kibo Signature Roll", subtotal: "$14.990" },
            { name: "1x Agua Panna", subtotal: "$3.500" }
        ],
        total: "$18.490",
        status: 1 // 1: Recibido, 2: Preparacion, 3: Camino
    },
    {
        id: "ORD-707A",
        time: "Hace 15 min",
        items: [
            { name: "2x Omakase Nigiri Experience", subtotal: "$57.000" },
            { name: "1x Sake Junmai Daiginjo", subtotal: "$25.000" }
        ],
        total: "$82.000",
        status: 2
    }
];

// Estado
let cartCount = 0;
let globalChartInstance = null; // Para destruir la gráfica anterior si existe

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderViews();
    setupNavigation();
    
    // Iniciar en la vista de catálogo
    switchView('catalog');
});

// Renderizar Vistas
function renderViews() {
    const main = document.getElementById('main-content');
    
    main.innerHTML = `
        <!-- VISTA CATÁLOGO -->
        <div id="catalog" class="view">
            <div class="hero">
                <h1>El Arte del Omakase</h1>
                <p>Experiencia gastronómica de alta gama, directo a tu mesa.</p>
            </div>
            
            <h2 class="section-title">Nuestra Selección</h2>
            
            <div id="product-list">
                ${products.map(p => `
                    <div class="product-card">
                        <div class="img-overlay">
                            <img src="${p.image}" alt="${p.title}" class="product-image">
                            <span style="position:absolute; top:15px; right:15px; background:var(--primary); color:#000; padding:5px 12px; border-radius:20px; font-weight:700; font-size:0.85rem;">Stock: ${p.stock}</span>
                        </div>
                        <div class="product-info">
                            <div class="product-header">
                                <h3 class="product-title">${sanitize(p.title)}</h3>
                                <span class="product-price">${sanitize(p.price)}</span>
                            </div>
                            <p class="product-desc">${sanitize(p.desc)}</p>
                            <button class="btn-add" onclick="addToCart()">
                                Agregar a la Reserva
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- VISTA COCINA (DASHBOARD) -->
        <div id="dashboard" class="view">
            <h1 class="section-title">Cocina // <span style="color:#FFF;font-family:'Inter'">Órdenes Activas</span></h1>
            <div id="orders-list">
                ${mockOrders.map((o, index) => {
                    let statusBtn = '';
                    if(o.status === 1) {
                        statusBtn = `<button class="btn-dispatch" onclick="advanceOrder('${o.id}')">Avanzar a Preparación <i class="fa-solid fa-fire"></i></button>`;
                    } else if(o.status === 2) {
                        statusBtn = `<button class="btn-dispatch" onclick="advanceOrder('${o.id}')" style="color:var(--warning); border-color:var(--warning);">Avanzar a En Camino <i class="fa-solid fa-motorcycle"></i></button>`;
                    } else {
                        statusBtn = `<button class="btn-dispatch" disabled style="opacity:0.5;">En Camino <i class="fa-solid fa-check"></i></button>`;
                    }
                    
                    let statusLabel = o.status === 1 ? "Recibido" : (o.status === 2 ? "En Preparación" : "En Camino");

                    return `
                    <div class="order-card" id="order-${index}">
                        <div class="order-header">
                            <span class="order-id">${o.id}</span>
                            <span class="order-time"><i class="fa-regular fa-clock"></i> ${o.time} - <strong>${statusLabel}</strong></span>
                        </div>
                        <div class="order-items">
                            ${o.items.map(i => `
                                <div class="order-item">
                                    <span>${i.name}</span>
                                    <span>${i.subtotal}</span>
                                </div>
                            `).join('')}
                            <hr style="border:0; border-top: 1px solid rgba(255,255,255,0.05); margin: 15px 0;">
                            <div class="order-item" style="font-weight: 600; color: var(--primary);">
                                <span>Total</span>
                                <span>${o.total}</span>
                            </div>
                        </div>
                        ${statusBtn}
                    </div>
                `}).join('')}
            </div>
        </div>

        <!-- VISTA PROMOS -->
        <div id="promos" class="view">
            <div class="promo-container">
                <i class="fa-solid fa-crown promo-icon"></i>
                <h2 class="promo-title">Marketing Black Card</h2>
                <textarea id="promo-message" class="promo-textarea" placeholder="Escribe el mensaje de WhatsApp a enviar masivamente...">¡Atención VIP! 🍣 Ha llegado fresco el nuevo Atún Bluefin directo desde Tsukiji Japón a nuestra barra de Omakase. Reserva hoy y obtén un 20% descuento mostrando este mensaje exclusivo.</textarea>
                <button class="btn-whatsapp" onclick="sendPromos()">
                    <i class="fa-brands fa-whatsapp"></i> Difundir Mensaje
                </button>
            </div>
        </div>

        <!-- VISTA FINANZAS SUPER-ADMIN -->
        <div id="finances" class="view">
            <h1 class="section-title">Reportes // <span style="color:#FFF;font-family:'Inter'">Panel Ejecutivo</span></h1>
            
            <div class="finances-grid">
                <div class="finance-card" onclick="showDailyDetails()">
                    <div class="finance-label">Ventas de Hoy</div>
                    <div class="finance-value">$ 450.000</div>
                    <div style="color:var(--success); font-size: 0.9rem;"><i class="fa-solid fa-arrow-trend-up"></i> +12% vs ayer</div>
                </div>
                <div class="finance-card" onclick="showMonthlyDetails()">
                    <div class="finance-label">Ventas del Mes</div>
                    <div class="finance-value">$ 12.500.000</div>
                    <div style="color:var(--success); font-size: 0.9rem;"><i class="fa-solid fa-arrow-trend-up"></i> Meta superada</div>
                </div>
                <div class="finance-card" onclick="alert('Demo: Ticket promedio no tiene vista detallada')">
                    <div class="finance-label">Ticket Promedio</div>
                    <div class="finance-value">$ 45.990</div>
                    <div style="color:var(--text-muted); font-size: 0.9rem;">Por reserva online</div>
                </div>
            </div>
        </div>

        <!-- VISTA DETALLE DIARIO -->
        <div id="daily-details" class="view">
            <div class="admin-header">
                <h1 class="section-title">Detalle <span style="color:#FFF;font-family:'Inter'">// Ventas de Hoy</span></h1>
                <button class="btn-add-product" onclick="switchView('finances')"><i class="fa-solid fa-arrow-left"></i> Volver a Finanzas</button>
            </div>
            <div class="table-container" style="padding: 20px;">
                <h3 style="color: var(--primary); font-family: 'Cinzel', serif; margin-bottom: 20px;">Transacciones del día</h3>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>N° Orden</th>
                            <th>Medio de Pago</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>14:30</td><td>#ORD-708X</td><td>Web (MercadoPago)</td><td>$ 18.490</td></tr>
                        <tr><td>15:15</td><td>#ORD-4412</td><td>Presencial (Tbank)</td><td>$ 82.000</td></tr>
                        <tr><td>15:45</td><td>#ORD-9021</td><td>UberEats</td><td>$ 25.500</td></tr>
                        <tr><td>18:20</td><td>#ORD-1102</td><td>Web (MercadoPago)</td><td>$ 14.990</td></tr>
                        <tr><td>19:05</td><td>#ORD-6623</td><td>Presencial (Efectivo)</td><td>$ 45.000</td></tr>
                        <tr><td>20:30</td><td>#ORD-3310</td><td>Presencial (Tbank)</td><td>$ 264.020</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- VISTA DETALLE MENSUAL (CON GRÁFICO) -->
        <div id="monthly-details" class="view">
            <div class="admin-header">
                <h1 class="section-title">Desglose <span style="color:#FFF;font-family:'Inter'">// Ventas del Mes</span></h1>
                <button class="btn-add-product" onclick="switchView('finances')"><i class="fa-solid fa-arrow-left"></i> Volver a Finanzas</button>
            </div>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: 10px;">Visualización de ingresos en base diaria de los últimos 30 días.</p>
            <div class="chart-container">
                <canvas id="monthlyChart"></canvas>
            </div>
        </div>

        <!-- VISTA ADMIN / STAFF -->
        <div id="admin" class="view">
            <div class="admin-header">
                <h1 class="section-title">Staff // <span style="color:#FFF;font-family:'Inter'">Gestión de Inventario</span></h1>
                <button class="btn-add-product" onclick="alert('Demo: Función de agregar producto deshabilitada')">+ Nuevo Producto</button>
            </div>
            
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Platillo</th>
                            <th>Precio</th>
                            <th>Stock Disponible</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="admin-table-body">
                        ${generateAdminRows()}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- VISTA ÉXITO (CONFIRMACIÓN) -->
        <div id="success" class="view" style="text-align: center; padding-top: 50px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--success); margin-bottom: 20px;"></i>
            <h1 class="section-title" style="justify-content: center;">¡Reserva Confirmada!</h1>
            <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 30px;">Tu pedido ha sido procesado exitosamente y ha sido enviado a nuestra cocina.</p>
            <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 15px; border: 1px solid var(--primary); display: inline-block; margin-bottom: 40px;">
                <p style="margin-bottom: 5px; color: var(--text-muted);">Número de Orden:</p>
                <h2 id="order-id-display" style="color: var(--primary); font-family: 'Cinzel', serif; letter-spacing: 2px;">#ORD-XXXX</h2>
            </div>
            <br>
            <button class="btn-add" style="max-width: 300px; margin: 0 auto; background: var(--primary); color: #000;" onclick="switchView('catalog')">
                Volver al Menú
            </button>
        </div>

        <!-- VISTA SEGUIMIENTO (TRACKING) -->
        <div id="tracking" class="view">
            <h1 class="section-title">Rastreo de Pedido</h1>
            <p style="text-align:center; color:var(--text-muted); margin-bottom: 20px;">Ingresa tu número de orden proporcionado al momento del pago para conocer el estado actual de tu comida.</p>
            
            <div class="tracking-input-group">
                <input type="text" id="track-id-input" class="tracking-input" placeholder="#ORD-XXXX" onkeyup="if(event.key === 'Enter') trackOrder()">
                <button class="btn-add-product" onclick="trackOrder()"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
            </div>

            <div id="tracking-result" style="display: none; background: var(--bg-card); padding: 30px 20px; border-radius: 20px; border: 1px solid var(--glass-border);">
                <h3 style="text-align:center; margin-bottom: 20px; font-family:'Cinzel', serif;" id="tracking-title">Orden #ORD-0000</h3>
                <div class="timeline">
                    <div class="timeline-step" id="step-1">
                        <div class="timeline-point"><i class="fa-solid fa-receipt"></i></div>
                        <div class="timeline-label">Recibido</div>
                    </div>
                    <div class="timeline-step" id="step-2">
                        <div class="timeline-point"><i class="fa-solid fa-fire"></i></div>
                        <div class="timeline-label">En Preparación</div>
                    </div>
                    <div class="timeline-step" id="step-3">
                        <div class="timeline-point"><i class="fa-solid fa-motorcycle"></i></div>
                        <div class="timeline-label">En Camino</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Genera las filas de la tabla de admin
function generateAdminRows() {
    return products.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>
                <strong>${p.title}</strong>
            </td>
            <td>
                <input type="text" id="price-${p.id}" class="admin-input" value="${p.price}">
            </td>
            <td>
                <input type="number" id="stock-${p.id}" class="admin-input" value="${p.stock}" min="0">
            </td>
            <td>
                <button class="btn-icon" onclick="saveAdminChanges(${p.id})" title="Guardar Cambios">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            if(!viewName) return; // Evitar ocultar vistas si es un botón de acción como Login/Logout
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            switchView(viewName);
            
            const floatBtn = document.getElementById('floating-pay-btn');
            if (viewName !== 'catalog' || cartCount === 0) {
                floatBtn.classList.remove('visible');
            } else {
                floatBtn.classList.add('visible');
            }
        });
    });
}

function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const targetView = document.getElementById(viewName);
    if(targetView) {
        targetView.classList.add('active');
    }
}

// Acciones Interactivas
function addToCart() {
    cartCount++;
    const countEl = document.getElementById('cart-count');
    const pillEl = document.getElementById('cart-pill');
    const floatBtn = document.getElementById('floating-pay-btn');
    
    countEl.innerText = cartCount;
    
    pillEl.classList.remove('bump');
    void pillEl.offsetWidth; 
    pillEl.classList.add('bump');
    
    if (cartCount > 0 && document.getElementById('catalog').classList.contains('active')) {
        floatBtn.classList.add('visible');
    }
}

let selectedMethod = null;

function openPaymentModal() {
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function selectPayment(method) {
    selectedMethod = method;
    document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    const btn = document.getElementById('btn-confirm-pay');
    btn.classList.remove('btn-confirm-disabled');
    btn.classList.add('btn-confirm-active');
    btn.disabled = false;
    btn.innerText = "Autorizar Reserva";
}

function processPayment() {
    const btn = document.getElementById('btn-confirm-pay');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Autorizando...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Autorizado!';
        btn.style.background = 'var(--success)';
        btn.style.color = 'white';
        
        setTimeout(() => {
            closePaymentModal();
            
            // Generar número de orden aleatorio
            const orderNum = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('order-id-display').innerText = '#' + orderNum;
            
            // Agregar al Cocina Mock
            mockOrders.unshift({
                id: orderNum,
                time: "Hace 1 min",
                items: [
                    { name: cartCount + "x Ítems Varios", subtotal: "$..." }
                ],
                total: "Pagado por Web",
                status: 1
            });
            renderViews(); // Re-renderizar cocina
            
            // Reset state
            cartCount = 0;
            document.getElementById('cart-count').innerText = 0;
            document.getElementById('floating-pay-btn').classList.remove('visible');
            
            btn.style.background = ''; 
            btn.innerHTML = 'Selecciona un método';
            btn.classList.add('btn-confirm-disabled');
            btn.classList.remove('btn-confirm-active');
            btn.disabled = true;
            document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
            selectedMethod = null;
            
            // Navigate to success view instead of dashboard
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            switchView('success');
            
        }, 1500);
    }, 2500);
}

// LÓGICA DE LOGIN PARA STAFF
function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    // Dar auto-focus al input luego de que el modal se vuelva visible
    setTimeout(() => {
        document.getElementById('staff-pin').focus();
    }, 100);
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

function attemptLogin() {
    const pin = document.getElementById('staff-pin').value;
    
    // Superusuario
    if(pin === '9999' || pin.toLowerCase() === 'superadmin') {
        document.body.classList.add('logged-in');
        document.body.classList.add('super-logged-in'); // Desbloquea finanzas
        closeLoginModal();
        document.getElementById('staff-pin').value = '';
        
        // Redirigir a Finanzas para destacar el panel nuevo
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const financeBtn = document.querySelector('.nav-item[data-view="finances"]');
        if(financeBtn) financeBtn.classList.add('active');
        switchView('finances');
        
    } 
    // Staff Normal
    else if(pin === '1234' || pin.toLowerCase() === 'admin') {
        document.body.classList.add('logged-in');
        closeLoginModal();
        document.getElementById('staff-pin').value = '';
        
        // Redirigir a la cocina
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const dashboardBtn = document.querySelector('.nav-item[data-view="dashboard"]');
        if(dashboardBtn) dashboardBtn.classList.add('active');
        switchView('dashboard');
        
    } else {
        alert('PIN Incorrecto. Intenta de nuevo.');
    }
}

function logoutStaff() {
    document.body.classList.remove('logged-in');
    document.body.classList.remove('super-logged-in');
    
    // Si estaba viendo una vista oculta, volver al catálogo
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const catalogBtn = document.querySelector('.nav-item[data-view="catalog"]');
    if(catalogBtn) catalogBtn.classList.add('active');
    
    switchView('catalog');
    showToast('Sesión cerrada correctamente. Volviendo a vista de Cliente.');
}

function dispatchOrder(index) {
    const btn = document.getElementById(`btn-dispatch-${index}`);
    const card = document.getElementById(`order-${index}`);
    
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Orden Servida';
    btn.disabled = true;
    
    setTimeout(() => {
        card.style.opacity = '0.3';
    }, 500);
}

function advanceOrder(id) {
    const order = mockOrders.find(o => o.id === id);
    if(order && order.status < 3) {
        order.status++;
        
        let msg = order.status === 2 
            ? `Notificando a cliente por WhatsApp: Su pedido ${id} está En Preparación 👨‍🍳`
            : `Notificando a cliente por WhatsApp: Su pedido ${id} va En Camino 🏍️`;
            
        showToast(msg);
        renderViews();
        switchView('dashboard'); // Volver explícitamente a la cocina
    }
}

function trackOrder() {
    const input = document.getElementById('track-id-input').value.trim().toUpperCase();
    const resultDiv = document.getElementById('tracking-result');
    
    if(!input) return;
    
    // Add # if missing
    const searchId = input.startsWith('#') ? input : '#' + input;
    
    const order = mockOrders.find(o => '#' + o.id === searchId || o.id === input);
    
    if(order) {
        resultDiv.style.display = 'block';
        document.getElementById('tracking-title').innerText = `Orden ${order.id}`;
        
        // Reset classes
        document.getElementById('step-1').className = 'timeline-step';
        document.getElementById('step-2').className = 'timeline-step';
        document.getElementById('step-3').className = 'timeline-step';
        
        // Apply status
        if(order.status >= 1) document.getElementById('step-1').className = 'timeline-step completed';
        if(order.status >= 2) document.getElementById('step-2').className = 'timeline-step completed';
        if(order.status >= 3) document.getElementById('step-3').className = 'timeline-step completed';
        
        document.getElementById('step-' + order.status).classList.add('active');
        
    } else {
        alert("Pedido no encontrado. Asegúrate de escribir el número correcto, por ejemplo: #ORD-1234");
        resultDiv.style.display = 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fa-brands fa-whatsapp" style="font-size:1.5rem;"></i> ${sanitize(message)}`;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

function sendPromos() {
    const btn = document.querySelector('.btn-whatsapp');
    const msg = document.getElementById('promo-message').value;
    
    if(!msg.trim()) {
        alert("Escribe un mensaje antes de enviar.");
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Difundiendo...';
    btn.style.opacity = '0.7';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Difusión enviada con éxito';
        btn.style.background = '#25D366';
        btn.style.color = 'white';
        btn.style.opacity = '1';
        
        showToast("Se han enviado 142 mensajes de WhatsApp con texto: " + msg.substring(0,25) + "...");
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 4000);
    }, 2000);
}

function saveAdminChanges(id) {
    const priceInput = document.getElementById(`price-${id}`).value;
    const stockInput = parseInt(document.getElementById(`stock-${id}`).value);
    
    const index = products.findIndex(p => p.id === id);
    if(index !== -1) {
        products[index].price = priceInput;
        products[index].stock = stockInput;
        
        // Re-render views so changes are reflected in catalog
        renderViews();
        setupNavigation();
        switchView('admin'); // Volver a la misma vista después de renderizar
        
        // Mantener la clase activa en admin
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('.nav-item[data-view="admin"]').classList.add('active');
        
        alert(`¡Stock y precio actualizados para: ${products[index].title}! Las vistas se han sincronizado con el nuevo stock.`);
    }
}

// LOGICA DE GRAFICOS Y DETALLES EMPRESARIALES
function showDailyDetails() {
    switchView('daily-details');
}

function showMonthlyDetails() {
    switchView('monthly-details');
    
    setTimeout(() => {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        if (globalChartInstance) {
            globalChartInstance.destroy();
        }
        
        // Generar labels (días 1 al 30) y datos mock de ventas interactivas
        const days = Array.from({length: 30}, (_, i) => `Día ${i+1}`);
        const dataSales = days.map(() => Math.floor(Math.random() * (600 - 200 + 1) + 200) * 1000); // Entre 200k y 600k
        
        globalChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Ventas Diarias ($ CLP)',
                    data: dataSales,
                    borderColor: '#D4AF37', // var(--primary) dorado
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FFF',
                    pointBorderColor: '#D4AF37',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }, 100);
}
