import { loadAllPartials setupHamburger } from './partials.js';

// ─── DISCOVER NEW CAT ─────────────────────────────────────────────────────────
const CAT_API_KEY = 'live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX';

async function fetchFeaturedCat() {
  const response = await fetch(
    'https://api.thecatapi.com/v1/images/search?limit=3',
    { headers: { 'x-api-key': CAT_API_KEY } }
  );

  const data = await response.json();
  return data || [];
}

async function fetchCatFact() {
  const response = await fetch('https://catfact.ninja/fact');
  const data = await response.json();
  return data.fact;
}

async function fetchAllBreeds() {
  const response = await fetch('https://api.thecatapi.com/v1/breeds', {
    headers: { 'x-api-key': CAT_API_KEY }
  });

  const data = await response.json();
  return data;
}

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

// ─── FIXED SLIDER RENDER (SAFE) ───────────────────────────────────────────────
function renderFeaturedCat(images) {
  const slideIds = ['slide1', 'slide2', 'slide3'];

  slideIds.forEach((id, index) => {
    const el = document.getElementById(id);
    const imgUrl = images?.[index]?.url;

    if (el && imgUrl) {
      el.src = imgUrl;
    }
  });
}

// Render the daily fact
function renderFact(fact) {
  const el = document.getElementById('cat-fact');
  if (!el) return;
  el.textContent = fact;
}

function renderBreedCount(count) {
  const el = document.getElementById('breed-count');
  if (el) el.textContent = count;
}

// Fetch a random breed
async function fetchFeaturedBreed() {
  const response = await fetch(
    'https://api.thecatapi.com/v1/breeds?limit=1&page=0',
    { headers: { 'x-api-key': CAT_API_KEY } }
  );

  const data = await response.json();
  return data[0];
}

// Fetch an image for that breed
async function fetchBreedImage(breedId) {
  const response = await fetch(
    `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`,
    { headers: { 'x-api-key': CAT_API_KEY } }
  );

  const data = await response.json();
  return data?.[0]?.url || '';
}

// Render the featured breed
async function renderFeaturedBreed() {
  const breed = await fetchFeaturedBreed();
  const imageUrl = await fetchBreedImage(breed.id);

  const img = document.getElementById('featured-image');
  const origin = document.getElementById('featured-origin');
  const temperament = document.getElementById('featured-temperament');
  const life = document.getElementById('featured-life');
  const weight = document.getElementById('featured-weight');
  const desc = document.getElementById('featured-description');

  if (img) img.src = imageUrl || '';

  if (desc) desc.textContent = breed.description || 'No description available';

  if (origin) origin.textContent = breed.origin || 'Unknown';

  if (temperament) temperament.textContent = breed.temperament || 'Unknown';

  if (life) life.textContent = breed.life_span || 'Unknown';

  if (weight) {
    weight.textContent = breed.weight?.metric
      ? `${breed.weight.metric} kg`
      : 'Unknown';
  }
}

async function loadCats() {
  try {
    showLoading();

    const [featured, fact, breeds] = await Promise.all([
      fetchFeaturedCat(),
      fetchCatFact(),
      fetchAllBreeds(),
    ]);

    renderFeaturedCat(featured);
    renderFact(fact);
    renderBreedCount(breeds.length);
    await renderFeaturedBreed();

  } catch (err) {
    console.error("Error loading cats:", err);
  } finally {
    hideLoading();
  }
}

// Single DOMContentLoaded — entry point
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllPartials();
  setupHamburger();
  await loadCats();
});