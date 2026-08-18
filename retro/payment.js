document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btn-sistema-light');
    if (!btn) return;

    btn.addEventListener('click', function() {
        var planId = btn.getAttribute('data-plan-id');
        var planTitle = btn.getAttribute('data-plan-title');
        var planPrice = parseInt(btn.getAttribute('data-plan-price'), 10);

        var originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';

        fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product: { id: planId, title: planTitle, price: planPrice }
            })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (!data.init_point) {
                throw new Error(data.error || 'Error creating payment');
            }
            window.location.href = data.init_point;
        })
        .catch(function(error) {
            console.error('Payment error:', error);
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            alert('Hubo un error al procesar el pago. Por favor, intenta de nuevo o contactanos por WhatsApp.');
        });
    });
});
