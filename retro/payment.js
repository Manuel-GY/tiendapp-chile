async function buyPlan(id, title, price) {
    var btn = document.getElementById('btn-sistema-light');
    if (!btn) return;

    var originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    btn.style.opacity = '0.7';
    btn.style.cursor = 'wait';

    try {
        var response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product: { id: id, title: title, price: price }
            })
        });

        var data = await response.json();

        if (!response.ok || !data.init_point) {
            throw new Error(data.error || 'Error creating payment');
        }

        window.location.href = data.init_point;
    } catch (error) {
        console.error('Payment error:', error);
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        alert('Hubo un error al procesar el pago. Por favor, intenta de nuevo o contactanos por WhatsApp.');
    }
}
