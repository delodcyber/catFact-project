export async function loadPartial(id, path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('Failed to load ' + path);
        const html = await res.text();
        document.getElementById(id).innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

const currentPath = window.location.pathname;

document.querySelectorAll('.nav-links a').forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    // Match exactly, or match home page
    if (
        href === currentPath ||
        (currentPath === '/' && href === '/index.html') ||
        currentPath.includes(href.replace('.html', ''))
    ) {
        link.classList.add('active');
    }
});

export async function loadAllPartials() {
    await loadPartial('site-head', '/partials/head.html');
    await loadPartial('site-header', '/partials/header.html');
    await loadPartial('site-footer', '/partials/footer.html');

    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (
            href === currentPath ||
            (currentPath === '/' && href === '/index.html') ||
            currentPath.includes(href.replace('.html', ''))
        ) {
            link.classList.add('active');
        }
    });
}

export function setupHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger || !navLinks) return;

    const items = navLinks.querySelectorAll('li');
    const total = items.length;

    function setPositions(isOpen) {
        const btnRect = hamburger.getBoundingClientRect();
        const originX = window.innerWidth - btnRect.right + btnRect.width / 2;
        const originY = window.innerHeight - btnRect.bottom + btnRect.height / 2;

        navLinks.style.setProperty('--origin-x', `${originX}px`);
        navLinks.style.setProperty('--origin-y', `${originY}px`);

        items.forEach((item, i) => {
            const angle = -(Math.PI / 2) + (i / (total - 1)) * (Math.PI / 2);
            const radius = 130;
            item.style.setProperty('--tx', (Math.cos(angle) * radius).toFixed(1));
            item.style.setProperty('--ty', (-Math.sin(angle) * radius).toFixed(1));
            item.style.transitionDelay = isOpen ? `${i * 55}ms` : '0ms';
        });
    }

    setPositions(false);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        setPositions(navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            setPositions(false);
        });
    });
}