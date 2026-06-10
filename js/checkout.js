import { getCart, getProjects, clearCart } from './modules/db.js';

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
    
    // Bind functions globally since it's a module now
    window.selectPayment = selectPayment;
    window.placeOrder = placeOrder;
});

function loadCheckoutSummary() {
    const cartIds = getCart();
    const allProjects = getProjects();
    const cartItems = cartIds.map(id => allProjects.find(p => p.id === id)).filter(Boolean);
    
    const listContainer = document.getElementById('checkout-summary-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    if (cartItems.length === 0) {
        if(listContainer) {
            listContainer.innerHTML = '<div style="color:black;text-align:center;padding:20px;">Your cart is empty.</div>';
        }
        return;
    }

    let total = 0;
    if (listContainer) {
        listContainer.innerHTML = cartItems.map(item => {
            total += item.price;
            return `
                <div class="summary-item">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <img src="${item.image}" alt="" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
                        <span class="summary-item-title">${item.title}</span>
                    </div>
                    <span class="summary-item-price">₹${item.price.toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    if(subtotalEl) subtotalEl.textContent = `₹${total.toFixed(2)}`;
    if(totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

function selectPayment(element) {
    const cards = document.querySelectorAll('.payment-method-card');
    cards.forEach(card => card.classList.remove('active'));
    element.classList.add('active');
}

function placeOrder() {
    const cartIds = getCart();
    const allProjects = getProjects();
    const cartItems = cartIds.map(id => allProjects.find(p => p.id === id)).filter(Boolean);
    
    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const orderId = 'DESIGNX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const displayEl = document.getElementById('order-id-display');
    if (displayEl) {
        displayEl.textContent = orderId;
    }

    // Save to order history
    const existingOrders = JSON.parse(localStorage.getItem('apex_orders')) || [];
    existingOrders.push({
        id: orderId,
        date: new Date().toISOString(),
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price, 0)
    });
    localStorage.setItem('apex_orders', JSON.stringify(existingOrders));

    // Clear Cart using db.js
    clearCart();

    // Show Success Overlay
    const overlay = document.getElementById('success-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}
