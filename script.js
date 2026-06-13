// GNL E-Commerce Platform - v1.1
// Commit 2: SPA Navigation & Product Rendering

// 1. Ürün Veritabanı (Başlangıç Verileri)
const defaultProducts = [
    { id: 1, category: "Mutfak", title: "Minimal Seramik Kase Seti", price: 899.90, isFeatured: true, img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop" },
    { id: 2, category: "Ev Yaşam", title: "Kristal Şarap Kadehleri", price: 1299.00, isFeatured: false, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop" },
    { id: 3, category: "Ev Yaşam", title: "Beyaz Porselen Koleksiyonu", price: 1499.00, isFeatured: true, img: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=800&auto=format&fit=crop" },
    { id: 4, category: "Mutfak", title: "Artisan Karıştırma Kabı", price: 649.90, isFeatured: false, img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop" },
    { id: 6, category: "Temizlik", title: "Organik Yüzey Temizleyici", price: 349.90, isFeatured: true, img: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=800&auto=format&fit=crop" },
    { id: 7, category: "Kişisel Bakım", title: "Doğal Banyo Sabunu", price: 249.90, isFeatured: false, img: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=800&auto=format&fit=crop" }
];

let products = JSON.parse(localStorage.getItem('gnl_products'));
if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem('gnl_products', JSON.stringify(products));
}

// Global Durumlar (State)
let currentCategory = "Tümü";
let currentSortOption = "featured";

// Görünüm (View) Seçiciler
const homeView = document.getElementById('homeView');
const shopView = document.getElementById('shopView');
const detailView = document.getElementById('productDetailView');

// --- SPA NAVİGASYON FONKSİYONLARI ---
function showHome() {
    shopView.style.display = 'none';
    detailView.style.display = 'none';
    homeView.style.display = 'block';
    renderFeatured();
}

function showShop(cat = "Tümü") {
    homeView.style.display = 'none';
    detailView.style.display = 'none';
    shopView.style.display = 'block';
    currentCategory = cat;
    document.getElementById('categoryTitle').innerText = cat;
    applyFiltersAndSort();
}

window.showProductDetail = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    homeView.style.display = 'none';
    shopView.style.display = 'none';
    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    document.getElementById('detailCategoryBreadcrumb').innerText = product.category;
    document.getElementById('detailImg').src = product.img;
    document.getElementById('detailTitle').innerText = product.title;
    document.getElementById('detailCategoryText').innerText = product.category;
    document.getElementById('detailPrice').innerText = product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " ₺";

    // Benzer ürünleri göster
    let similar = products.filter(p => p.category === product.category && p.id !== product.id);
    document.getElementById('similarProductsGrid').innerHTML = similar.slice(0, 3).map(createProductCard).join('');
};

// --- EKRANA ÇİZME (RENDER) İŞLEMLERİ ---
function createProductCard(p) {
    return `
        <div class="product-card" onclick="showProductDetail(${p.id})">
            <div class="img-container">
                <img src="${p.img}" class="product-image" onerror="this.src='https://via.placeholder.com/320'">
            </div>
            <div class="product-category">${p.category}</div>
            <h3 class="product-title">${p.title}</h3>
            <div class="product-footer">
                <div class="price">${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                <button class="add-btn" onclick="event.stopPropagation(); alert('Sepet özelliği sonraki commitlerde eklenecek!');"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
            </div>
        </div>`;
}

function renderProducts(items) {
    document.getElementById('productCount').innerText = items.length;
    document.getElementById('productGrid').innerHTML = items.length === 0 ? '<p style="grid-column: 1/-1; text-align:center; color:#666;">Kriterlere uygun ürün bulunamadı.</p>' : items.map(createProductCard).join('');
}

function renderFeatured() {
    const feats = products.filter(p => p.isFeatured);
    const grid = document.getElementById('featuredGrid');
    if (grid) grid.innerHTML = feats.map(createProductCard).join('');
}

// --- FİLTRE VE SIRALAMA ---
const priceSlider = document.getElementById('priceSlider');
if(priceSlider) {
    priceSlider.addEventListener('input', (e) => document.getElementById('priceValue').innerText = e.target.value);
}

function applyFiltersAndSort() {
    const maxP = parseFloat(priceSlider.value);
    let filtered = products.filter(p => (currentCategory === "Tümü" || p.category === currentCategory) && p.price <= maxP);
    
    if (currentSortOption === 'priceLow') filtered.sort((a, b) => a.price - b.price);
    else if (currentSortOption === 'priceHigh') filtered.sort((a, b) => b.price - a.price);
    else if (currentSortOption === 'featured') filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    
    renderProducts(filtered);
}

// --- DROPDOWN MENÜLER ---
const filterToggleBtn = document.getElementById('filterToggleBtn');
const sortToggleBtn = document.getElementById('sortToggleBtn');

function closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown-content').forEach(d => d.style.display = 'none');
}

if(filterToggleBtn) {
    filterToggleBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); const d = document.getElementById('filterContent'); 
        const isHidden = d.style.display === 'none' || d.style.display === '';
        closeAllDropdowns(); if(isHidden) d.style.display = 'block'; 
    });
}
if(sortToggleBtn) {
    sortToggleBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); const d = document.getElementById('sortContent'); 
        const isHidden = d.style.display === 'none' || d.style.display === '';
        closeAllDropdowns(); if(isHidden) d.style.display = 'block'; 
    });
}
document.addEventListener('click', closeAllDropdowns);

document.getElementById('applyFiltersBtn').addEventListener('click', () => { applyFiltersAndSort(); closeAllDropdowns(); });

document.querySelectorAll('.sort-option').forEach(b => b.addEventListener('click', (e) => { 
    document.querySelectorAll('.sort-option').forEach(x => x.classList.remove('active')); 
    e.target.classList.add('active'); 
    currentSortOption = e.target.getAttribute('data-sort'); 
    document.getElementById('currentSortText').innerText = e.target.innerText; 
    applyFiltersAndSort(); closeAllDropdowns(); 
}));

// --- OLAY DİNLEYİCİLERİ (Event Listeners) ---
document.getElementById('homeLink').addEventListener('click', e => { e.preventDefault(); showHome(); });
document.getElementById('exploreBtn').addEventListener('click', () => showShop());
document.getElementById('navCollectionBtn').addEventListener('click', e => { e.preventDefault(); showShop(); });
document.getElementById('backToCollection').addEventListener('click', e => { e.preventDefault(); showShop(); });

document.querySelectorAll('.nav-item:not(#navCollectionBtn), .footer-category-link').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); showShop(e.target.getAttribute('data-category')); window.scrollTo(0,0); });
});

document.getElementById('searchInput').addEventListener('input', e => { 
    const t = e.target.value.toLowerCase(); 
    if (t.length > 0) { 
        homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; 
        renderProducts(products.filter(p => p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t))); 
    } else showShop(currentCategory); 
});

// Sistemi Başlat
showHome();