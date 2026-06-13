// Utility: load HTML partials into placeholders
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

const CAT_API_KEY = 'live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX';

async function fetchFeaturedCat() {
  const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=3', {
    headers: { 'x-api-key': CAT_API_KEY }
  });
  const data = await response.json();
  return data; // return the full array now, not just data[0].url
}

async function fetchCatGallery() {
  const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=8', {
    headers: { 'x-api-key': CAT_API_KEY }
  });
  const data = await response.json();
  return data;
}

async function fetchCatFact() {
  const response = await fetch('https://catfact.ninja/fact');
  const data = await response.json();
  return data.fact;
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

function renderGallery(images) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  images.forEach((item) => {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = 'Cat image';
    gallery.appendChild(img);
  });
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

    const [featured, gallery, fact] = await Promise.all([
      fetchFeaturedCat(),
      fetchCatGallery(),
      fetchCatFact(),
    ]);

    renderFeaturedCat(featured);
    renderGallery(gallery);
    renderFact(fact);
    await renderFeaturedBreed();
  } catch (err) {
    console.error("Error loading cats:", err);
  } finally {
    hideLoading();
  }
}

// Single DOMContentLoaded — entry point
document.addEventListener('DOMContentLoaded', async () => {
  await loadPartial('site-header', 'src/public/partials/header.html');
  await loadPartial('site-footer', 'src/public/partials/footer.html');
  await loadPartial('site-head', 'src/public/partials/head.html');

  loadCats();
});