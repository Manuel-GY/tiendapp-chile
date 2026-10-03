(() => {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.getElementById('menu-principal');
    const mobile = window.matchMedia('(max-width: 768px)');

    function setMenu(open, restoreFocus = false) {
        menu.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        const icon = toggle.querySelector('i');
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
        menu.inert = mobile.matches && !open;
        if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', event => {
        if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenu(false, true);
        }
    });
    document.addEventListener('click', event => {
        if (!navbar.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
        }
    });
    mobile.addEventListener('change', () => {
        const focusInMenu = menu.contains(document.activeElement);
        setMenu(false, mobile.matches && focusInMenu);
    });
    navbar.classList.add('nav-ready');
    setMenu(false);
})();
