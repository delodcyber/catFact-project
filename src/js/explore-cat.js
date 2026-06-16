import { loadAllPartials, setupHamburger } from './partials';

const CAT_API_KEY = 'live_pKg7az242OM2J74UFGGEEiidBpX4ObIQ1xByBjh73T1GCeGDjZ2WLf0CeYoptHwX';

// ─── STATE ───────────────────────────────────────────────────────────────────
let galleryPage = 1;
let isLoading = false;
let currentBreedId = '';       // empty = all breeds
let noMoreCats = false;        // true when the API returns no more images


// ─── SPINNER ─────────────────────────────────────────────────────────────────
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}


// ─── FETCH: featured cat (single image) ──────────────────────────────────────
async function fetchFeaturedCat() {
    const url = currentBreedId
        ? `https://api.thecatapi.com/v1/images/search?breed_ids=${currentBreedId}`
        : 'https://api.thecatapi.com/v1/images/search';

    const response = await fetch(url, {
        headers: { 'x-api-key': CAT_API_KEY }
    });
    const data = await response.json();
    return data[0];         // return full object, not just url
}


// ─── FETCH: gallery (8 images per page) ──────────────────────────────────────
async function fetchCatGallery(page = 1) {
    const url = currentBreedId
        ? `https://api.thecatapi.com/v1/images/search?limit=8&page=${page}&breed_ids=${currentBreedId}`
        : `https://api.thecatapi.com/v1/images/search?limit=8&page=${page}`;

    const response = await fetch(url, {
        headers: { 'x-api-key': CAT_API_KEY }
    });
    const data = await response.json();
    return data;
}


// ─── FETCH: cat fact (catfact.ninja) ─────────────────────────────────────────


// ─── FETCH: all breeds (for search dropdown) ─────────────────────────────────
async function fetchAllBreeds() {
    const response = await fetch('https://api.thecatapi.com/v1/breeds', {
        headers: { 'x-api-key': CAT_API_KEY }
    });
    const data = await response.json();
    return data;
}


// ─── RENDER: featured image + sync dropdown ───────────────────────────────────
function renderFeaturedCat(catObject) {

    document.getElementById('cat-image').src = catObject.url;

    renderCatInfo(catObject);

    const select = document.getElementById('breed-select');

    if (catObject.breeds && catObject.breeds.length > 0) {
        const breedId = catObject.breeds[0].id;
        select.value = breedId;
        currentBreedId = breedId;
    } else {
        select.value = '';
        currentBreedId = '';
    }
}


// ─── RENDER: CATFACT INFO ─────────────────────────────────────────────────────────
function renderCatInfo(catObject) {

    const breed = catObject.breeds?.[0];

    if (!breed) {

        document.getElementById('breed-name').textContent =
            'Unknown Cat';

        document.getElementById('breed-description').textContent =
            'This image is not associated with a specific breed in The Cat API database.';

        document.getElementById('breed-origin').textContent = '-';
        document.getElementById('breed-temperament').textContent = '-';
        document.getElementById('breed-lifespan').textContent = '-';
        document.getElementById('breed-weight').textContent = '-';
        document.getElementById('breed-intelligence').textContent = '-';
        document.getElementById('breed-energy').textContent = '-';

        return;
    }

    document.getElementById('breed-name').textContent =
        breed.name;

    document.getElementById('breed-description').textContent =
        breed.description || 'No description available.';

    document.getElementById('breed-origin').textContent =
        breed.origin || '-';

    document.getElementById('breed-temperament').textContent =
        breed.temperament || '-';

    document.getElementById('breed-lifespan').textContent =
        breed.life_span || '-';

    document.getElementById('breed-weight').textContent =
        breed.weight?.metric
            ? `${breed.weight.metric} kg`
            : '-';

    document.getElementById('breed-intelligence').textContent =
        breed.intelligence ?? '-';

    document.getElementById('breed-energy').textContent =
        breed.energy_level ?? '-';
}

// ─── RENDER: gallery (append or replace) ─────────────────────────────────────
function renderGallery(images, append = false) {
    const gallery = document.getElementById('gallery');

    if (!append) {
        gallery.innerHTML = '';
    }

    images.forEach((item) => {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = 'Cat image';
        img.loading = 'lazy';
        gallery.appendChild(img);
    });
}


