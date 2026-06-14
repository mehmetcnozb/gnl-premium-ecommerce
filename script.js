// GNL E-Commerce Platform - v1.4
// Commit 5: Admin Dashboard for Product Management

// --- 1. GLOBAL VERİTABANI YÖNETİMİ ---
const defaultProducts = [
    { id: 1, category: "Mutfak", title: "Minimal Seramik Kase Seti", price: 899.90, isFeatured: true, img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop" },
    { id: 2, category: "Ev Yaşam", title: "Kristal Şarap Kadehleri", price: 1299.00, isFeatured: false, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop" },
    { id: 3, category: "Ev Yaşam", title: "Beyaz Porselen Koleksiyonu", price: 1499.00, isFeatured: true, img: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=800&auto=format&fit=crop" },
    { id: 4, category: "Mutfak", title: "Artisan Karıştırma Kabı", price: 649.90, isFeatured: false, img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop" },
    { id: 6, category: "Temizlik", title: "Organik Yüzey Temizleyici", price: 349.90, isFeatured: true, img: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=800&auto=format&fit=crop" },
    { id: 7, category: "Kişisel Bakım", title: "Doğal Banyo Sabunu", price: 249.90, isFeatured: false, img: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=800&auto=format&fit=crop" }
];

let products = JSON.parse(localStorage.getItem('gnl_products'));
if (!products || products.length === 0) { products = defaultProducts; localStorage.setItem('gnl_products', JSON.stringify(products)); }

let users = JSON.parse(localStorage.getItem('gnl_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('gnl_currentUser')) || null;

// =========================================================================
// YENİ EKLENEN: YÖNETİM PANELİ (ADMIN) İŞLEVLERİ (COMMIT 5)
// =========================================================================

// Eğer şu an admin sayfasındaysak bu blok çalışır
if (document.querySelector('.admin-container')) {
    const tabProductsBtn = document.getElementById('tabProductsBtn');
    const tabOrdersBtn = document.getElementById('tabOrdersBtn');
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');

    // Admin Sekme Değiştirme
    function switchTab(activeBtn, activeSec) {
        [tabProductsBtn, tabOrdersBtn].forEach(b => b.classList.remove('active'));
        [productsSection, ordersSection].forEach(s => s.classList.remove('active'));
        activeBtn.classList.add('active'); activeSec.classList.add('active');
    }

    tabProductsBtn.addEventListener('click', () => { switchTab(tabProductsBtn, productsSection); renderAdminProducts(); });
    tabOrdersBtn.addEventListener('click', () => { switchTab(tabOrdersBtn, ordersSection); renderAdminOrders(); });

    // Admin Ürünleri Listele
    function renderAdminProducts() {
        let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
        const tbody = document.getElementById('adminProductTable');
        tbody.innerHTML = '';
        document.getElementById('totalProductCount').innerText = adminProducts.length;

        adminProducts.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.img}" class="product-img-preview" alt="görsel" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td style="font-weight: 500; color: #111;">${p.title}<br><span style="font-size:0.8rem; color:#888;">${p.isFeatured ? 'Öne Çıkan' : ''}</span></td>
                <td style="color: #475569;">${p.category}</td>
                <td style="font-weight: 500;">${p.price.toLocaleString('tr-TR')} ₺</td>
                <td><button class="btn-danger-sm" onclick="deleteProduct(${p.id})">SİL</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Yeni Ürün Ekleme (Form Submit)
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
        
        const newProduct = {
            id: Date.now(), 
            title: document.getElementById('pTitle').value, 
            price: parseFloat(document.getElementById('pPrice').value),
            stock: parseInt(document.getElementById('pStock').value), 
            category: document.getElementById('pCategory').value,
            img: document.getElementById('pImg').value, 
            isFeatured: document.getElementById('pFeatured').checked, 
            sales: 0
        };
        
        adminProducts.push(newProduct); 
        localStorage.setItem('gnl_products', JSON.stringify(adminProducts));
        e.target.reset(); 
        renderAdminProducts(); 
        alert("Ürün başarıyla sisteme kaydedildi!");
    });

    // Ürün Silme İşlemi
    window.deleteProduct = (id) => {
        if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) { 
            let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
            adminProducts = adminProducts.filter(p => p.id !== id); 
            localStorage.setItem('gnl_products', JSON.stringify(adminProducts)); 
            renderAdminProducts(); 
        }
    };

    // Admin Siparişleri Listeleme (Commit 4'te oluşan siparişleri okur)
    function renderAdminOrders() {
        const orders = JSON.parse(localStorage.getItem('gnl_orders')) || [];
        const tbody = document.getElementById('adminOrderTable');
        document.getElementById('totalOrderCount').innerText = orders.length;
        tbody.innerHTML = orders.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">Sipariş yok.</td></tr>' : '';
        
        orders.slice().reverse().forEach(o => {
            const items = o.items.map(i => `<div style="margin-bottom:4px;">• ${i.title}</div>`).join('');
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td><strong>${o.id}</strong></td>
                    <td style="color:#64748b; font-size:0.85rem;">${o.date}</td>
                    <td><strong>${o.customer.name}</strong><br><span style="font-size:0.85rem; color:#64748b;">${o.customer.phone}</span><br><span style="font-size:0.8rem; color:#888;">${o.customer.city}/${o.customer.district}</span></td>
                    <td style="font-size:0.85rem;">${items}</td>
                    <td style="font-weight:600; color:#10b981;">${o.total.toLocaleString('tr-TR')} ₺</td>
                    <td><span style="background:#f1c40f; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">${o.status || 'Sipariş Alındı'}</span></td>
                </tr>`);
        });
    }

    // Admin sayfası açılışında verileri yükle
    renderAdminProducts();
}

// =========================================================================
// MÜŞTERİ ARAYÜZÜ (FRONTEND) İŞLEVLERİ (Önceki Commitler)
// =========================================================================

if (document.getElementById('homeView')) {
    let cart = [];
    let cartTotalValue = 0;
    let currentCategory = "Tümü";
    let currentSortOption = "featured";
    let currentlyViewingProduct = null;

    const homeView = document.getElementById('homeView');
    const shopView = document.getElementById('shopView');
    const detailView = document.getElementById('productDetailView');

    function showHome() { shopView.style.display = 'none'; detailView.style.display = 'none'; homeView.style.display = 'block'; renderFeatured(); }
    function showShop(cat = "Tümü") { homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; currentCategory = cat; document.getElementById('categoryTitle').innerText = cat; applyFiltersAndSort(); }

    window.showProductDetail = (id) => {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products; // Admindeki güncellemeleri çekmek için
        currentlyViewingProduct = products.find(p => p.id === id); if (!currentlyViewingProduct) return;
        homeView.style.display = 'none'; shopView.style.display = 'none'; detailView.style.display = 'block'; window.scrollTo(0, 0);
        document.getElementById('detailCategoryBreadcrumb').innerText = currentlyViewingProduct.category;
        document.getElementById('detailImg').src = currentlyViewingProduct.img;
        document.getElementById('detailTitle').innerText = currentlyViewingProduct.title;
        document.getElementById('detailCategoryText').innerText = currentlyViewingProduct.category;
        document.getElementById('detailPrice').innerText = currentlyViewingProduct.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " ₺";
        let similar = products.filter(p => p.category === currentlyViewingProduct.category && p.id !== currentlyViewingProduct.id);
        document.getElementById('similarProductsGrid').innerHTML = similar.slice(0, 3).map(createProductCard).join('');
    };

    function createProductCard(p) {
        return `<div class="product-card" onclick="showProductDetail(${p.id})">
                    <div class="img-container"><img src="${p.img}" class="product-image" onerror="this.src='https://via.placeholder.com/320'"></div>
                    <div class="product-category">${p.category}</div><h3 class="product-title">${p.title}</h3>
                    <div class="product-footer">
                        <div class="price">${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                </div>`;
    }

    function renderProducts(items) { document.getElementById('productCount').innerText = items.length; document.getElementById('productGrid').innerHTML = items.length === 0 ? '<p style="text-align:center; color:#666; width:100%;">Ürün bulunamadı.</p>' : items.map(createProductCard).join(''); }
    function renderFeatured() { products = JSON.parse(localStorage.getItem('gnl_products')) || products; const feats = products.filter(p => p.isFeatured); const grid = document.getElementById('featuredGrid'); if (grid) grid.innerHTML = feats.map(createProductCard).join(''); }

    const priceSlider = document.getElementById('priceSlider');
    if(priceSlider) priceSlider.addEventListener('input', (e) => document.getElementById('priceValue').innerText = e.target.value);

    function applyFiltersAndSort() {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products;
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

    const mainOverlay = document.getElementById('mainOverlay');
    function closeAllModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); document.getElementById('sideCart').classList.remove('active'); mainOverlay.classList.remove('active'); }
    mainOverlay.addEventListener('click', closeAllModals); document.querySelectorAll('.close-modal, .close-cart').forEach(b => b.addEventListener('click', closeAllModals));

    document.getElementById('authToggle').addEventListener('click', e => { e.preventDefault(); closeAllModals(); if (currentUser) document.getElementById('profileModal').classList.add('active'); else document.getElementById('authModal').classList.add('active'); mainOverlay.classList.add('active'); });
    document.getElementById('tabRegister').addEventListener('click', () => { document.getElementById('tabLogin').classList.remove('active'); document.getElementById('tabRegister').classList.add('active'); document.getElementById('formLogin').classList.remove('active'); document.getElementById('formRegister').classList.add('active'); });
    document.getElementById('tabLogin').addEventListener('click', () => { document.getElementById('tabRegister').classList.remove('active'); document.getElementById('tabLogin').classList.add('active'); document.getElementById('formRegister').classList.remove('active'); document.getElementById('formLogin').classList.add('active'); });

    document.querySelectorAll('.profile-tab').forEach(t => t.addEventListener('click', e => { document.querySelectorAll('.profile-tab').forEach(x => x.classList.remove('active')); document.querySelectorAll('.profile-content').forEach(c => c.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.getAttribute('data-target')).classList.add('active'); }));

    document.getElementById('formRegister').addEventListener('submit', e => { e.preventDefault(); const n = document.getElementById('registerName').value, m = document.getElementById('registerEmail').value, p = document.getElementById('registerPassword').value; if (users.find(u => u.email === m)) return alert("E-posta kayıtlı!"); currentUser = { name: n, email: m, password: p, phone: "", city: "", district: "", address: "" }; users.push(currentUser); localStorage.setItem('gnl_users', JSON.stringify(users)); localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); updateUserUI(); closeAllModals(); alert("Hoş geldiniz!"); });
    document.getElementById('formLogin').addEventListener('submit', e => { e.preventDefault(); const m = document.getElementById('loginEmail').value, p = document.getElementById('loginPassword').value; const u = users.find(x => x.email === m && x.password === p); if (u) { currentUser = u; localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); updateUserUI(); closeAllModals(); alert("Giriş başarılı!"); } else alert("Hatalı e-posta/şifre!"); });
    document.getElementById('logoutBtn').addEventListener('click', () => { currentUser = null; localStorage.removeItem('gnl_currentUser'); updateUserUI(); closeAllModals(); showHome(); });

    document.getElementById('saveInfoBtn').addEventListener('click', () => { if (!currentUser) return; currentUser.name = document.getElementById('profileNameInput').value; currentUser.phone = document.getElementById('profilePhoneInput').value; updateUserInStorage(); alert("Kişisel bilgileriniz kaydedildi."); });
    document.getElementById('saveAddressBtn').addEventListener('click', () => { if (!currentUser) return; currentUser.city = document.getElementById('profileCityInput').value; currentUser.district = document.getElementById('profileDistrictInput').value; currentUser.address = document.getElementById('profileAddressInput').value; updateUserInStorage(); alert("Adresiniz kaydedildi."); });

    function updateUserInStorage() { localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); const idx = users.findIndex(u => u.email === currentUser.email); if (idx !== -1) { users[idx] = currentUser; localStorage.setItem('gnl_users', JSON.stringify(users)); } }

    function updateUserUI() { const uIcon = document.getElementById('userIcon'); if (currentUser) { uIcon.setAttribute('fill', 'currentColor'); document.getElementById('profileNameInput').value = currentUser.name; document.getElementById('profileEmailInput').value = currentUser.email; document.getElementById('profilePhoneInput').value = currentUser.phone || ""; document.getElementById('profileCityInput').value = currentUser.city || ""; document.getElementById('profileDistrictInput').value = currentUser.district || ""; document.getElementById('profileAddressInput').value = currentUser.address || ""; } else { uIcon.setAttribute('fill', 'none'); } }

    function phoneMask(e) { let v = e.target.value.replace(/\D/g, ''); if (v.length > 0) { if (v[0] !== '0') v = '0' + v; } if (v.length > 1) { if (v[1] !== '5') v = '05' + v.substring(2); } e.target.value = v.substring(0, 11); }
    document.getElementById('profilePhoneInput').addEventListener('input', phoneMask); document.getElementById('checkoutPhone').addEventListener('input', phoneMask);

    const cartItemsContainer = document.getElementById('cartItemsContainer'); const cartTotalPrice = document.getElementById('cartTotalPrice');
    window.addToCart = (id) => { products = JSON.parse(localStorage.getItem('gnl_products')) || products; const p = products.find(x => x.id === id); cart.push(p); updateCartUI(); closeAllModals(); document.getElementById('sideCart').classList.add('active'); mainOverlay.classList.add('active'); };
    document.getElementById('addToCartDetailBtn').addEventListener('click', () => { if (currentlyViewingProduct) addToCart(currentlyViewingProduct.id); });
    document.getElementById('buyNowBtn').addEventListener('click', () => { if (currentlyViewingProduct) { if (!cart.find(p => p.id === currentlyViewingProduct.id)) { cart.push(currentlyViewingProduct); updateCartUI(); } openCheckout(); } });
    document.getElementById('cartToggle').addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); document.getElementById('sideCart').classList.add('active'); mainOverlay.classList.add('active'); });

    function updateCartUI() { document.getElementById('cartBadge').innerText = cart.length; cartItemsContainer.innerHTML = ''; cartTotalValue = 0; if (cart.length === 0) { cartItemsContainer.innerHTML = '<p style="color:#666; text-align:center;">Sepetiniz boş.</p>'; cartTotalPrice.innerText = '0.00 ₺'; return; } cart.forEach(i => { cartTotalValue += i.price; cartItemsContainer.insertAdjacentHTML('beforeend', `<div class="cart-item"><img src="${i.img}"><div><div style="font-weight:500;">${i.title}</div><div style="color:var(--text-secondary);">${i.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div></div></div>`); }); cartTotalPrice.innerText = cartTotalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺'; }

    function openCheckout() { if (cart.length === 0) return alert("Sepetiniz boş."); if (!currentUser) { alert("Sipariş vermek için lütfen önce giriş yapın."); document.getElementById('authToggle').click(); return; } document.getElementById('checkoutName').value = document.getElementById('profileNameInput').value || ""; document.getElementById('checkoutPhone').value = document.getElementById('profilePhoneInput').value || ""; document.getElementById('checkoutCity').value = document.getElementById('profileCityInput').value || ""; document.getElementById('checkoutDistrict').value = document.getElementById('profileDistrictInput').value || ""; document.getElementById('checkoutAddress').value = document.getElementById('profileAddressInput').value || ""; closeAllModals(); document.getElementById('checkoutTotal').innerText = cartTotalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺'; document.getElementById('checkoutModal').classList.add('active'); mainOverlay.classList.add('active'); }
    document.getElementById('proceedToCheckoutBtn').addEventListener('click', openCheckout);
    document.getElementById('cardNumberInput').addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
    document.getElementById('expDateInput').addEventListener('input', function() { let v = this.value.replace(/\D/g, ''); this.value = v.length > 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v; });

    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault(); if (document.getElementById('checkoutPhone').value.length < 11) return alert("Telefon eksik."); if (document.getElementById('cardNumberInput').value.length !== 16) return alert("Kart numarası 16 hane olmalıdır!");
        let o = JSON.parse(localStorage.getItem('gnl_orders')) || []; 
        o.push({ id: "GNL-" + Math.floor(100000 + Math.random() * 900000), date: new Date().toLocaleString('tr-TR'), status: "Sipariş Alındı", customer: { name: document.getElementById('checkoutName').value, email: currentUser.email, phone: document.getElementById('checkoutPhone').value, city: document.getElementById('checkoutCity').value, district: document.getElementById('checkoutDistrict').value, address: document.getElementById('checkoutAddress').value }, items: [...cart], total: cartTotalValue }); 
        localStorage.setItem('gnl_orders', JSON.stringify(o));
        alert("Sipariş alındı!"); cart = []; updateCartUI(); closeAllModals(); showHome();
    });

    updateUserUI(); showHome();
}