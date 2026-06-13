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

export async function loadAllPartials() {
    await loadPartial('site-head', '/partials/head.html');
    await loadPartial('site-header', '/partials/header.html');
    await loadPartial('site-footer', '/partials/footer.html');
}

// Mobile menu toggle
export function setupHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });
}