// ─── RENDER: breed search dropdown ───────────────────────────────────────────
function renderBreedOptions(breeds) {
    const select = document.getElementById('breed-select');

    // first option — show all
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Breeds';
    select.appendChild(defaultOption);

    breeds.forEach((breed) => {
        const option = document.createElement('option');
        option.value = breed.id;
        option.textContent = breed.name;
        select.appendChild(option);
    });
}


// ─── SEE MORE BUTTON ──────────────────────────────────────────────────────────
function showSeeMoreButton() {
    const btn = document.getElementById('see-more-btn');
    if (btn) btn.classList.remove('hidden');
}

function hideSeeMoreButton() {
    const btn = document.getElementById('see-more-btn');
    if (btn) btn.classList.add('hidden');
}

function setupSeeMoreButton() {
    const btn = document.getElementById('see-more-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        if (isLoading || noMoreCats) return;

        isLoading = true;
        galleryPage++;

        showLoading();
        const images = await fetchCatGallery(galleryPage);

        if (images.length === 0) {
            // No more cats available — hide the button permanently
            noMoreCats = true;
            hideSeeMoreButton();
        } else {
            renderGallery(images, true);    // append to existing gallery

            // Hide button if this batch returned fewer than 8 (last page)
            if (images.length < 8) {
                noMoreCats = true;
                hideSeeMoreButton();
            }
        }

        hideLoading();
        isLoading = false;
    });
}


// ─── BREED SEARCH ─────────────────────────────────────────────────────────────
function setupBreedSearch() {
    const select = document.getElementById('breed-select');

    select.addEventListener('change', async () => {
        currentBreedId = select.value;
        galleryPage = 1;
        noMoreCats = false;

        showLoading();

        const [featured, gallery] = await Promise.all([
            fetchFeaturedCat(),
            fetchCatGallery(1),
        ]);

        renderFeaturedCat(featured);
        renderGallery(gallery, false);

        // Show or hide See More based on what came back
        if (gallery.length < 8) {
            noMoreCats = true;
            hideSeeMoreButton();
        } else {
            showSeeMoreButton();
        }

        hideLoading();
    });
}


// ─── DISCOVER BUTTON ──────────────────────────────────────────────────────────
function setupDiscoverButton() {
    const btn = document.getElementById('discover-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        // Reset breed filter so we get a truly random cat
        currentBreedId = '';

        showLoading();

        try {
            const [featured] = await Promise.all([
                fetchFeaturedCat(),
            ]);

            renderFeaturedCat(featured);

        } catch (err) {
            console.error('Error discovering new cat:', err);
        } finally {
            hideLoading();
        }
    });
}


// ─── INITIAL LOAD ─────────────────────────────────────────────────────────────
async function loadCats() {
    try {
        showLoading();

        const [featured, firstPage, secondPage, breeds] = await Promise.all([
            fetchFeaturedCat(),
            fetchCatGallery(1),
            fetchCatGallery(2),
            fetchAllBreeds()
        ]);

        renderBreedOptions(breeds);
        renderGallery(firstPage, false);
        renderGallery(secondPage, true);
        galleryPage = 2;
        showSeeMoreButton();

        // If the random featured cat has no breed, re-fetch using the first breed
        if (!featured.breeds || featured.breeds.length === 0) {
            const firstBreed = breeds[0];
            currentBreedId = firstBreed.id;

            const breedFeatured = await fetchFeaturedCat();

            // Attach breed data manually if API still returns no breeds
            if (!breedFeatured.breeds || breedFeatured.breeds.length === 0) {
                breedFeatured.breeds = [firstBreed];
            }

            renderFeaturedCat(breedFeatured);

            // Sync the dropdown to match
            const select = document.getElementById('breed-select');
            select.value = firstBreed.id;
        } else {
            renderFeaturedCat(featured);
        }

    } catch (err) {
        console.error('Error loading cats:', err);
    } finally {
        hideLoading();
    }
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllPartials();
    setupHamburger();
    await loadCats();
    setupDiscoverButton();
    setupBreedSearch();
    setupSeeMoreButton();
});