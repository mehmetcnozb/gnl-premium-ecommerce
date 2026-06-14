// GNL E-Commerce Platform - v1.6
// Commit 7: Multi-Media Gallery & Video Support

// 1. Ürün Veritabanı (Gallery Array eklendi)
const defaultProducts = [
    { id: 1, category: "Mutfak", title: "Minimal Seramik Kase Seti", price: 899.90, isFeatured: true, stock: 15, img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop", gallery: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop", "https://www.w3schools.com/html/mov_bbb.mp4"] },
    { id: 2, category: "Ev Yaşam", title: "Kristal Şarap Kadehleri", price: 1299.00, isFeatured: false, stock: 5, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop", gallery: [] },
    { id: 3, category: "Ev Yaşam", title: "Beyaz Porselen Koleksiyonu", price: 1499.00, isFeatured: true, stock: 0, img: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=800&auto=format&fit=crop", gallery: [] }
];

let products = JSON.parse(localStorage.getItem('gnl_products'));
if (!products || products.length === 0) { products = defaultProducts; localStorage.setItem('gnl_products', JSON.stringify(products)); }

let users = JSON.parse(localStorage.getItem('gnl_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('gnl_currentUser')) || null;
let cart = [];
let cartTotalValue = 0;

// =========================================================================
// YÖNETİM PANELİ (ADMIN)
// =========================================================================
if (document.querySelector('.admin-container')) {
    const tabProductsBtn = document.getElementById('tabProductsBtn');
    const tabOrdersBtn = document.getElementById('tabOrdersBtn');
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');

    tabProductsBtn.addEventListener('click', () => { tabProductsBtn.classList.add('active'); tabOrdersBtn.classList.remove('active'); productsSection.classList.add('active'); ordersSection.classList.remove('active'); renderAdminProducts(); });
    tabOrdersBtn.addEventListener('click', () => { tabOrdersBtn.classList.add('active'); tabProductsBtn.classList.remove('active'); ordersSection.classList.add('active'); productsSection.classList.remove('active'); renderAdminOrders(); });

    function renderAdminProducts() {
        let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
        const tbody = document.getElementById('adminProductTable');
        tbody.innerHTML = '';
        document.getElementById('totalProductCount').innerText = adminProducts.length;

        adminProducts.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.img}" class="product-img-preview" alt="görsel"></td>
                <td style="font-weight: 500;">${p.title}</td>
                <td>${p.category}</td>
                <td style="font-weight: 500;">${p.price.toLocaleString('tr-TR')} ₺</td>
                <td><button class="btn-danger-sm" onclick="deleteProduct(${p.id})">SİL</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // YENİ EKLENEN: Çoklu Medya Parçalama (Split) Algoritması
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
        
        const galleryInput = document.getElementById('pImg').value;
        const galleryArray = galleryInput.split(',').map(item => item.trim()).filter(item => item !== "");
        const coverImg = galleryArray.length > 0 ? galleryArray[0] : "";

        const newProduct = {
            id: Date.now(), 
            title: document.getElementById('pTitle').value, 
            price: parseFloat(document.getElementById('pPrice').value),
            stock: parseInt(document.getElementById('pStock').value), 
            category: document.getElementById('pCategory').value,
            img: coverImg, 
            gallery: galleryArray,
            isFeatured: document.getElementById('pFeatured').checked
        };
        adminProducts.push(newProduct); 
        localStorage.setItem('gnl_products', JSON.stringify(adminProducts));
        e.target.reset(); renderAdminProducts(); alert("Ürün kaydedildi!");
    });

    window.deleteProduct = (id) => {
        if (confirm("Emin misiniz?")) { 
            let adminProducts = JSON.parse(localStorage.getItem('gnl_products')) || [];
            adminProducts = adminProducts.filter(p => p.id !== id); 
            localStorage.setItem('gnl_products', JSON.stringify(adminProducts)); 
            renderAdminProducts(); 
        }
    };

    function renderAdminOrders() {
        const orders = JSON.parse(localStorage.getItem('gnl_orders')) || [];
        const tbody = document.getElementById('adminOrderTable');
        document.getElementById('totalOrderCount').innerText = orders.length;
        tbody.innerHTML = '';
        orders.slice().reverse().forEach(o => {
            tbody.insertAdjacentHTML('beforeend', `<tr><td>${o.id}</td><td>${o.date}</td><td>${o.customer.name}</td><td>Ürünler</td><td>${o.total} ₺</td><td>${o.status}</td></tr>`);
        });
    }
    renderAdminProducts();
}

// =========================================================================
// MÜŞTERİ ARAYÜZÜ (FRONTEND)
// =========================================================================
if (document.getElementById('homeView')) {
    let currentCategory = "Tümü";
    const homeView = document.getElementById('homeView');
    const shopView = document.getElementById('shopView');
    const detailView = document.getElementById('productDetailView');

    function showHome() { shopView.style.display = 'none'; detailView.style.display = 'none'; homeView.style.display = 'block'; renderFeatured(); }
    function showShop(cat = "Tümü") { homeView.style.display = 'none'; detailView.style.display = 'none'; shopView.style.display = 'block'; currentCategory = cat; applyFiltersAndSort(); }

    // YENİ EKLENEN: Medya Galerisi ve Video Kontrolü
    window.showProductDetail = (id) => {
        products = JSON.parse(localStorage.getItem('gnl_products')) || products; 
        const product = products.find(p => p.id === id); 
        if (!product) return;
        
        homeView.style.display = 'none'; shopView.style.display = 'none'; detailView.style.display = 'block'; window.scrollTo(0, 0);
        
        document.getElementById('detailTitle').innerText = product.title;
        document.getElementById('detailPrice').innerText = product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " ₺";

        const stat = document.getElementById('detailStockStatus');
        const buyBtn = document.getElementById('buyNowBtn');
        const cartBtn = document.getElementById('addToCartDetailBtn');
        
        if (product.stock >= 10) { stat.innerText = 'Stokta'; stat.style.color = '#10b981'; buyBtn.disabled = cartBtn.disabled = false; }
        else if (product.stock > 0) { stat.innerText = `Son ${product.stock} ürün`; stat.style.color = '#f59e0b'; buyBtn.disabled = cartBtn.disabled = false; }
        else { stat.innerText = 'Tükendi'; stat.style.color = '#ef4444'; buyBtn.disabled = cartBtn.disabled = true; }

        // Galeri Yönetimi
        const mediaContainer = document.getElementById('mainMediaContainer');
        const thumbContainer = document.getElementById('thumbnailGallery');
        const gallery = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.img];

        function setMainMedia(url) {
            mediaContainer.innerHTML = '';
            if (url.match(/\.(mp4|webm|ogg)$/i)) {
                mediaContainer.innerHTML = `<video class="video-element" controls autoplay muted loop><source src="${url}" type="video/mp4">Tarayıcınız video desteklemiyor.</video>`;
            } else {
                mediaContainer.innerHTML = `<img id="detailImg" src="${url}" alt="Ürün Resmi">`;
            }
        }

        setMainMedia(gallery[0]);

        thumbContainer.innerHTML = '';
        if (gallery.length > 1) {
            gallery.forEach((mediaUrl, index) => {
                const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                const thumbSrc = isVideo ? 'https://via.placeholder.com/70x70/1a1a1a/ffffff?text=VIDEO' : mediaUrl;
                
                const imgEl = document.createElement('img');
                imgEl.src = thumbSrc;
                imgEl.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                imgEl.onclick = () => {
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    imgEl.classList.add('active');
                    setMainMedia(mediaUrl);
                };
                thumbContainer.appendChild(imgEl);
            });
        }
        
        // Buton click olayları
        buyBtn.onclick = () => { if (product.stock > 0) { cart.push(product); updateCartUI(); openCheckout(); } };
        cartBtn.onclick = () => { if (product.stock > 0) { cart.push(product); updateCartUI(); } };
    };

    function createProductCard(p) {
        const out = p.stock <= 0, low = p.stock > 0 && p.stock < 10;
        let badge = out ? '<div class="out-of-stock-badge">TÜKENDİ</div>' : (low ? `<div class="low-stock-badge">SON ${p.stock} ÜRÜN</div>` : '');
        return `<div class="product-card" onclick="showProductDetail(${p.id})">
                    <div class="img-container">${badge}<img src="${p.img}" class="product-image"></div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-footer"><div class="price">${p.price.toLocaleString('tr-TR')} ₺</div></div>
                </div>`;
    }

    function renderProducts(items) { document.getElementById('productGrid').innerHTML = items.map(createProductCard).join(''); }
    function renderFeatured() { document.getElementById('featuredGrid').innerHTML = products.filter(p => p.isFeatured).map(createProductCard).join(''); }
    function applyFiltersAndSort() { renderProducts(products); }

    document.getElementById('homeLink').addEventListener('click', e => { e.preventDefault(); showHome(); });
    document.getElementById('exploreBtn').addEventListener('click', () => showShop());
    
    // Auth ve Modal İşlemleri
    const mainOverlay = document.getElementById('mainOverlay');
    function closeAllModals() { document.querySelectorAll('.modal, .side-cart').forEach(m => m.classList.remove('active')); mainOverlay.classList.remove('active'); }
    mainOverlay.addEventListener('click', closeAllModals); document.querySelectorAll('.close-modal, .close-cart').forEach(b => b.addEventListener('click', closeAllModals));
    
    document.getElementById('authToggle').addEventListener('click', e => { e.preventDefault(); closeAllModals(); if (currentUser) document.getElementById('profileModal').classList.add('active'); else document.getElementById('authModal').classList.add('active'); mainOverlay.classList.add('active'); });

    // Sepet İşlemleri
    const cartItemsContainer = document.getElementById('cartItemsContainer'); const cartTotalPrice = document.getElementById('cartTotalPrice');
    function updateCartUI() { document.getElementById('cartBadge').innerText = cart.length; cartItemsContainer.innerHTML = ''; cartTotalValue = 0; cart.forEach(i => { cartTotalValue += i.price; cartItemsContainer.insertAdjacentHTML('beforeend', `<div class="cart-item"><img src="${i.img}"><div>${i.title} <br> ${i.price} ₺</div></div>`); }); cartTotalPrice.innerText = cartTotalValue + ' ₺'; }
    document.getElementById('cartToggle').addEventListener('click', e => { e.preventDefault(); closeAllModals(); document.getElementById('sideCart').classList.add('active'); mainOverlay.classList.add('active'); });

    // Ödeme İşlemleri
    function openCheckout() { if(cart.length===0)return; closeAllModals(); document.getElementById('checkoutTotal').innerText = cartTotalValue + ' ₺'; document.getElementById('checkoutModal').classList.add('active'); mainOverlay.classList.add('active'); }
    document.getElementById('proceedToCheckoutBtn').addEventListener('click', openCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', (e) => { e.preventDefault(); alert("Sipariş alındı!"); cart = []; updateCartUI(); closeAllModals(); showHome(); });

    showHome();
}