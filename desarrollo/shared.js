document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.mobile-toggle');
    const links = document.querySelector('.nav-links');
    const mobile = window.matchMedia('(max-width: 960px)');

    if (!toggle || !links) return;

    const setOpen = (open) => {
        links.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        toggle.querySelector('i').className = open ? 'fa-solid fa-times' : 'fa-solid fa-bars';
    };

    toggle.hidden = false;
    links.classList.add('menu-ready');
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.navbar')) setOpen(false);
    });
    links.addEventListener('focusout', event => {
        if (!links.contains(event.relatedTarget) && event.relatedTarget !== toggle) setOpen(false);
    });
    mobile.addEventListener('change', () => setOpen(false));
});
