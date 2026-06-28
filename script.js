document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. GLOBAL MOBILE NAVBAR CONTROLLER
       ========================================================================== */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mainNav.classList.toggle('mobile-active');
        });

        document.addEventListener('click', () => {
            mainNav.classList.remove('mobile-active');
        });
    }

    /* ==========================================================================
       2. CENTRALIZED SERVICE DATA CATALOG
       ========================================================================== */
    const serviceCatalogData = {
        'commercial': { 
            title: "Commercial Office Cleaning", 
            desc: "Full workspace workstation sanitization, high-traffic vacuuming, deep mopping.", 
            price: 149.00 
        },
        'kitchen': { 
            title: "Deep Kitchen Sanitization", 
            desc: "Intensive oven, range hood, and grill degreasing with eco-friendly steam sterilization.", 
            price: 89.00 
        },
        'residential-deep': { 
            title: "Full Home Deep Cleaning", 
            desc: "HEPA filter allergen extraction, window frames, and bathroom scale elimination.", 
            price: 79.00 
        },
        'bathroom': { 
            title: "Advanced Bathroom Disinfection", 
            desc: "Heavy lime scale removal, steam grout tracking, and sterile vanity treatment.", 
            price: 59.00 
        },
        'windows': { 
            title: "Streak-Free Window & Track Detailing", 
            desc: "Pure water frame polishing and micro-particle suction extraction.", 
            price: 69.00 
        },
        'move-out': { 
            title: "End of Tenancy / Move-Out Clean", 
            desc: "Comprehensive floor scrubbing, wall scuff treatment, and cabinet sterilization.", 
            price: 199.00 
        }
    };

    /* ==========================================================================
       3. RE-ENGINEERED MULTI-ITEM STORAGE MECHANISM (CART PAGE)
       ========================================================================== */
    const cartItemsContainer = document.getElementById('cart-items-container');
    
    let savedCartItems = [];
    try {
        const localData = localStorage.getItem('bh_cleaning_cart');
        savedCartItems = localData ? JSON.parse(localData) : [];
        if (!Array.isArray(savedCartItems)) savedCartItems = [];
    } catch(e) {
        savedCartItems = [];
    }

    const urlParams = new URLSearchParams(window.location.search);
    const incomingServiceKey = urlParams.get('service');

    if (incomingServiceKey && serviceCatalogData[incomingServiceKey]) {
        const itemToProcess = serviceCatalogData[incomingServiceKey];
        const itemExists = savedCartItems.some(item => item.id === incomingServiceKey);
        
        if (!itemExists) {
            savedCartItems.push({
                id: incomingServiceKey,
                title: itemToProcess.title,
                desc: itemToProcess.desc,
                price: itemToProcess.price
            });
            localStorage.setItem('bh_cleaning_cart', JSON.stringify(savedCartItems));
        }

        const cleanURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanURL);
    }

    function populateCartInterface() {
        if (!cartItemsContainer) return;

        if (savedCartItems.length === 0) {
            cartItemsContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px 0; color: #7f8c8d;">Your booking cart is entirely empty.</td></tr>`;
            executeLivePricingRecalculation([]);
            return;
        }

        cartItemsContainer.innerHTML = '';

        savedCartItems.forEach((item, index) => {
            const staticRowHTML = `
                <tr class="cart-row-item" data-price="${item.price}">
                    <td>
                        <div class="cart-item-meta">
                            <strong>${item.title}</strong>
                            <span>Included: ${item.desc}</span>
                        </div>
                    </td>
                    <td>One-Time Reset Allocation</td>
                    <td class="price-cell">€${item.price.toFixed(2)}</td>
                    <td><button class="remove-item-btn" data-remove-id="${index}" style="background:transparent; border:none; color:#C0392B; cursor:pointer; font-weight:bold;">× Remove</button></td>
                </tr>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', staticRowHTML);
        });

        executeLivePricingRecalculation(savedCartItems);
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-remove-id')) {
                const targetIndex = parseInt(e.target.getAttribute('data-remove-id'), 10);
                savedCartItems.splice(targetIndex, 1);
                localStorage.setItem('bh_cleaning_cart', JSON.stringify(savedCartItems));
                populateCartInterface();
            }
        });
    }

    function executeLivePricingRecalculation(cartArray) {
        let currentSubtotalSum = 0;
        cartArray.forEach(item => { currentSubtotalSum += item.price; });

        const netTaxBtwFactor = 0.21;
        const generatedTaxCost = currentSubtotalSum * netTaxBtwFactor;
        const totalGrossOrderAmount = currentSubtotalSum + generatedTaxCost;

        const subtotalDisplayHolder = document.querySelector('.summary-line-row span:last-child');
        const taxDisplayHolder = document.querySelectorAll('.summary-line-row')[1]?.querySelector('span:last-child');
        const grossTotalDisplayHolder = document.querySelector('.total-row strong');

        if (subtotalDisplayHolder) subtotalDisplayHolder.innerHTML = `&euro;${currentSubtotalSum.toFixed(2)}`;
        if (taxDisplayHolder) taxDisplayHolder.innerHTML = `&euro;${generatedTaxCost.toFixed(2)}`;
        if (grossTotalDisplayHolder) grossTotalDisplayHolder.innerHTML = `&euro;${totalGrossOrderAmount.toFixed(2)}`;
    }

    populateCartInterface();

    /* ==========================================================================
       4. DYNAMIC CHECKOUT PAGE INJECTION LOOP
       ========================================================================== */
    const checkoutItemsWrapper = document.getElementById('checkout-dynamic-items-list');

    if (checkoutItemsWrapper) {
        let checkoutCartItems = [];
        try {
            const localData = localStorage.getItem('bh_cleaning_cart');
            checkoutCartItems = localData ? JSON.parse(localData) : [];
        } catch(e) {
            checkoutCartItems = [];
        }

        if (checkoutCartItems.length === 0) {
            checkoutItemsWrapper.innerHTML = `<p style="color: #C0392B; padding: 15px 0; font-weight: bold;">No active bookings found. Please select a service first.</p>`;
            return;
        }

        checkoutItemsWrapper.innerHTML = '';
        let checkoutSubtotal = 0;

        checkoutCartItems.forEach(item => {
            checkoutSubtotal += item.price;
            const receiptRowHTML = `
                <div class="receipt-item-line" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <p style="margin:0; font-size: 15px; color: #333; font-weight: 500; line-height: 1.4;">
                        ${item.title} <br>
                        <span style="font-size: 12px; color: #7f8c8d; font-weight: 400;">(Qty: 1) One-Time Service</span>
                    </p>
                    <strong style="color: #333;">&euro;${item.price.toFixed(2)}</strong>
                </div>
            `;
            checkoutItemsWrapper.insertAdjacentHTML('beforeend', receiptRowHTML);
        });

        const netTaxBtwFactor = 0.21;
        const checkoutTaxCost = checkoutSubtotal * netTaxBtwFactor;
        const checkoutGrandTotal = checkoutSubtotal + checkoutTaxCost;

        const checkoutSubtotalDisplay = document.getElementById('checkout-subtotal');
        const checkoutTaxDisplay = document.getElementById('checkout-tax');
        const checkoutTotalDisplay = document.getElementById('checkout-total');

        if (checkoutSubtotalDisplay) checkoutSubtotalDisplay.innerHTML = `&euro;${checkoutSubtotal.toFixed(2)}`;
        if (checkoutTaxDisplay) checkoutTaxDisplay.innerHTML = `&euro;${checkoutTaxCost.toFixed(2)}`;
        if (checkoutTotalDisplay) checkoutTotalDisplay.innerHTML = `&euro;${checkoutGrandTotal.toFixed(2)}`;
    }

    /* ==========================================================================
       5. LIGHTBOX GRAPHICS PREVIEW EXPANSION LOGIC
       ========================================================================== */
    const galleryLightboxModal = document.getElementById('gallery-lightbox-modal');
    const lightboxTargetImg = document.getElementById('lightbox-target-img');
    const lightboxCloseTrigger = document.querySelector('.lightbox-close-trigger');
    const interactableGalleryImages = document.querySelectorAll('.gallery-media-showcase img, .gallery-grid img, .service-hero-img');

    if (interactableGalleryImages.length > 0 && galleryLightboxModal && lightboxTargetImg) {
        interactableGalleryImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxTargetImg.src = img.src;
                lightboxTargetImg.alt = img.alt;
                galleryLightboxModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        const dismissModalAction = () => {
            galleryLightboxModal.style.display = 'none';
            document.body.style.overflow = '';
            lightboxTargetImg.src = '';
        };

        if (lightboxCloseTrigger) lightboxCloseTrigger.addEventListener('click', dismissModalAction);
        galleryLightboxModal.addEventListener('click', (e) => { if (e.target === galleryLightboxModal) dismissModalAction(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && galleryLightboxModal.style.display === 'flex') dismissModalAction(); });
    }
});