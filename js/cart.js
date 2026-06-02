class CartManager {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('apex_cart')) || [];
        this.init();
    }

    init() {
        this.cartDrawer = document.getElementById('cart-drawer');
        this.cartBackdrop = document.getElementById('cart-backdrop');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalEl = document.getElementById('cart-total-amount');
        this.cartCountBadge = document.getElementById('cart-count-badge');
        
        this.bindEvents();
        this.renderCart();
    }

    bindEvents() {
        // Toggle Cart
        const cartBtns = document.querySelectorAll('.cart-toggle-btn');
        cartBtns.forEach(btn => {
            btn.addEventListener('click', () => this.toggleCart());
        });

        if (this.cartBackdrop) {
            this.cartBackdrop.addEventListener('click', () => this.closeCart());
        }

        const closeBtn = document.getElementById('cart-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());
    }

    toggleCart() {
        this.cartDrawer.classList.toggle('active');
        if (this.cartBackdrop) this.cartBackdrop.classList.toggle('active');
        document.body.style.overflow = this.cartDrawer.classList.contains('active') ? 'hidden' : '';
    }

    closeCart() {
        if(this.cartDrawer) this.cartDrawer.classList.remove('active');
        if(this.cartBackdrop) this.cartBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    openCart() {
        if(this.cartDrawer) this.cartDrawer.classList.add('active');
        if(this.cartBackdrop) this.cartBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    addItem(project) {
        // check if already in cart
        if (!this.cartItems.some(item => item.id === project.id)) {
            this.cartItems.push(project);
            this.saveCart();
            this.renderCart();
            
            // show quick notification or open cart
            this.openCart();
        } else {
            alert('Project is already in your cart!');
        }
    }

    removeItem(projectId) {
        this.cartItems = this.cartItems.filter(item => item.id !== projectId);
        this.saveCart();
        this.renderCart();
    }

    saveCart() {
        localStorage.setItem('apex_cart', JSON.stringify(this.cartItems));
    }

    renderCart() {
        if (!this.cartItemsContainer) return;

        // Update badge count
        if (this.cartCountBadge) {
            this.cartCountBadge.textContent = this.cartItems.length;
            this.cartCountBadge.style.display = this.cartItems.length > 0 ? 'flex' : 'none';
        }

        if (this.cartItems.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px; display:block; opacity:0.5;">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your cart is empty.</p>
                </div>
            `;
            if (this.cartTotalEl) this.cartTotalEl.textContent = '$0.00';
            return;
        }

        let total = 0;
        this.cartItemsContainer.innerHTML = this.cartItems.map(item => {
            total += item.price;
            return `
                <div class="cart-item">
                    <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove clickable" onclick="window.ApexCart.removeItem('${item.id}')" title="Remove Item">✕</button>
                </div>
            `;
        }).join('');

        if (this.cartTotalEl) {
            this.cartTotalEl.textContent = \`$\${total.toFixed(2)}\`;
        }
    }
}

// Global reference for inline onclick handlers
window.ApexCart = null;

document.addEventListener('DOMContentLoaded', () => {
    window.ApexCart = new CartManager();
});
