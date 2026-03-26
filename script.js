/* ============================================
   SCRIPT.JS - Main JavaScript
   Bean Boutique Coffee Shop
   ============================================ */

// ============================================
// INITIALIZATION & UTILITIES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initModal();
  initSlideshow();
  initSearchFilter();
  initCart();
  initForms();
});

// Debounce utility for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll behavior for navbar
  if (navbar) {
    // Check initial scroll position
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    }

    window.addEventListener('scroll', debounce(() => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        // Only remove scrolled class on homepage
        if (document.body.classList.contains('home-page') || document.querySelector('.hero')) {
          // Keep scrolled if not on hero section
          if (window.scrollY === 0) {
            navbar.classList.remove('scrolled');
          }
        }
      }
    }, 10));
  }

  // Mobile menu toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (animatedElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// MODAL POPUP
// ============================================

function initModal() {
  const modalOverlay = document.getElementById('discount-modal');
  const modalClose = document.getElementById('modal-close');
  const newsletterForm = document.getElementById('newsletter-form');

  if (!modalOverlay) return;

  // Show modal after 5 seconds (only if not shown before)
  const modalShown = localStorage.getItem('bb_modal_shown');

  if (!modalShown) {
    setTimeout(() => {
      modalOverlay.classList.add('active');
    }, 5000);
  }

  // Close modal
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      closeModal();
    });
  }

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Handle form submission
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      console.log('Newsletter signup:', email);

      // Show success message
      const modalContent = modalOverlay.querySelector('.modal-content');
      if (modalContent) {
        modalContent.innerHTML = `
          <h3 class="modal-title">Thank You!</h3>
          <p class="modal-description">Your 15% discount code is on its way to ${email}</p>
          <p style="color: var(--accent); font-weight: 600; font-size: 1.25rem; margin-top: var(--space-md);">WELCOME15</p>
        `;
      }

      // Auto-close after 3 seconds
      setTimeout(closeModal, 3000);
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    localStorage.setItem('bb_modal_shown', 'true');
  }
}

// ============================================
// SLIDESHOW
// ============================================

function initSlideshow() {
  const slideshow = document.getElementById('hero-slideshow');
  if (!slideshow) return;

  const container = slideshow.querySelector('.slideshow-container');
  const slides = slideshow.querySelectorAll('.slide');
  const dots = slideshow.querySelectorAll('.slideshow-dot');
  const prevBtn = slideshow.querySelector('.slideshow-arrow.prev');
  const nextBtn = slideshow.querySelector('.slideshow-arrow.next');

  let currentIndex = 0;
  let autoplayInterval;

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;
    container.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 6000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(index);
      startAutoplay();
    });
  });

  // Initialize
  startAutoplay();
}


// ============================================
// SEARCH & FILTER (Coffee & Equipment Pages)
// ============================================

