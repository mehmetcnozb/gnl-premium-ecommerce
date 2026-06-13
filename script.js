// GNL E-Commerce Platform - v1.2
// Commit 3: User Authentication & Profile Management

// 1. Ürün ve Kullanıcı Veritabanı
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
    products = defaultProducts; localStorage.setItem('gnl_products', JSON.stringify(products));
}

// Yeni Eklendi: Kullanıcı Verileri
let users = JSON.parse(localStorage.getItem('gnl_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('gnl_currentUser')) || null;

// Global Durumlar
let currentCategory = "Tümü";
let currentSortOption = "featured";

// Görünümler
const homeView = document.getElementById('homeView');
const shopView = document.getElementById('shopView');
const detailView = document.getElementById('productDetailView');

// --- SPA NAVİGASYONU ---
function showHome() { shopView.style.display = 'none'; detailView.style.display = 'none'; homeView.style.display = 'block'; renderFeatured(); }
function showShop(cat = "Tümü") { homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; currentCategory = cat; document.getElementById('categoryTitle').innerText = cat; applyFiltersAndSort(); }

window.showProductDetail = (id) => {
    const product = products.find(p => p.id === id); if (!product) return;
    homeView.style.display = 'none'; shopView.style.display = 'none'; detailView.style.display = 'block'; window.scrollTo(0, 0);
    document.getElementById('detailCategoryBreadcrumb').innerText = product.category;
    document.getElementById('detailImg').src = product.img;
    document.getElementById('detailTitle').innerText = product.title;
    document.getElementById('detailCategoryText').innerText = product.category;
    document.getElementById('detailPrice').innerText = product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " ₺";
    let similar = products.filter(p => p.category === product.category && p.id !== product.id);
    document.getElementById('similarProductsGrid').innerHTML = similar.slice(0, 3).map(createProductCard).join('');
};

// --- EKRANA ÇİZME VE FİLTRELEME ---
function createProductCard(p) {
    return `<div class="product-card" onclick="showProductDetail(${p.id})">
                <div class="img-container"><img src="${p.img}" class="product-image" onerror="this.src='https://via.placeholder.com/320'"></div>
                <div class="product-category">${p.category}</div><h3 class="product-title">${p.title}</h3>
                <div class="product-footer">
                    <div class="price">${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                    <button class="add-btn" onclick="event.stopPropagation(); alert('Sepet özelliği 4. commit te eklenecek!');"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                </div>
            </div>`;
}

function renderProducts(items) { document.getElementById('productCount').innerText = items.length; document.getElementById('productGrid').innerHTML = items.length === 0 ? '<p style="text-align:center; color:#666; width:100%;">Ürün bulunamadı.</p>' : items.map(createProductCard).join(''); }
function renderFeatured() { const feats = products.filter(p => p.isFeatured); const grid = document.getElementById('featuredGrid'); if (grid) grid.innerHTML = feats.map(createProductCard).join(''); }

const priceSlider = document.getElementById('priceSlider');
if(priceSlider) priceSlider.addEventListener('input', (e) => document.getElementById('priceValue').innerText = e.target.value);

function applyFiltersAndSort() {
    const maxP = parseFloat(priceSlider.value);
    let filtered = products.filter(p => (currentCategory === "Tümü" || p.category === currentCategory) && p.price <= maxP);
    if (currentSortOption === 'priceLow') filtered.sort((a, b) => a.price - b.price); else if (currentSortOption === 'priceHigh') filtered.sort((a, b) => b.price - a.price); else if (currentSortOption === 'featured') filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    renderProducts(filtered);
}

function closeAllDropdowns() { document.querySelectorAll('.custom-dropdown-content').forEach(d => d.style.display = 'none'); }
document.getElementById('filterToggleBtn').addEventListener('click', (e) => { e.stopPropagation(); const d = document.getElementById('filterContent'); const isH = d.style.display === 'none' || d.style.display === ''; closeAllDropdowns(); if(isH) d.style.display = 'block'; });
document.getElementById('sortToggleBtn').addEventListener('click', (e) => { e.stopPropagation(); const d = document.getElementById('sortContent'); const isH = d.style.display === 'none' || d.style.display === ''; closeAllDropdowns(); if(isH) d.style.display = 'block'; });
document.addEventListener('click', closeAllDropdowns);
document.getElementById('applyFiltersBtn').addEventListener('click', () => { applyFiltersAndSort(); closeAllDropdowns(); });
document.querySelectorAll('.sort-option').forEach(b => b.addEventListener('click', (e) => { document.querySelectorAll('.sort-option').forEach(x => x.classList.remove('active')); e.target.classList.add('active'); currentSortOption = e.target.getAttribute('data-sort'); document.getElementById('currentSortText').innerText = e.target.innerText; applyFiltersAndSort(); closeAllDropdowns(); }));

document.getElementById('homeLink').addEventListener('click', e => { e.preventDefault(); showHome(); });
document.getElementById('exploreBtn').addEventListener('click', () => showShop());
document.getElementById('navCollectionBtn').addEventListener('click', e => { e.preventDefault(); showShop(); });
document.getElementById('backToCollection').addEventListener('click', e => { e.preventDefault(); showShop(); });
document.querySelectorAll('.nav-item:not(#navCollectionBtn), .footer-category-link').forEach(l => { l.addEventListener('click', e => { e.preventDefault(); showShop(e.target.getAttribute('data-category')); window.scrollTo(0,0); }); });
document.getElementById('searchInput').addEventListener('input', e => { const t = e.target.value.toLowerCase(); if (t.length > 0) { homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; renderProducts(products.filter(p => p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t))); } else showShop(currentCategory); });


// =========================================================================
// YENİ EKLENEN: MODAL YÖNETİMİ, ÜYELİK VE PROFİL İŞLEMLERİ (COMMIT 3)
// =========================================================================

const mainOverlay = document.getElementById('mainOverlay');

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    mainOverlay.classList.remove('active');
}
mainOverlay.addEventListener('click', closeAllModals);
document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeAllModals));

