(() => {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    const mobile = window.matchMedia('(max-width: 960px)');

    menu.id = menu.id || 'service-navigation';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', menu.id);

    function setMenu(open, restoreFocus = false) {
        menu.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        toggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        menu.inert = mobile.matches && !open;
        if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', event => {
        if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', event => {
        if (!navbar.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    mobile.addEventListener('change', () => {
        const restoreFocus = mobile.matches && menu.contains(document.activeElement);
        setMenu(false, restoreFocus);
    });
    setMenu(false);
    document.body.classList.add('navigation-ready');

    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    if (tabs.length) {
        const list = document.querySelector('.tab-buttons');
        list.setAttribute('role', 'tablist');
        list.setAttribute('aria-label', 'Módulos de la comunidad');
        function selectTab(selected) {
            tabs.forEach(tab => {
                const active = tab === selected;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                document.getElementById('tab-' + tab.dataset.tab).hidden = !active;
            });
        }
        tabs.forEach((tab, index) => {
            const panel = document.getElementById('tab-' + tab.dataset.tab);
            tab.id = 'control-' + tab.dataset.tab;
            tab.type = 'button';
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', panel.id);
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', tab.id);
            panel.tabIndex = 0;
            tab.addEventListener('click', () => selectTab(tab));
            tab.addEventListener('keydown', event => {
                let next;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                if (next === undefined) return;
                event.preventDefault();
                selectTab(tabs[next]);
                tabs[next].focus();
            });
        });
        selectTab(tabs[0]);
        document.getElementById('modulos').classList.add('tabs-ready');
    }
    document.querySelectorAll('i').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
})();
