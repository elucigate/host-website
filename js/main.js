/**
 * Elucigate - Main JavaScript
 * Handles interactive features and animations
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Elucigate initialized');
  
  // Initialize search functionality
  initSearch();
  
  // Initialize smooth scrolling
  initSmoothScroll();
  
  // Initialize animations
  initAnimations();
  
  // Initialize shopping cart
  initShoppingCart();
});

/**
 * Search functionality
 */
function initSearch() {
  const searchInput = document.querySelector('.search-bar input');
  
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      if (query.length > 2) {
        // TODO: Implement search functionality
        console.log('Searching for:', query);
      }
    });
  }
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize scroll animations
 */
function initAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe product cards
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

/**
 * Utility function to debounce events
 */
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

/**
 * Handle window resize events
 */
window.addEventListener('resize', debounce(function() {
  // Handle responsive adjustments if needed
  console.log('Window resized');
}, 250));

/**
 * Shopping Cart Functionality
 */
let cart = [];

function initShoppingCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  
  // Load cart from localStorage
  loadCart();
  
  // Open cart panel
  cartBtn.addEventListener('click', function() {
    cartPanel.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  // Close cart panel
  function closeCart() {
    cartPanel.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  
  // ESC key to close cart
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartPanel.classList.contains('active')) {
      closeCart();
    }
  });
  
  // Add to Cart button functionality
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const shopItem = this.closest('.shop-item');
      
      const item = {
        id: parseInt(shopItem.dataset.id),
        name: shopItem.dataset.name,
        description: shopItem.querySelector('.shop-item-description').textContent,
        price: parseFloat(shopItem.dataset.price),
        icon: shopItem.dataset.icon,
        quantity: 1
      };
      
      addToCart(item);
      
      // Visual feedback
      this.textContent = 'Added!';
      this.style.background = '#10B981';
      setTimeout(() => {
        this.textContent = 'Add to Cart';
        this.style.background = '';
      }, 1000);
    });
  });
}

function addToCart(item) {
  const existingItem = cart.find(cartItem => cartItem.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += item.quantity || 1;
  } else {
    cart.push({
      ...item,
      quantity: item.quantity || 1
    });
  }
  
  saveCart();
  updateCartUI();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  updateCartUI();
}

function updateQuantity(itemId, newQuantity) {
  const item = cart.find(cartItem => cartItem.id === itemId);
  
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (totalItems === 0) {
    cartCount.style.display = 'none';
  } else {
    cartCount.style.display = 'flex';
  }
  
  // Update cart items display
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 2L7.17 4H2V6H3.18L5.82 16.36C6.08 17.35 6.97 18 8 18H18C19.03 18 19.92 17.35 20.18 16.36L22.82 6H24V4H18.83L17 2H9ZM9.5 4H14.5L15.17 4.83L15.83 6H8.17L8.83 4.83L9.5 4ZM5.82 6H18.18L16.18 14.36C16.12 14.65 15.88 14.88 15.59 14.95L8.41 14.95C8.12 14.88 7.88 14.65 7.82 14.36L5.82 6Z" fill="currentColor" opacity="0.3"/>
        </svg>
        <p>Your cart is empty</p>
        <p class="cart-empty-subtitle">Start shopping to add items to your cart</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">${item.icon}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-description">${item.description}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-actions">
            <div class="cart-item-quantity">
              <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
              <span>${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Update cart total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
  localStorage.setItem('elucigateCart', JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem('elucigateCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

// Make functions globally accessible for inline onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