// Header İkon Tıklaması (Giriş Yap/Profil)
document.getElementById('authToggle').addEventListener('click', e => { 
    e.preventDefault(); 
    closeAllModals(); 
    if (currentUser) document.getElementById('profileModal').classList.add('active'); 
    else document.getElementById('authModal').classList.add('active'); 
    mainOverlay.classList.add('active'); 
});

// Modal İçi Tab Geçişleri (Giriş/Kayıt ve Profil Sekmeleri)
document.getElementById('tabRegister').addEventListener('click', () => { document.getElementById('tabLogin').classList.remove('active'); document.getElementById('tabRegister').classList.add('active'); document.getElementById('formLogin').classList.remove('active'); document.getElementById('formRegister').classList.add('active'); });
document.getElementById('tabLogin').addEventListener('click', () => { document.getElementById('tabRegister').classList.remove('active'); document.getElementById('tabLogin').classList.add('active'); document.getElementById('formRegister').classList.remove('active'); document.getElementById('formLogin').classList.add('active'); });

document.querySelectorAll('.profile-tab').forEach(t => t.addEventListener('click', e => {
    document.querySelectorAll('.profile-tab').forEach(x => x.classList.remove('active')); 
    document.querySelectorAll('.profile-content').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active'); 
    document.getElementById(e.target.getAttribute('data-target')).classList.add('active');
}));

// Üye Ol İşlemi
document.getElementById('formRegister').addEventListener('submit', e => {
    e.preventDefault(); 
    const n = document.getElementById('registerName').value, m = document.getElementById('registerEmail').value, p = document.getElementById('registerPassword').value;
    if (users.find(u => u.email === m)) return alert("Bu e-posta zaten kayıtlı!");
    
    currentUser = { name: n, email: m, password: p, phone: "", city: "", district: "", address: "" }; 
    users.push(currentUser);
    
    localStorage.setItem('gnl_users', JSON.stringify(users)); 
    localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser));
    
    updateUserUI(); 
    closeAllModals(); 
    alert("Hesabınız oluşturuldu! Hoş geldiniz.");
});

// Giriş Yap İşlemi
document.getElementById('formLogin').addEventListener('submit', e => {
    e.preventDefault(); 
    const m = document.getElementById('loginEmail').value, p = document.getElementById('loginPassword').value;
    const u = users.find(x => x.email === m && x.password === p);
    if (u) { 
        currentUser = u; 
        localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); 
        updateUserUI(); closeAllModals(); alert("Giriş başarılı!"); 
    } else alert("Hatalı e-posta veya şifre!");
});

// Çıkış Yap İşlemi
document.getElementById('logoutBtn').addEventListener('click', () => { 
    currentUser = null; 
    localStorage.removeItem('gnl_currentUser'); 
    updateUserUI(); closeAllModals(); showHome(); 
});

// Profil Bilgilerini Kaydetme İşlemi
document.getElementById('saveInfoBtn').addEventListener('click', () => { 
    if (!currentUser) return; 
    currentUser.name = document.getElementById('profileNameInput').value; 
    currentUser.phone = document.getElementById('profilePhoneInput').value; 
    updateUserInStorage(); alert("Kişisel bilgileriniz kaydedildi."); 
});

document.getElementById('saveAddressBtn').addEventListener('click', () => { 
    if (!currentUser) return; 
    currentUser.city = document.getElementById('profileCityInput').value; 
    currentUser.district = document.getElementById('profileDistrictInput').value; 
    currentUser.address = document.getElementById('profileAddressInput').value; 
    updateUserInStorage(); alert("Adresiniz kaydedildi."); 
});

// LocalStorage'ı Güncelleyen Fonksiyon
function updateUserInStorage() { 
    localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); 
    const idx = users.findIndex(u => u.email === currentUser.email); 
    if (idx !== -1) { users[idx] = currentUser; localStorage.setItem('gnl_users', JSON.stringify(users)); } 
}

// Kullanıcı Verilerini Arayüze (Formlara ve İkona) Basan Fonksiyon
function updateUserUI() {
    const uIcon = document.getElementById('userIcon');
    if (currentUser) {
        uIcon.setAttribute('fill', 'currentColor'); // Giriş yapılınca ikonun içi dolar
        document.getElementById('profileNameInput').value = currentUser.name; 
        document.getElementById('profileEmailInput').value = currentUser.email;
        document.getElementById('profilePhoneInput').value = currentUser.phone || ""; 
        document.getElementById('profileCityInput').value = currentUser.city || "";
        document.getElementById('profileDistrictInput').value = currentUser.district || ""; 
        document.getElementById('profileAddressInput').value = currentUser.address || "";
    } else { 
        uIcon.setAttribute('fill', 'none'); 
    }
}

// Telefon Numarası İçin 11 Hane / '05' İle Başlama Maskesi
function phoneMask(e) { 
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 0) { if (v[0] !== '0') v = '0' + v; } 
    if (v.length > 1) { if (v[1] !== '5') v = '05' + v.substring(2); } 
    e.target.value = v.substring(0, 11); 
}
document.getElementById('profilePhoneInput').addEventListener('input', phoneMask);

// Sayfa ilk açıldığında UI'ı güncelle ve Ana sayfayı göster
updateUserUI(); 
showHome();