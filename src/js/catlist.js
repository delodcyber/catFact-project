const CAT_API_KEY = "live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX";

// Cat image fetch (single featured image)
async function fetchFeaturedCat() {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search",
    {
      headers: {
        "x-api-key": CAT_API_KEY,
      },
    }
  );

  const data = await response.json();
  return data[0].url;
}

// Cat gallery fetch (multiple images)
async function fetchCatGallery() {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=8",
    {
      headers: {
        "x-api-key": CAT_API_KEY,
      },
    }
  );

  const data = await response.json();
  return data;
}

// Cat fact fetch
async function fetchCatFact() {
  const response = await fetch("https://catfact.ninja/fact");
  const data = await response.json();
  return data.fact;
}

// Render featured image
function renderFeaturedCat(url) {
  const img = document.getElementById("cat-image");
  img.src = url;
}

// Render fact
function renderFact(fact) {
  const factEl = document.getElementById("cat-fact");
  factEl.textContent = fact;
}

// Render gallery
function renderGallery(images) {
  const gallery = document.getElementById("gallery");

  gallery.innerHTML = "";

  images.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = "Cat image";
    gallery.appendChild(img);
  });
}

// Load everything at once
async function loadCats() {
  try {
    const [featured, gallery, fact] = await Promise.all([
      fetchFeaturedCat(),
      fetchCatGallery(),
      fetchCatFact(),
    ]);

    renderFeaturedCat(featured);
    renderGallery(gallery);
    renderFact(fact);
  } catch (err) {
    console.error("Error loading cats:", err);
  }
}

// Button interaction
function setupButton() {
  const btn = document.getElementById("discover-btn");

  btn.addEventListener("click", () => {
    loadCats();
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadCats();
  setupButton();
});