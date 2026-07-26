function openAgencyLogin() {
    document.getElementById('agency-login-modal').classList.add('active');
    document.getElementById('agency-pin').focus();
}

function closeAgencyModal() {
    document.getElementById('agency-login-modal').classList.remove('active');
}

function attemptAgencyLogin() {
    document.getElementById('agency-pin').value = '';
    alert('Autenticación requiere servidor. Acceso no disponible en cliente.');
    closeAgencyModal();
}

let tickets = [];
try { tickets = JSON.parse(localStorage.getItem('tiendapp_tickets')) || []; } catch(e) { tickets = []; }

function saveTickets() {
    localStorage.setItem('tiendapp_tickets', JSON.stringify(tickets));
}

function openSupportLogin() {
    document.getElementById('support-login-modal').classList.add('active');
    document.getElementById('support-password').focus();
}

function closeSupportModal() {
    document.getElementById('support-login-modal').classList.remove('active');
    document.getElementById('support-password').value = '';
}

function attemptSupportLogin() {
    document.getElementById('support-password').value = '';
    alert('Autenticación requiere servidor. Contacta por WhatsApp para soporte.');
    closeSupportModal();
}

function showSupportPortal() {
    document.getElementById('public-site').style.display = 'none';
    document.getElementById('agency-erp').style.display = 'none';
    document.getElementById('client-support-portal').style.display = 'block';
    window.scrollTo(0, 0);
    document.title = "Soporte Técnico | TiendApp Chile";
    const resultContainer = document.getElementById('consulta-resultado');
    if(resultContainer) resultContainer.innerHTML = '';
}

function logoutSupport() {
    document.getElementById('public-site').style.display = 'block';
    document.getElementById('client-support-portal').style.display = 'none';
    document.title = "TiendApp Chile - Soluciones Digitales";
    window.scrollTo(0, 0);
}

function sendSupportTicket() {
    const negocio = document.getElementById('ticket-negocio').value.trim();
    const tipo = document.getElementById('ticket-tipo').value;
    const detalle = document.getElementById('ticket-detalle').value.trim();
    if(!negocio || !detalle) {
        alert("Por favor, completa el nombre de tu negocio y el detalle de la solicitud.");
        return;
    }
    const currentDate = new Date();
    const newTicket = {
        id: Date.now(),
        fecha: currentDate.toLocaleDateString(),
        hora: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        negocio,
        tipo,
        detalle,
        estado: 'Pendiente',
        respuesta: ''
    };
    tickets.push(newTicket);
    saveTickets();
    const shortId = newTicket.id.toString().slice(-4);
    alert(`¡Ticket ingresado! Tu N° de Ticket es: ${shortId}. Por favor, anótalo porque será necesario para consultar su estado.`);
    document.getElementById('ticket-negocio').value = '';
    document.getElementById('ticket-detalle').value = '';
}

function consultarTicket() {
    const query = document.getElementById('consulta-ticket-id').value.trim();
    const container = document.getElementById('consulta-resultado');
    if(!query) {
        container.innerHTML = `<p style="color: #ef4444; padding: 10px;">Por favor ingresa un número de ticket válido.</p>`;
        return;
    }
    const t = tickets.find(x => x.id.toString().slice(-4) === query);
    if(!t) {
        container.innerHTML = `<p style="color: #ef4444; padding: 10px;">No se encontró ningún ticket con el número #${sanitize(query)}. Verifica que lo hayas escrito bien.</p>`;
        return;
    }
    let statusColor = t.estado === 'Pendiente' ? '#f59e0b' : '#10b981';
    container.innerHTML = `
        <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <strong>Ticket #${t.id.toString().slice(-4)} - ${t.tipo}</strong>
                <span style="color: ${statusColor}; font-weight: 600; font-size: 0.9rem;">${t.estado}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 10px;"><strong>Tu Solicitud:</strong> ${sanitize(t.detalle)}</p>
            ${t.respuesta ? `<div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 10px 15px; margin-top: 15px; border-radius: 4px;"><strong style="display:block; font-size:0.85rem; color: #10b981; margin-bottom:5px;">Respuesta de TiendApp:</strong><p style="font-size: 0.9rem;">${sanitize(t.respuesta)}</p></div>` : ''}
        </div>
    `;
}

function showERP() {
    document.getElementById('public-site').style.display = 'none';
    document.getElementById('client-support-portal').style.display = 'none';
    document.getElementById('agency-erp').style.display = 'block';
    window.scrollTo(0, 0);
    document.title = "TiendApp ERP | Central de Operaciones";
    renderAgencyTickets();
}

function logoutAgency() {
    document.getElementById('public-site').style.display = 'block';
    document.getElementById('client-support-portal').style.display = 'none';
    document.getElementById('agency-erp').style.display = 'none';
    document.title = "TiendApp Chile - Soluciones Digitales";
    window.scrollTo(0, 0);
}

function renderAgencyTickets() {
    const container = document.getElementById('agency-ticket-list');
    if(!container) return;
    if(tickets.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 20px 0;"><i class="fa-solid fa-clipboard-check"></i><p>No hay tickets de clientes pendientes.</p></div>`;
        return;
    }
    let html = '<div class="erp-table-container"><table class="erp-table"><thead><tr><th>Cliente</th><th>Tipo / Detalle</th><th>Estado</th><th>Acción</th></tr></thead><tbody>';
    tickets.slice().reverse().forEach(t => {
        let statusBadge = t.estado === 'Pendiente' ? `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Pendiente</span>` : `<span class="status-badge">Respondido</span>`;
        let actionBtn = t.estado === 'Pendiente' ? `<button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="openReplyModal(${t.id})">Dar Feedback</button>` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Cerrado</span>`;
        let shortDetail = t.detalle.length > 50 ? t.detalle.substring(0,50) + '...' : t.detalle;
        let ticketNum = t.id.toString().slice(-4);
        let dateDisplay = t.hora ? `${t.fecha} a las ${t.hora}` : t.fecha;
        html += `
        <tr>
            <td>
                <span style="font-size: 0.8rem; color: var(--primary); font-weight: bold; background: rgba(59, 130, 246, 0.1); padding: 2px 6px; border-radius: 4px; margin-bottom: 5px; display: inline-block;">#${ticketNum}</span><br>
                <strong>${sanitize(t.negocio)}</strong><br>
                <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ${dateDisplay}</span>
            </td>
            <td><strong style="font-size:0.9rem;">${sanitize(t.tipo)}</strong><br><span style="font-size:0.85rem; color:var(--text-muted);">${sanitize(shortDetail)}</span></td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        </tr>
        `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function openReplyModal(id) {
    const t = tickets.find(x => x.id === id);
    if(!t) return;
    document.getElementById('reply-ticket-id').value = id;
    document.getElementById('reply-ticket-info').innerText = `Ticket #${id.toString().slice(-4)} | Cliente: ${t.negocio}`;
    document.getElementById('reply-text').value = '';
    document.getElementById('agency-reply-modal').classList.add('active');
}

function closeReplyModal() {
    document.getElementById('agency-reply-modal').classList.remove('active');
}

function sendReply() {
    const id = parseInt(document.getElementById('reply-ticket-id').value);
    const feedback = document.getElementById('reply-text').value.trim();
    if(!feedback) return alert('Escribe una respuesta para el cliente.');
    const index = tickets.findIndex(x => x.id === id);
    if(index > -1) {
        tickets[index].respuesta = feedback;
        tickets[index].estado = 'Respondido';
        saveTickets();
        closeReplyModal();
        renderAgencyTickets();
        alert('Feedback enviado exitosamente. El cliente lo verá en su portal de soporte.');
    }
}
