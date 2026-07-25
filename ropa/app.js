let cartCount = 0;

function toggleCart() {
    showToast('Funcionalidad de Carrito (Demo)');
}

function openProduct(title, price, img) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-price').innerText = `$${price.toLocaleString('es-CL')}`;
    document.getElementById('modal-img-src').src = img;
    document.getElementById('product-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function addToCart() {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    closeModal();
    showToast('¡Añadido al carrito con éxito!');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 2000);
}

// Category Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const cat = btn.getAttribute('data-cat');
        document.querySelectorAll('.product-card').forEach(card => {
            if (cat === 'all' || card.getAttribute('data-category') === cat) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Size Selection
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
