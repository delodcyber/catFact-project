import { loadAllPartials, setupHamburger } from './partials';

const CAT_API_KEY = import.meta.env.VITE_CAT_API_KEY;

const els = {
  breedCount: document.getElementById("breed-count"),
  avgLifespan: document.getElementById("avg-lifespan"),
  factCount: document.getElementById("fact-count"),
  breedGrid: document.getElementById("breed-grid"),
  breedSearch: document.getElementById("breed-search"),
  sortSelect: document.getElementById("sort-select"),
  toggleOrder: document.getElementById("toggle-order"),
  refreshBtn: document.getElementById("refresh-btn"),
};

let allBreeds = [];
let sortAsc = true;

function apiHeaders() {
  return CAT_API_KEY ? { "x-api-key": CAT_API_KEY } : {};
}

function parseLifespan(text = "") {
  const match = text.match(/\d+/g);
  return match ? Number(match[0]) : 0;
}

function parseWeight(text = "") {
  const match = text.match(/\d+(\.\d+)?/g);
  return match ? Number(match[0]) : 0;
}

function normalizeBreed(breed) {
  return {
    ...breed,
    _lifespan: parseLifespan(breed.life_span),
    _weight: parseWeight(breed.weight?.metric || ""),
    _search: `${breed.name} ${breed.origin} ${breed.temperament}`.toLowerCase(),
  };
}

async function fetchBreeds() {
  const res = await fetch("https://api.thecatapi.com/v1/breeds", {
    headers: apiHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load breeds");

  const data = await res.json();
  return data.map(normalizeBreed);
}

function renderStats(list) {
  els.breedCount.textContent = list.length;

  const avg =
    list.reduce((sum, b) => sum + b._lifespan, 0) / list.length || 0;

  els.avgLifespan.textContent = avg.toFixed(1);
}

function getBreedImage(breed) {
  if (breed.image?.url) return breed.image.url;

  if (breed.reference_image_id) {
    return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
  }

  return "https://placehold.co/600x450?text=No+Image";
}

function renderGrid(list) {
  const query = els.breedSearch.value.trim().toLowerCase();
  const sortBy = els.sortSelect.value;

  let filtered = list.filter((b) => b._search.includes(query));

  filtered.sort((a, b) => {
    let value = 0;

    if (sortBy === "name") value = a.name.localeCompare(b.name);
    if (sortBy === "lifespan") value = a._lifespan - b._lifespan;
    if (sortBy === "weight") value = a._weight - b._weight;

    return sortAsc ? value : -value;
  });

  if (!filtered.length) {
    els.breedGrid.innerHTML =
      `<div class="empty-state">No breeds match that search.</div>`;
    return;
  }

  els.breedGrid.innerHTML = filtered
    .map((breed) => {
      const image = getBreedImage(breed);
      const temperament =
        (breed.temperament || "Unknown")
          .split(",")
          .slice(0, 3)
          .join(", ");

      const description = breed.description
        ? breed.description.slice(0, 120) + "..."
        : "No description available.";

      return `
        <article class="breed-card">
          <img src="${image}" alt="${breed.name}" loading="lazy" />

          <div class="content">
            <h3>${breed.name}</h3>

            <p class="meta">
              ${breed.origin || "Unknown origin"}
            </p>

            <div class="tag-row">
              <span class="tag">${breed.life_span || "N/A"} years</span>
              <span class="tag">${temperament}</span>
            </div>

            <p class="desc">${description}</p>

            <div class="card-links">
              ${
                breed.wikipedia_url
                  ? `<a href="${breed.wikipedia_url}" target="_blank" rel="noreferrer">Read more</a>`
                  : ""
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadPage() {
  try {
    const breeds = await fetchBreeds();
    allBreeds = breeds;

    renderStats(allBreeds);
    renderGrid(allBreeds);
  } catch (err) {
    console.error(err);
    els.breedGrid.innerHTML = `<p>Failed to load breeds</p>`;
  }
}

function setupEvents() {
  els.breedSearch.addEventListener("input", () => renderGrid(allBreeds));
  els.sortSelect.addEventListener("change", () => renderGrid(allBreeds));

  els.toggleOrder.addEventListener("click", () => {
    sortAsc = !sortAsc;
    els.toggleOrder.textContent = sortAsc ? "Ascending" : "Descending";
    renderGrid(allBreeds);
  });

  els.refreshBtn.addEventListener("click", loadPage);
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPartials();
  setupHamburger();
  setupEvents();
  loadPage();
});