function initSearchFilter() {
  // --- COFFEE PAGE LOGIC ---
  const coffeeSearch = document.getElementById('coffee-search');
  const coffeeGrid = document.getElementById('coffee-grid');
  const coffeePills = document.querySelectorAll('#coffee-grid ~ .filter-pills .filter-pill, .section .filter-pills .filter-pill'); // Broad selector

  // Specific check if we are on the coffee page
  if (coffeeGrid) {
    let activeCoffeeFilter = 'all';
    const coffeeProducts = coffeeGrid.querySelectorAll('.product-card');

    // Get pills specifically within the same container context if possible, 
    // otherwise we rely on the global filter-pills class but handle logic separately

    if (coffeeSearch) {
      coffeeSearch.addEventListener('input', debounce((e) => {
        filterCoffeeProducts();
      }, 300));
    }

    // Filter pills for coffee
    const cPills = document.querySelectorAll('.filter-pill'); // This grabs all, we will bind carefully

    // To avoid double binding on equipment page, let's do this:
    // We will rely on the logic below which handles both pages distinctly.
  }

  // --- EQUIPMENT PAGE LOGIC ---
  const equipmentSearch = document.getElementById('equipment-search');
  const equipmentGrid = document.getElementById('equipment-grid');

  if (equipmentGrid) {
    const equipmentProducts = equipmentGrid.querySelectorAll('.product-card');
    let activeEquipFilter = 'all';

    // Search functionality for Equipment
    if (equipmentSearch) {
      equipmentSearch.addEventListener('input', debounce((e) => {
        filterEquipmentProducts();
      }, 300));
    }

    // Filter pills for Equipment
    // We need to attach listeners specifically to the pills on this page
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Check if we are in equipment grid context
        if (equipmentSearch || equipmentGrid) {
          // Remove active from all pills
          pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeEquipFilter = pill.dataset.filter;
          filterEquipmentProducts();
        }
      });
    });

    function filterEquipmentProducts() {
      const searchTerm = equipmentSearch ? equipmentSearch.value.toLowerCase() : '';

      equipmentProducts.forEach(product => {
        const name = (product.dataset.name || '').toLowerCase();
        const category = product.dataset.category || '';
        const content = product.textContent.toLowerCase();

        const matchesSearch = searchTerm === '' || name.includes(searchTerm) || content.includes(searchTerm);
        const matchesFilter = activeEquipFilter === 'all' || category.includes(activeEquipFilter);

        if (matchesSearch && matchesFilter) {
          product.style.display = '';
          product.classList.add('visible');
        } else {
          product.style.display = 'none';
        }
      });
    }
  }

  // --- COFFEE PAGE LOGIC (Refined) ---
  else if (coffeeGrid) {
    const coffeeProducts = coffeeGrid.querySelectorAll('.product-card');
    let activeCoffeeFilter = 'all';

    if (coffeeSearch) {
      coffeeSearch.addEventListener('input', debounce((e) => {
        filterCoffeeProducts();
      }, 300));
    }

    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCoffeeFilter = pill.dataset.filter;
        filterCoffeeProducts();
      });
    });

    function filterCoffeeProducts() {
      const searchTerm = coffeeSearch ? coffeeSearch.value.toLowerCase() : '';

      coffeeProducts.forEach(product => {
        const name = (product.dataset.name || '').toLowerCase();
        const category = product.dataset.category || '';
        const content = product.textContent.toLowerCase();

        const matchesSearch = searchTerm === '' || name.includes(searchTerm) || content.includes(searchTerm);
        const matchesFilter = activeCoffeeFilter === 'all' || category.includes(activeCoffeeFilter);

        if (matchesSearch && matchesFilter) {
          product.style.display = '';
          product.classList.add('visible');
        } else {
          product.style.display = 'none';
        }
      });
    }
  }
}
// ============================================
// SHOPPING CART
// ============================================

