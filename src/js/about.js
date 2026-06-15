import { loadAllPartials, setupHamburger } from './partials';

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllPartials();
    setupHamburger();
});