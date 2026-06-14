const defaultProducts = [
    { id: 1, category: "Mutfak", title: "Minimal Seramik Kase Seti", price: 899.90, material: "Seramik", isFeatured: true, sales: 150, stock: 15, img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop", gallery: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop"] },
    { id: 2, category: "Ev Yaşam", title: "Kristal Şarap Kadehleri", price: 1299.00, material: "Cam", isFeatured: false, sales: 320, stock: 5, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop", gallery: ["https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop"] },
    { id: 3, category: "Ev Yaşam", title: "Beyaz Porselen Koleksiyonu", price: 1499.00, material: "Porselen", isFeatured: true, sales: 85, stock: 0, img: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=800&auto=format&fit=crop" },
    { id: 4, category: "Mutfak", title: "Artisan Karıştırma Kabı", price: 649.90, material: "Seramik", isFeatured: false, sales: 210, stock: 8, img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop" }
];

let products = JSON.parse(localStorage.getItem('gnl_products'));
if (!products || products.length === 0) { products = defaultProducts; localStorage.setItem('gnl_products', JSON.stringify(products)); }

let users = JSON.parse(localStorage.getItem('gnl_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('gnl_currentUser')) || null;

// --- YÖNETİM PANELİ (ADMIN) İŞLEVLERİ ---
if (document.querySelector('.admin-container')) {
    const tabProductsBtn = document.getElementById('tabProductsBtn');
    const tabOrdersBtn = document.getElementById('tabOrdersBtn');
    const tabMessagesBtn = document.getElementById('tabMessagesBtn');
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');
    const messagesSection = document.getElementById('messagesSection');

    function switchTab(activeBtn, activeSec) {
        [tabProductsBtn, tabOrdersBtn, tabMessagesBtn].forEach(b => { b.classList.remove('active'); });
        [productsSection, ordersSection, messagesSection].forEach(s => s.classList.remove('active'));
        activeBtn.classList.add('active');
        activeSec.classList.add('active');
    }

    tabProductsBtn.addEventListener('click', () => { switchTab(tabProductsBtn, productsSection); renderAdminProducts(); });
    tabOrdersBtn.addEventListener('click', () => { switchTab(tabOrdersBtn, ordersSection); renderAdminOrders(); });
    tabMessagesBtn.addEventListener('click', () => { switchTab(tabMessagesBtn, messagesSection); renderAdminMessages(); });

    let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];

    function renderAdminProducts() {
        adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
        const tbody = document.getElementById('adminProductTable');
        tbody.innerHTML = '';
        document.getElementById('totalProductCount').innerText = adminProducts.length;

        adminProducts.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.img}" class="product-img-preview" alt="görsel" onerror="this.src='https://via.placeholder.com/50?text=Yok'"></td>
                <td style="font-weight: 500; color: #111;">${p.title}<br>
                    <label class="checkbox-label">
                        <input type="checkbox" onchange="updateFeatured(${p.id}, this.checked)" ${p.isFeatured ? 'checked' : ''}> Öne Çıkan
                    </label>
                </td>
                <td style="color: #475569;">${p.category}</td>
                <td style="font-weight: 500;">${p.price.toLocaleString('tr-TR')} ₺</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="number" class="stock-input" value="${p.stock}" min="0" onchange="updateStock(${p.id}, this)">
                        <span style="color:${p.stock <= 0 ? '#ef4444' : '#10b981'}; font-weight:600; font-size:0.85rem; background: ${p.stock <= 0 ? '#fef2f2' : '#d1fae5'}; padding: 2px 6px; border-radius: 4px;">${p.stock <= 0 ? 'Tükendi' : 'Stokta'}</span>
                    </div>
                </td>
                <td><button class="btn-danger-sm" onclick="deleteProduct(${p.id})">SİL</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.updateFeatured = (id, checked) => {
        let idx = adminProducts.findIndex(p => p.id === id);
        if (idx !== -1) { adminProducts[idx].isFeatured = checked; localStorage.setItem('gnl_products', JSON.stringify(adminProducts)); }
    };

    window.updateStock = (id, el) => {
        let s = parseInt(el.value) || 0; el.value = s;
        let idx = adminProducts.findIndex(p => p.id === id);
        if (idx !== -1) {
            adminProducts[idx].stock = s; localStorage.setItem('gnl_products', JSON.stringify(adminProducts));
            let span = el.nextElementSibling;
            span.innerText = s <= 0 ? 'Tükendi' : 'Stokta'; 
            span.style.color = s <= 0 ? '#ef4444' : '#10b981';
            span.style.background = s <= 0 ? '#fef2f2' : '#d1fae5';
            el.style.backgroundColor = '#e8f5e9'; setTimeout(() => el.style.backgroundColor = '', 500);
        }
    };

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const gallery = document.getElementById('pGallery').value.split(',').map(i => i.trim()).filter(i => i !== "");
        const newProduct = {
            id: Date.now(), title: document.getElementById('pTitle').value, price: parseFloat(document.getElementById('pPrice').value),
            stock: parseInt(document.getElementById('pStock').value), category: document.getElementById('pCategory').value,
            img: gallery.length > 0 ? gallery[0] : "", gallery: gallery, isFeatured: false, sales: 0
        };
        adminProducts.push(newProduct); localStorage.setItem('gnl_products', JSON.stringify(adminProducts));
        e.target.reset(); renderAdminProducts(); alert("Ürün eklendi!");
    });

    window.deleteProduct = (id) => {
        if (confirm("Emin misiniz?")) { adminProducts = adminProducts.filter(p => p.id !== id); localStorage.setItem('gnl_products', JSON.stringify(adminProducts)); renderAdminProducts(); }
    };

    function renderAdminOrders() {
        const orders = JSON.parse(localStorage.getItem('gnl_orders')) || [];
        const tbody = document.getElementById('adminOrderTable');
        document.getElementById('totalOrderCount').innerText = orders.length;
        tbody.innerHTML = orders.length === 0 ? '<tr><td colspan="8" style="text-align:center; padding: 2rem; color: #64748b;">Sipariş yok.</td></tr>' : '';
        orders.slice().reverse().forEach(o => {
            const items = o.items.map(i => `<div style="margin-bottom:4px;">• ${i.title}</div>`).join('');
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td><strong>${o.id}</strong></td>
                    <td style="color:#64748b; font-size:0.85rem;">${o.date}</td>
                    <td><strong>${o.customer.name}</strong><br><span style="font-size:0.85rem; color:#64748b;">${o.customer.phone}</span></td>
                    <td><strong>${o.customer.city}/${o.customer.district}</strong><br><span style="color:#64748b; font-size:0.85rem;">${o.customer.address}</span></td>
                    <td style="font-size:0.85rem;">${items}</td>
                    <td style="font-weight:600; color:#10b981;">${o.total.toLocaleString('tr-TR')} ₺</td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus('${o.id}', this)">
                            <option value="Sipariş Alındı" ${o.status === 'Sipariş Alındı' ? 'selected' : ''}>Sipariş Alındı</option>
                            <option value="Hazırlanıyor" ${o.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                            <option value="Kargoya Verildi" ${o.status === 'Kargoya Verildi' ? 'selected' : ''}>Kargoya Verildi</option>
                            <option value="Teslim Edildi" ${o.status === 'Teslim Edildi' ? 'selected' : ''}>Teslim Edildi</option>
                        </select>
                    </td>
                    <td><button class="btn-tab" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="openAdminMessageForm('${o.customer.email}', 'Sipariş ${o.id}')">✉️ MESAJ</button></td>
                </tr>`);
        });
    }

    window.updateOrderStatus = (id, el) => {
        let orders = JSON.parse(localStorage.getItem('gnl_orders')) || [];
        let idx = orders.findIndex(o => o.id === id);
        if (idx !== -1) { orders[idx].status = el.value; localStorage.setItem('gnl_orders', JSON.stringify(orders)); el.style.borderColor = '#10b981'; setTimeout(() => el.style.borderColor = 'var(--border-color)', 1000); }
    };

    let replyId = null;
    document.getElementById('newMessageBtn').addEventListener('click', () => window.openAdminMessageForm('',''));
    document.getElementById('adminMsgCancelBtn').addEventListener('click', () => { document.getElementById('adminMessageForm').style.display = 'none'; replyId = null; });

    window.openAdminMessageForm = (email, subj) => {
        replyId = null; document.getElementById('adminMessageFormTitle').innerText = 'Yeni Mesaj';
        document.getElementById('adminMsgRecipient').value = email; document.getElementById('adminMsgRecipient').readOnly = !!email;
        document.getElementById('adminMsgSubject').value = subj; document.getElementById('adminMsgText').value = '';
        document.getElementById('adminMessageForm').style.display = 'block'; switchTab(tabMessagesBtn, messagesSection); renderAdminMessages();
    };

    window.openReplyForm = (id, email) => {
        replyId = id; document.getElementById('adminMessageFormTitle').innerText = 'Yanıt Yaz';
        document.getElementById('adminMsgRecipient').value = email; document.getElementById('adminMsgRecipient').readOnly = true;
        document.getElementById('adminMsgSubject').value = ''; document.getElementById('adminMsgText').value = '';
        document.getElementById('adminMessageForm').style.display = 'block'; document.getElementById('adminMsgText').focus();
    };

    document.getElementById('adminMsgSendBtn').addEventListener('click', () => {
        const to = document.getElementById('adminMsgRecipient').value.trim(), subj = document.getElementById('adminMsgSubject').value.trim(), txt = document.getElementById('adminMsgText').value.trim();
        if (!to || !txt) return alert('Eksik bilgi girdiniz.');
        let msgs = JSON.parse(localStorage.getItem('gnl_messages')) || [];
        if (replyId) {
            let idx = msgs.findIndex(m => m.id === replyId);
            if (idx !== -1) { msgs[idx].replies = msgs[idx].replies || []; msgs[idx].replies.push({ date: new Date().toLocaleString('tr-TR'), text: txt }); localStorage.setItem('gnl_messages', JSON.stringify(msgs)); }
        } else {
            const usr = (JSON.parse(localStorage.getItem('gnl_users'))||[]).find(u => u.email === to);
            if (!usr) return alert('Kullanıcı bulunamadı.');
            msgs.push({ id: 'ADM-'+Date.now(), userId: to, userName: usr.name, date: new Date().toLocaleString('tr-TR'), subject: subj||'Yönetici', text: '📣 <strong>Admin:</strong><br>', adminInitiated: true, replies: [{date: new Date().toLocaleString('tr-TR'), text: txt}] });
            localStorage.setItem('gnl_messages', JSON.stringify(msgs));
        }
        document.getElementById('adminMessageForm').style.display = 'none'; renderAdminMessages(); alert('Gönderildi!');
    });

    function renderAdminMessages() {
        const msgs = JSON.parse(localStorage.getItem('gnl_messages')) || [];
        const tbody = document.getElementById('adminMessageTable');
        document.getElementById('totalMessageCount').innerText = msgs.length;
        tbody.innerHTML = msgs.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">Mesaj yok.</td></tr>' : '';
        msgs.slice().reverse().forEach(m => {
            const replied = m.replies && m.replies.length > 0;
            let repHtml = replied ? m.replies.map(r => `<div style="margin-top:5px; padding:6px; background:#e8f5e9; border-left:3px solid #2ecc71; font-size:0.85rem;"><strong>Admin:</strong> ${r.text}<br><small style="color:#888">${r.date}</small></div>`).join('') : '';
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td style="color:#64748b; font-size:0.85rem;">${m.date}</td>
                    <td><strong>${m.userName}</strong><br><span style="font-size:0.85rem; color:#64748b;">${m.userId}</span></td>
                    <td><strong>${m.subject}</strong>${m.adminInitiated ? '<br><span style="font-size:0.75rem;background:#3b82f6;color:#fff;padding:2px 6px;border-radius:3px;">Admin Başlattı</span>' : ''}</td>
                    <td style="max-width:280px; font-size:0.9rem;">${m.text}${repHtml}</td>
                    <td><span style="background:${replied ? '#10b981' : '#f59e0b'}; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">${replied ? 'Yanıtlandı' : 'Bekliyor'}</span></td>
                    <td><button class="btn-tab" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="openReplyForm('${m.id}','${m.userId}')">✏️ YANITLA</button></td>
                </tr>`);
        });
    }

    renderAdminProducts();
}

// --- MÜŞTERİ ARAYÜZÜ (FRONTEND) İŞLEVLERİ ---
if (document.getElementById('homeView')) {
    let cart = [], currentCategory = "Tümü", currentSortOption = "featured", currentlyViewingProduct = null, autoScrollTimer;
    const homeView = document.getElementById('homeView'), shopView = document.getElementById('shopView'), detailView = document.getElementById('productDetailView');
    const filterToggleBtn = document.getElementById('filterToggleBtn'), filterContent = document.getElementById('filterContent');
    const sortToggleBtn = document.getElementById('sortToggleBtn'), sortContent = document.getElementById('sortContent');

    function closeAllDropdowns() {
        filterContent.style.display = 'none'; filterToggleBtn.querySelector('.toggle-icon').classList.remove('rotated');
        sortContent.style.display = 'none'; sortToggleBtn.querySelector('.toggle-icon').classList.remove('rotated');
    }
    filterToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); const h = filterContent.style.display === 'none' || filterContent.style.display === ''; closeAllDropdowns(); if (h) { filterContent.style.display = 'block'; filterToggleBtn.querySelector('.toggle-icon').classList.add('rotated'); } });
    sortToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); const h = sortContent.style.display === 'none' || sortContent.style.display === ''; closeAllDropdowns(); if (h) { sortContent.style.display = 'block'; sortToggleBtn.querySelector('.toggle-icon').classList.add('rotated'); } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.custom-dropdown-wrapper')) closeAllDropdowns(); });

    function showHome() { closeAllDropdowns(); shopView.style.display = 'none'; detailView.style.display = 'none'; homeView.style.display = 'block'; renderFeatured(); }
    function showShop(cat = "Tümü") { closeAllDropdowns(); homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; currentCategory = cat; document.getElementById('categoryTitle').innerText = cat; applyFiltersAndSort(); }

    window.showProductDetail = (id) => {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products; currentlyViewingProduct = products.find(p => p.id === id);
        if (!currentlyViewingProduct) return;
        homeView.style.display = 'none'; shopView.style.display = 'none'; detailView.style.display = 'block'; window.scrollTo(0, 0);
        document.getElementById('detailCategoryBreadcrumb').innerText = currentlyViewingProduct.category;
        
        let media = currentlyViewingProduct.gallery && currentlyViewingProduct.gallery.length > 0 ? currentlyViewingProduct.gallery : [currentlyViewingProduct.img];
        const img = document.getElementById('detailImg'), vid = document.getElementById('detailVideo'), gallery = document.getElementById('thumbnailGallery');
        
        function setMedia(url) {
            if (url.toLowerCase().match(/\.(mp4|webm|ogg)$/i)) { img.style.display = 'none'; vid.style.display = 'block'; vid.src = url; vid.load(); } 
            else { vid.style.display = 'none'; img.style.display = 'block'; img.src = url; }
        }
        setMedia(media[0]);
        if (media.length > 1) {
            gallery.style.display = 'flex';
            gallery.innerHTML = media.map((u, i) => u.toLowerCase().match(/\.(mp4)$/i) ? `<video src="${u}" class="thumbnail ${i===0?'active':''}" data-url="${u}" muted></video>` : `<img src="${u}" class="thumbnail ${i===0?'active':''}" data-url="${u}">`).join('');
            gallery.querySelectorAll('.thumbnail').forEach(t => t.addEventListener('click', (e) => { gallery.querySelectorAll('.thumbnail').forEach(th => th.classList.remove('active')); e.target.classList.add('active'); setMedia(e.target.getAttribute('data-url')); }));
        } else { gallery.style.display = 'none'; gallery.innerHTML = ''; }

        document.getElementById('detailTitle').innerText = currentlyViewingProduct.title;
        document.getElementById('detailCategoryText').innerText = currentlyViewingProduct.category + (currentlyViewingProduct.material ? " - " + currentlyViewingProduct.material : "");
        document.getElementById('detailMaterial').innerText = currentlyViewingProduct.material || 'Belirtilmemiş';
        document.getElementById('detailPrice').innerText = currentlyViewingProduct.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " ₺";

        const stat = document.getElementById('detailStockStatus'), buyBtn = document.getElementById('buyNowBtn'), cartBtn = document.getElementById('addToCartDetailBtn');
        if (currentlyViewingProduct.stock >= 10) { stat.innerText = 'Stokta'; stat.style.color = '#2ecc71'; buyBtn.disabled = cartBtn.disabled = false; }
        else if (currentlyViewingProduct.stock > 0) { stat.innerText = `Stokta (Son ${currentlyViewingProduct.stock} ürün)`; stat.style.color = '#e67e22'; buyBtn.disabled = cartBtn.disabled = false; }
        else { stat.innerText = 'Tükendi'; stat.style.color = '#e74c3c'; buyBtn.disabled = cartBtn.disabled = true; }

        let similar = products.filter(p => p.category === currentlyViewingProduct.category && p.id !== currentlyViewingProduct.id);
        if (similar.length === 0) similar = products.filter(p => p.id !== currentlyViewingProduct.id).slice(0, 3);
        document.getElementById('similarProductsGrid').innerHTML = similar.slice(0, 3).map(createProductCard).join('');
    };

    function createProductCard(p) {
        const out = p.stock <= 0, low = p.stock > 0 && p.stock < 10;
        let badge = out ? '<div class="out-of-stock-badge">TÜKENDİ</div>' : (low ? `<div class="low-stock-badge">SON ${p.stock} ÜRÜN</div>` : '');
        return `<div class="product-card" onclick="showProductDetail(${p.id})">
                    <div class="img-container">${badge}<img src="${p.img}" class="product-image" onerror="this.src='https://via.placeholder.com/320'"></div>
                    <div class="product-category">${p.category}${p.material ? ' - ' + p.material : ''}</div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-footer">
                        <div class="price">${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})" ${out ? 'disabled' : ''}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                </div>`;
    }

    function renderProducts(items) {
        document.getElementById('productCount').innerText = items.length;
        document.getElementById('productGrid').innerHTML = items.length === 0 ? '<p style="grid-column: 1/-1; text-align:center; color:#666;">Kriterlere uygun ürün bulunamadı.</p>' : items.map(createProductCard).join('');
    }

    function renderFeatured() {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products;
        const feats = products.filter(p => p.isFeatured), grid = document.getElementById('featuredGrid'), dots = document.getElementById('carouselDots');
        if (!grid) return;
        grid.innerHTML = feats.map(createProductCard).join('');
        dots.innerHTML = feats.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');
        const dEls = document.querySelectorAll('.carousel-dot');
        dEls.forEach(d => d.addEventListener('click', (e) => { const idx = parseInt(e.target.getAttribute('data-index')); grid.scrollTo({ left: idx * (grid.querySelector('.product-card').offsetWidth + 32), behavior: 'smooth' }); }));
        grid.addEventListener('scroll', () => { const i = Math.round(grid.scrollLeft / (grid.querySelector('.product-card').offsetWidth + 32)); dEls.forEach((d, idx) => d.classList.toggle('active', idx === i)); });
        clearInterval(autoScrollTimer);
        autoScrollTimer = setInterval(() => { if (!grid.querySelector('.product-card')) return; grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 10 ? grid.scrollTo({ left: 0, behavior: 'smooth' }) : grid.scrollBy({ left: grid.querySelector('.product-card').offsetWidth + 32, behavior: 'smooth' }); }, 3000);
        grid.addEventListener('mouseenter', () => clearInterval(autoScrollTimer));
    }

    const priceSlider = document.getElementById('priceSlider');
    priceSlider.addEventListener('input', (e) => document.getElementById('priceValue').innerText = e.target.value);

    function applyFiltersAndSort() {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products;
        const maxP = parseFloat(priceSlider.value), mats = Array.from(document.querySelectorAll('.material-filter:checked')).map(cb => cb.value);
        let f = products.filter(p => (currentCategory === "Tümü" || p.category === currentCategory) && p.price <= maxP && (mats.length === 0 || mats.includes(p.material)));
        if (currentSortOption === 'priceLow') f.sort((a, b) => a.price - b.price);
        else if (currentSortOption === 'priceHigh') f.sort((a, b) => b.price - a.price);
        else if (currentSortOption === 'bestSeller') f.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        else if (currentSortOption === 'featured') f.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        renderProducts(f);
    }
    document.getElementById('applyFiltersBtn').addEventListener('click', () => { applyFiltersAndSort(); closeAllDropdowns(); });
    document.querySelectorAll('.sort-option').forEach(b => b.addEventListener('click', (e) => { document.querySelectorAll('.sort-option').forEach(x => x.classList.remove('active')); e.target.classList.add('active'); currentSortOption = e.target.getAttribute('data-sort'); document.getElementById('currentSortText').innerText = e.target.innerText; applyFiltersAndSort(); closeAllDropdowns(); }));

    document.getElementById('homeLink').addEventListener('click', e => { e.preventDefault(); showHome(); });
    document.getElementById('exploreBtn').addEventListener('click', () => showShop());
    document.getElementById('navCollectionBtn').addEventListener('click', e => { e.preventDefault(); showShop(); });
    document.getElementById('backToCollection').addEventListener('click', e => { e.preventDefault(); showShop(); });
    document.querySelectorAll('.nav-item:not(#navCollectionBtn), .footer-category-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); showShop(e.target.getAttribute('data-category')); window.scrollTo(0,0); }));
    document.getElementById('searchInput').addEventListener('input', e => { closeAllDropdowns(); const t = e.target.value.toLowerCase(); if (t.length > 0) { homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; renderProducts(products.filter(p => p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t))); } else showShop(currentCategory); });

    const mainOverlay = document.getElementById('mainOverlay');
    function closeAllModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); document.getElementById('sideCart').classList.remove('active'); mainOverlay.classList.remove('active'); }
    mainOverlay.addEventListener('click', closeAllModals); document.querySelectorAll('.close-modal, .close-cart').forEach(b => b.addEventListener('click', closeAllModals));

    ['Contact', 'Shipping', 'Returns'].forEach(m => document.getElementById('footer' + m + 'Btn').addEventListener('click', e => { e.preventDefault(); closeAllModals(); document.getElementById(m.toLowerCase() + 'Modal').classList.add('active'); mainOverlay.classList.add('active'); }));

    document.getElementById('authToggle').addEventListener('click', e => { e.preventDefault(); closeAllModals(); if (currentUser) document.getElementById('profileModal').classList.add('active'); else document.getElementById('authModal').classList.add('active'); mainOverlay.classList.add('active'); });

    document.querySelectorAll('.profile-tab').forEach(t => t.addEventListener('click', e => {
        document.querySelectorAll('.profile-tab').forEach(x => x.classList.remove('active')); document.querySelectorAll('.profile-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active'); document.getElementById(e.target.getAttribute('data-target')).classList.add('active');
        if (e.target.getAttribute('data-target') === 'ordersContent') renderUserOrders();
        if (e.target.getAttribute('data-target') === 'messagesContent') renderUserMessages();
    }));

    document.getElementById('tabRegister').addEventListener('click', () => { document.getElementById('tabLogin').classList.remove('active'); document.getElementById('tabRegister').classList.add('active'); document.getElementById('formLogin').classList.remove('active'); document.getElementById('formRegister').classList.add('active'); });
    document.getElementById('tabLogin').addEventListener('click', () => { document.getElementById('tabRegister').classList.remove('active'); document.getElementById('tabLogin').classList.add('active'); document.getElementById('formRegister').classList.remove('active'); document.getElementById('formLogin').classList.add('active'); });

    document.getElementById('formRegister').addEventListener('submit', e => {
        e.preventDefault(); const n = document.getElementById('registerName').value, m = document.getElementById('registerEmail').value, p = document.getElementById('registerPassword').value;
        if (users.find(u => u.email === m)) return alert("Bu e-posta kayıtlı!");
        currentUser = { name: n, email: m, password: p, phone: "", city: "", district: "", address: "" }; users.push(currentUser);
        localStorage.setItem('gnl_users', JSON.stringify(users)); localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser));
        updateUserUI(); closeAllModals(); alert("Hoş geldiniz!");
    });

    document.getElementById('formLogin').addEventListener('submit', e => {
        e.preventDefault(); const m = document.getElementById('loginEmail').value, p = document.getElementById('loginPassword').value;
        const u = users.find(x => x.email === m && x.password === p);
        if (u) { currentUser = u; localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); updateUserUI(); closeAllModals(); alert("Giriş başarılı!"); } else alert("Hatalı bilgi!");
    });

    document.getElementById('logoutBtn').addEventListener('click', () => { currentUser = null; localStorage.removeItem('gnl_currentUser'); updateUserUI(); closeAllModals(); showHome(); });

    document.getElementById('saveInfoBtn').addEventListener('click', () => { if (!currentUser) return; currentUser.name = document.getElementById('profileNameInput').value; currentUser.phone = document.getElementById('profilePhoneInput').value; updateUserInStorage(); alert("Kaydedildi."); });
    document.getElementById('saveAddressBtn').addEventListener('click', () => { if (!currentUser) return; currentUser.city = document.getElementById('profileCityInput').value; currentUser.district = document.getElementById('profileDistrictInput').value; currentUser.address = document.getElementById('profileAddressInput').value; updateUserInStorage(); alert("Adres kaydedildi."); });

    function updateUserInStorage() { localStorage.setItem('gnl_currentUser', JSON.stringify(currentUser)); const idx = users.findIndex(u => u.email === currentUser.email); if (idx !== -1) { users[idx] = currentUser; localStorage.setItem('gnl_users', JSON.stringify(users)); } }

    function updateUserUI() {
        const uIcon = document.getElementById('userIcon');
        if (currentUser) {
            uIcon.setAttribute('fill', 'currentColor'); document.getElementById('profileNameInput').value = currentUser.name; document.getElementById('profileEmailInput').value = currentUser.email;
            document.getElementById('profilePhoneInput').value = currentUser.phone || ""; document.getElementById('profileCityInput').value = currentUser.city || "";
            document.getElementById('profileDistrictInput').value = currentUser.district || ""; document.getElementById('profileAddressInput').value = currentUser.address || "";
            renderUserOrders(); renderUserMessages();
        } else { uIcon.setAttribute('fill', 'none'); document.getElementById('userOrdersList').innerHTML = ""; document.getElementById('userMessagesList').innerHTML = ""; }
    }

    function renderUserOrders() {
        const o = (JSON.parse(localStorage.getItem('gnl_orders')) || []).filter(x => x.customer.email === currentUser.email), c = document.getElementById('userOrdersList');
        if (o.length === 0) { c.innerHTML = '<p style="text-align:center; color:#666; margin-top:1rem;">Henüz siparişiniz bulunmamaktadır.</p>'; return; }
        c.innerHTML = o.slice().reverse().map(ord => `
            <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">
                    <div><strong>Sipariş No: ${ord.id}</strong><br><span style="color:#666; font-size:0.85rem;">${ord.date}</span></div>
                    <div style="background:${ord.status === 'Hazırlanıyor' ? '#e67e22' : (ord.status === 'Kargoya Verildi' ? '#3498db' : (ord.status === 'Teslim Edildi' ? '#2ecc71' : '#f1c40f'))}; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">${ord.status || 'Sipariş Alındı'}</div>
                </div>
                <div style="margin-bottom: 0.5rem; color: #444; font-size: 0.9rem;">${ord.items.map(i => '&bull; ' + i.title).join('<br>')}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem;">
                    <button onclick="openOrderQuestionModal('${ord.id}', '${ord.items.map(i => i.title).join(', ').replace(/'/g, "&apos;")}')" style="background:none; border:1px solid var(--border-color); padding:0.4rem 0.9rem; border-radius:4px; font-family:var(--font-body); font-size:0.82rem; cursor:pointer; color:var(--text-secondary); transition:0.2s;" onmouseover="this.style.borderColor='var(--text-primary)';this.style.color='var(--text-primary)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.color='var(--text-secondary)'">Sipariş Hakkında Soru Sor</button>
                    <span style="color: var(--text-primary); font-weight: 600;">Toplam: ${ord.total.toLocaleString('tr-TR')} ₺</span>
                </div>
            </div>`).join('');
    }

    window.openOrderQuestionModal = (id, items) => { if (!currentUser) return alert('Giriş yapın.'); document.getElementById('orderQuestionOrderInfo').innerHTML = `<strong>Sipariş No:</strong> ${id}<br><span style="color:var(--text-secondary);">${items}</span>`; document.getElementById('orderQuestionText').value = ''; document.getElementById('orderQuestionForm').dataset.orderId = id; closeAllModals(); document.getElementById('orderQuestionModal').classList.add('active'); mainOverlay.classList.add('active'); };
    document.getElementById('orderQuestionForm').addEventListener('submit', (e) => { e.preventDefault(); if (!currentUser || !document.getElementById('orderQuestionText').value.trim()) return; let m = JSON.parse(localStorage.getItem('gnl_messages')) || []; m.push({ id: 'MSG-' + Date.now(), userId: currentUser.email, userName: currentUser.name, date: new Date().toLocaleString('tr-TR'), subject: 'Sipariş Sorusu: ' + e.target.dataset.orderId, orderId: e.target.dataset.orderId, text: document.getElementById('orderQuestionText').value.trim(), replies: [] }); localStorage.setItem('gnl_messages', JSON.stringify(m)); e.target.reset(); closeAllModals(); alert('Sorunuz gönderildi!'); renderUserMessages(); });
    document.getElementById('contactForm').addEventListener('submit', (e) => { e.preventDefault(); if (!currentUser) { alert("Giriş yapın."); closeAllModals(); document.getElementById('authToggle').click(); return; } let m = JSON.parse(localStorage.getItem('gnl_messages')) || []; m.push({ id: "MSG-" + Date.now(), userId: currentUser.email, userName: currentUser.name, date: new Date().toLocaleString('tr-TR'), subject: document.getElementById('contactSubject').value, text: document.getElementById('contactMessage').value, replies: [] }); localStorage.setItem('gnl_messages', JSON.stringify(m)); e.target.reset(); alert("Mesajınız gönderildi!"); closeAllModals(); renderUserMessages(); });

    function renderUserMessages() {
        const msgs = (JSON.parse(localStorage.getItem('gnl_messages')) || []).filter(m => m.userId === currentUser.email), c = document.getElementById('userMessagesList');
        if (msgs.length === 0) { c.innerHTML = '<p style="text-align:center; color:#666; margin-top:1rem;">Henüz bir mesajınız bulunmamaktadır.</p>'; return; }
        c.innerHTML = msgs.slice().reverse().map(m => {
            const repls = m.replies && m.replies.length > 0;
            let bHtml = m.adminInitiated ? `<div style="padding:10px; background:#eef6ff; border-left:3px solid #3498db; border-radius:4px; margin-bottom:0.5rem;"><strong style="color:#3498db; font-size:0.85rem;">📣 Satıcı Mesajı</strong><br><span style="font-size:0.95rem; color:#444;">${repls ? m.replies[0].text : ''}</span></div>${repls && m.replies.length > 1 ? m.replies.slice(1).map(r => `<div style="margin-top:8px; padding:10px; background:#f4f6f8; border-left:3px solid #2ecc71; border-radius:4px;"><strong style="color:#2ecc71; font-size:0.85rem;">Satıcı Ek Mesajı:</strong><br><span style="font-size:0.9rem; color:#444;">${r.text}</span><br><small style="color:#888;">${r.date}</small></div>`).join('') : ''}` : `<div style="margin-bottom:0.5rem; color:#444; font-size:0.95rem;">${m.text}</div>${repls ? m.replies.map(r => `<div style="margin-top:10px; padding:10px; background:#f4f6f8; border-radius:4px; border-left:3px solid #2ecc71;"><strong style="color:#2ecc71;">Admin Yanıtı:</strong><br><span style="font-size: 0.9rem; color: #444;">${r.text}</span><br><small style="color: #888;">${r.date}</small></div>`).join('') : ''}`;
            return `<div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; margin-bottom: 1rem; ${m.adminInitiated ? 'border-left: 3px solid #3498db;' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">
                    <div><strong>Konu: ${m.subject}</strong><br><span style="color:#666; font-size:0.85rem;">${m.date}</span></div>
                    <div style="background:${m.adminInitiated ? '#3498db' : (repls ? '#2ecc71' : '#f1c40f')}; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">${m.adminInitiated ? '📣 Satıcıdan' : (repls ? 'Yanıtlandı' : 'Bekliyor')}</div>
                </div>${bHtml}</div>`;
        }).join('');
    }

    function phoneMask(e) { let v = e.target.value.replace(/\D/g, ''); if (v.length > 0) { if (v[0] !== '0') v = '0' + v; } if (v.length > 1) { if (v[1] !== '5') v = '05' + v.substring(2); } e.target.value = v.substring(0, 11); }
    document.getElementById('profilePhoneInput').addEventListener('input', phoneMask); document.getElementById('checkoutPhone').addEventListener('input', phoneMask);
    document.getElementById('expDateInput').addEventListener('input', function() { let v = this.value.replace(/\D/g, ''); this.value = v.length > 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v; });
    document.getElementById('cardNumberInput').addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });

    const cItems = document.getElementById('cartItemsContainer'), cTotal = document.getElementById('cartTotalPrice'); let cVal = 0;
    window.addToCart = (id) => { products = JSON.parse(localStorage.getItem('gnl_products')) || products; const p = products.find(x => x.id === id); if (p.stock <= 0) return alert("Bu ürün tükendi."); cart.push(p); updateCartUI(); closeAllModals(); document.getElementById('sideCart').classList.add('active'); mainOverlay.classList.add('active'); };
    function updateCartUI() { document.getElementById('cartBadge').innerText = cart.length; cItems.innerHTML = ''; cVal = 0; if (cart.length === 0) { cItems.innerHTML = '<p style="color:#666; text-align:center;">Sepetiniz boş.</p>'; cTotal.innerText = '0.00 ₺'; return; } cart.forEach(i => { cVal += i.price; cItems.insertAdjacentHTML('beforeend', `<div class="cart-item"><img src="${i.img}"><div><div style="font-weight:500;">${i.title}</div><div style="color:var(--text-secondary);">${i.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div></div></div>`); }); cTotal.innerText = cVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺'; }
    document.getElementById('cartToggle').addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); document.getElementById('sideCart').classList.add('active'); mainOverlay.classList.add('active'); });

    function openCheckout() {
        if (cart.length === 0) return alert("Sepetiniz boş."); if (!currentUser) { alert("Önce giriş yapın."); document.getElementById('authToggle').click(); return; }
        document.getElementById('checkoutName').value = document.getElementById('profileNameInput').value || ""; document.getElementById('checkoutPhone').value = document.getElementById('profilePhoneInput').value || ""; document.getElementById('checkoutCity').value = document.getElementById('profileCityInput').value || ""; document.getElementById('checkoutDistrict').value = document.getElementById('profileDistrictInput').value || ""; document.getElementById('checkoutAddress').value = document.getElementById('profileAddressInput').value || "";
        closeAllModals(); document.getElementById('checkoutTotal').innerText = cVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺'; document.getElementById('checkoutModal').classList.add('active'); mainOverlay.classList.add('active');
    }
    document.getElementById('proceedToCheckoutBtn').addEventListener('click', openCheckout);
    document.getElementById('addToCartDetailBtn').addEventListener('click', () => { if (currentlyViewingProduct) addToCart(currentlyViewingProduct.id); });
    document.getElementById('buyNowBtn').addEventListener('click', () => { if (currentlyViewingProduct) { if (currentlyViewingProduct.stock <= 0) return alert("Bu ürün tükendi."); if (!cart.find(p => p.id === currentlyViewingProduct.id)) { cart.push(currentlyViewingProduct); updateCartUI(); } openCheckout(); } });
    
    document.getElementById('askProductQuestionBtn').addEventListener('click', () => { if (!currentUser) { alert("Soru sormak için giriş yapın."); document.getElementById('authToggle').click(); return; } if (!currentlyViewingProduct) return; document.getElementById('productQuestionProductName').innerText = '📦 ' + currentlyViewingProduct.title; document.getElementById('productQuestionText').value = ''; closeAllModals(); document.getElementById('productQuestionModal').classList.add('active'); mainOverlay.classList.add('active'); });
    document.getElementById('productQuestionForm').addEventListener('submit', (e) => { e.preventDefault(); if (!currentUser || !currentlyViewingProduct) return; const q = document.getElementById('productQuestionText').value.trim(); if (!q) return; let m = JSON.parse(localStorage.getItem('gnl_messages')) || []; m.push({ id: "MSG-" + Date.now(), userId: currentUser.email, userName: currentUser.name, date: new Date().toLocaleString('tr-TR'), subject: '🛍️ Ürün Sorusu: ' + currentlyViewingProduct.title, productId: currentlyViewingProduct.id, productTitle: currentlyViewingProduct.title, text: q, replies: [] }); localStorage.setItem('gnl_messages', JSON.stringify(m)); e.target.reset(); closeAllModals(); alert("Sorunuz gönderildi!"); renderUserMessages(); });

    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault(); if (document.getElementById('checkoutPhone').value.length < 11) return alert("Telefon eksik."); if (document.getElementById('cardNumberInput').value.length !== 16) return alert("Kart numarası 16 hane olmalı!");
        let o = JSON.parse(localStorage.getItem('gnl_orders')) || []; o.push({ id: "GNL-" + Math.floor(100000 + Math.random() * 900000), date: new Date().toLocaleString('tr-TR'), status: "Sipariş Alındı", customer: { name: document.getElementById('checkoutName').value, email: currentUser.email, phone: document.getElementById('checkoutPhone').value, city: document.getElementById('checkoutCity').value, district: document.getElementById('checkoutDistrict').value, address: document.getElementById('checkoutAddress').value }, items: [...cart], total: cVal }); localStorage.setItem('gnl_orders', JSON.stringify(o));
        products = JSON.parse(localStorage.getItem('gnl_products')) || products; cart.forEach(c => { let idx = products.findIndex(p => p.id === c.id); if (idx !== -1 && products[idx].stock > 0) products[idx].stock -= 1; }); localStorage.setItem('gnl_products', JSON.stringify(products));
        alert("Sipariş alındı!"); cart = []; updateCartUI(); closeAllModals(); renderUserOrders(); showHome();
    });

    updateUserUI(); showHome();
}