function initCart() {
  updateCartCount();
  initPromoCode();

  // Add to cart buttons
  const addBtns = document.querySelectorAll('.add-to-cart');
  addBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      // Read the data-type attribute
      const type = btn.dataset.type || 'other';
      addToCart({ id, name, price, quantity: 1, type: type });

      // Visual feedback
      btn.classList.add('added');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;

      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        `;
      }, 1500);
    });
  });

  // Render cart if on cart page
  renderCartPage();
}

function getCart() {
  const cart = localStorage.getItem('bb_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('bb_cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    // Ensure the item has a type, default to 'other' if missing
    if (!item.type) item.type = 'other';
    cart.push(item);
  }

  saveCart(cart);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCartPage();
}

// ============================================
// PROMO CODE LOGIC
// ============================================

// Define valid promo codes here
const PROMO_CODES = {
  'SPRINGBREW20': { discount: 0.20, type: 'percent', validType: 'equipment', description: '20% Off Equipment' },
  'WELCOME15': { discount: 0.15, type: 'percent', validType: 'coffee', description: '15% Off Coffee' },
};

function initPromoCode() {
  const promoInput = document.getElementById('promo-input');
  const applyBtn = document.getElementById('apply-promo-btn');

  if (!applyBtn) return;

  applyBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    applyPromoCode(code);
  });

  // Allow pressing "Enter" to apply code
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = promoInput.value.trim().toUpperCase();
        applyPromoCode(code);
      }
    });
  }
}

function applyPromoCode(code) {
  const messageEl = document.getElementById('promo-message');
  const discountRow = document.getElementById('discount-row');

  // Check if code is valid
  if (PROMO_CODES[code]) {
    // Valid code
    localStorage.setItem('bb_promo', JSON.stringify({ code: code, ...PROMO_CODES[code] }));

    messageEl.style.display = 'block';
    messageEl.textContent = 'Code applied successfully!';
    messageEl.style.color = '#4CAF50'; // Green success color

    // Re-render cart to update prices
    renderCartPage();
  } else {
    // Invalid code
    messageEl.style.display = 'block';
    messageEl.textContent = 'Invalid promo code.';
    messageEl.style.color = '#e74c3c'; // Red error color

    // Remove any existing promo
    localStorage.removeItem('bb_promo');
    renderCartPage();
  }
}

function getAppliedPromo() {
  const promo = localStorage.getItem('bb_promo');
  return promo ? JSON.parse(promo) : null;
}

function updateQuantity(id, change) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(cart);
    renderCartPage();
  }
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const countElements = document.querySelectorAll('#cart-count');
  countElements.forEach(el => {
    el.textContent = count;
  });
}

function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 4h16l-1.5 9H7L5 5"></path>
          </svg>
        </div>
        <h3 style="margin-bottom: var(--space-sm);">Your cart is empty</h3>
        <p style="margin-bottom: var(--space-md);">Looks like you haven't added any items yet.</p>
        <a href="coffee.html" class="btn btn-primary">Browse Coffee</a>
      </div>
    `;
    updateSummary(0);
    return;
  }

  let html = `
    <div style="overflow-x: auto;">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  `;

  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
      <tr>
        <td>
          <div class="cart-product">
            <div class="cart-product-image">
              <div style="width: 100%; height: 100%; background: var(--bg-lighter); display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
            </div>
            <div>
              <div class="cart-product-name">${item.name}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="quantity-control">
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)" aria-label="Increase quantity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </td>
        <td style="text-align: right; font-weight: 500;">$${itemTotal.toFixed(2)}</td>
        <td>
          <button class="cart-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const codeDisplay = document.getElementById('promo-code-display');

  const promo = getAppliedPromo();
  let discountAmount = 0;

  // 1. Calculate discount based on VALID items only
  if (promo) {
    const cart = getCart();

    // Filter cart items that match the promo's valid type
    const validItemsSubtotal = cart.reduce((sum, item) => {
      if (item.type === promo.validType) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);

    // Calculate discount
    if (promo.type === 'percent') {
      discountAmount = validItemsSubtotal * promo.discount;
    }

    // Show discount row
    if (discountRow) {
      discountRow.style.display = 'flex';
      if (codeDisplay) codeDisplay.textContent = promo.code;
      if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    }
  } else {
    // Hide discount row if no promo
    if (discountRow) discountRow.style.display = 'none';
  }

  // 2. Calculate totals
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.08; // 8% tax
  const total = taxableAmount + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Make functions globally available for inline onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// ============================================
// FORMS
// ============================================

function initForms() {
  const eventForm = document.getElementById('event-registration-form');

  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(eventForm);
      const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        event: document.getElementById('event').value
      };

      console.log('Event Registration:', data);

      // Show success message
      eventForm.innerHTML = `
        <div style="text-align: center; padding: var(--space-xl) 0;">
          <div style="width: 64px; height: 64px; margin: 0 auto var(--space-md); background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h3 style="margin-bottom: var(--space-xs);">Registration Complete!</h3>
          <p style="color: var(--fg-muted);">We've sent a confirmation email to ${data.email}</p>
        </div>
      `;
    });
  }
}
// ============================================
// REFERRAL LINK COPY
// ============================================

const copyBtn = document.getElementById('copy-link-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    // Create a dummy referral link
    const referralLink = 'https://beanboutique.com/ref/YOUR-FRIEND-123';

    // Copy to clipboard
    navigator.clipboard.writeText(referralLink).then(() => {
      // Update button text to confirm
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Link Copied!';
      copyBtn.style.backgroundColor = 'var(--accent)';
      copyBtn.style.color = 'var(--bg)';

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
        copyBtn.style.color = '';
      }, 2000);
    });
  });
}
// Bundle add to cart function for offers page//
function addBundleToCart() {
  // 1. Create the item
  var item = {
    id: 'bundle-1',
    name: 'Starter Kit Bundle',
    price: 219,
    quantity: 1
  };

  // 2. Get existing cart from storage
  var cart = JSON.parse(localStorage.getItem('bb_cart')) || [];

  // 3. Check if item already exists
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) {
      cart[i].quantity += 1;
      found = true;
      break;
    }
  }

  // 4. If not found, add it
  if (!found) {
    cart.push(item);
  }

  // 5. Save back to storage
  localStorage.setItem('bb_cart', JSON.stringify(cart));

  // 6. Update the counter in the nav bar
  var countElements = document.querySelectorAll('#cart-count');
  var totalQty = 0;
  for (var i = 0; i < cart.length; i++) {
    totalQty += cart[i].quantity;
  }
  countElements.forEach(function (el) {
    el.textContent = totalQty;
  });

  // 7. Alert to confirm
  alert('Starter Kit Bundle added to cart!');
}


