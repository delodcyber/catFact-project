import { loadAllPartials } from './partials.js';

// ─── DISCOVER NEW CAT ─────────────────────────────────────────────────────────
const CAT_API_KEY = 'live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX';

async function fetchFeaturedCat() {
  const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=3', {
    headers: { 'x-api-key': CAT_API_KEY }
  });
  const data = await response.json();
  return data; // return the full array now, not just data[0].url
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

// Render the 3 hero slider images
function renderFeaturedCat(images) {
  document.getElementById('slide1').src = images[0].url;
  document.getElementById('slide2').src = images[1].url;
  document.getElementById('slide3').src = images[2].url;
}

// Render the daily fact
function renderFact(fact) {
  document.getElementById('daily-fact').textContent = fact;
}

function renderBreedCount(count) {
  document.getElementById('breed-count').textContent = count;
}

// Fetch a random breed
async function fetchFeaturedBreed() {
  const response = await fetch('https://api.thecatapi.com/v1/breeds?limit=1&page=0', {
    headers: { 'x-api-key': CAT_API_KEY }
  });
  const data = await response.json();
  return data[0];
}

// Fetch an image for that breed
async function fetchBreedImage(breedId) {
  const response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`, {
    headers: { 'x-api-key': CAT_API_KEY }
  });
  const data = await response.json();
  return data[0].url;
}

// Render the featured breed
async function renderFeaturedBreed() {
  const breed = await fetchFeaturedBreed();
  const imageUrl = await fetchBreedImage(breed.id);

  document.getElementById('breed-image').src = imageUrl;
  document.getElementById('breed-name').textContent = breed.name;
  document.getElementById('breed-description').textContent = breed.description;
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
    await loadCats();
});