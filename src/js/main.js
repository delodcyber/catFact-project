const apiKey = 'live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX'; // Replace with your actual Cat API key

async function loadPartial(id, path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

async function fetchCatImages(limit = 10) {
  const url = `https://api.thecatapi.com/v1/images/search?limit=${limit}`;
  try {
    const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
    if (!res.ok) throw new Error('Image fetch failed');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchCatFact() {
  try {
    const res = await fetch('https://catfact.ninja/fact');
    if (!res.ok) throw new Error('Fact fetch failed');
    const data = await res.json();
    return data.fact;
  } catch (err) {
    console.error(err);
    return 'Cats sleep 12–16 hours a day — more than most mammals.';
  }
}

function buildCoverflow(images) {
  const container = document.getElementById('coverflow');
  container.innerHTML = '';
  container.style.perspective = '1200px';

  const track = document.createElement('div');
  track.className = 'coverflow-track';
  container.appendChild(track);

  const imgs = images.map(img => img.url);
  let current = Math.floor(imgs.length / 2);
  let timer = null;

  // helper to compute shortest signed offset (circular)
  function signedOffset(i) {
    const n = imgs.length;
    let raw = i - current;
    if (raw > n / 2) raw -= n;
    if (raw < -n / 2) raw += n;
    return raw;
  }

  function render() {
    track.innerHTML = '';
    const n = imgs.length;
    for (let i = 0; i < n; i++) {
      const src = imgs[i];
      const el = document.createElement('img');
      el.src = src;
      el.className = 'coverflow-image';
      const offset = signedOffset(i);
      const abs = Math.abs(offset);

      // visual rules: show up to 2 images on each side
      if (abs > 3) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
      else el.style.opacity = '1';

      const baseX = 130; // spacing
      const translateX = offset * baseX;
      const rotateY = offset * -28;
      // center pops forward, sides go back
      const translateZ = offset === 0 ? 160 : -Math.min(abs * 80, 200);
      // scale center larger, adjacent smaller
      let scale = 1 - abs * 0.12;
      if (offset === 0) scale = 1.08;
      el.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.zIndex = (100 - abs).toString();
      el.addEventListener('click', () => { current = i; render(); });
      track.appendChild(el);
    }
  }

  function startAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      // advance so right image becomes center (anticlockwise/right->left flow)
      current = (current + 1) % imgs.length;
      render();
    }, 3000);
  }

  // pause on hover
  container.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  container.addEventListener('mouseleave', () => startAutoplay());

  render();
  startAutoplay();
}

function setupSubscribePopup() {
  const open = document.getElementById('open-subscribe');
  const popup = document.getElementById('subscribe-popup');
  const close = document.getElementById('popup-close');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const emailInput = document.getElementById('subscribe-email');

  open.addEventListener('click', () => popup.classList.add('open'));
  close.addEventListener('click', () => popup.classList.remove('open'));

  subscribeBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      emailInput.classList.add('invalid');
      emailInput.focus();
      return;
    }
    // Here you would send `email` to your backend. We'll simulate success.
    popup.innerHTML = '<p class="popup-thanks">Thanks! Check your inbox for a confirmation.</p>';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // load header/footer partials
  await loadPartial('site-header', 'src/public/partials/header.html');
  await loadPartial('site-footer', 'src/public/partials/footer.html');

  // images and coverflow
  const imgs = await fetchCatImages(10);
  if (imgs.length) buildCoverflow(imgs);

  // fact
  const fact = await fetchCatFact();
  const factEl = document.getElementById('cat-fact');
  if (factEl) factEl.textContent = fact;

  // subscribe popup behavior
  setupSubscribePopup();
});