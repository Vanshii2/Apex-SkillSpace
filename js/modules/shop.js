/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - SHOP / MARKETPLACE SCRIPT
   Fixed: no inline onclick handlers, event delegation via querySelectorAll,
   cartSet sync, "View Live Demo" links in drawer and featured hero card.
   ==========================================================================
*/

import { getProjects, addToCart, removeFromCart, addToWishlist, removeFromWishlist, getCart, getWishlist } from './db.js';
import { getImage } from './images.js';
import { showToast } from '../core/global.js';
import { openGlobalPreviewDrawer } from './portfolio.js';

export function initShopPage() {
    const projectsGrid = document.getElementById('shop-projects-grid');
    const searchInput = document.getElementById('shop-search-field');
    const sortSelect = document.getElementById('shop-sort-select');
    const categoryBtns = document.querySelectorAll('.category-filter-btn');
    const priceSlider = document.getElementById('shop-price-slider');
    const priceDisplay = document.getElementById('shop-price-limit');

    if (!projectsGrid) return;

    // ── cartSet: in-memory mirror of getCart() for instant toggle reads ──────
    const cartSet = new Set(getCart());

    // ── Parse preset URL search parameter ────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) searchInput.value = decodeURIComponent(searchParam);

    // ── Core filter state ─────────────────────────────────────────────────────
    let state = {
        query: searchInput ? searchInput.value.toLowerCase().trim() : '',
        sort: sortSelect ? sortSelect.value : 'trending',
        categories: [],
        maxPrice: priceSlider ? parseFloat(priceSlider.value) : 9999
    };

    const updateCategoriesState = () => {
        state.categories = Array.from(categoryBtns)
            .filter(btn => btn.classList.contains('active') && btn.dataset.category !== 'all')
            .map(btn => btn.dataset.category.toLowerCase());
    };
    updateCategoriesState();

    // ── Main render+filter pipeline ───────────────────────────────────────────
    const filterAndRenderProjects = () => {
        const projects = getProjects();

        let filtered = projects.filter(p => {
            const matchesQuery = p.title.toLowerCase().includes(state.query) ||
                p.description.toLowerCase().includes(state.query) ||
                p.seller.toLowerCase().includes(state.query);
            const matchesCategory = state.categories.length === 0 ||
                p.tags.some(t => state.categories.includes(t.toLowerCase()));
            const matchesPrice = state.maxPrice >= 9999 || p.price <= state.maxPrice;
            return matchesQuery && matchesCategory && matchesPrice;
        });

        if (state.sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        else if (state.sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        else if (state.sort === 'newest') filtered.sort((a, b) => b.id.localeCompare(a.id));
        else filtered.sort((a, b) => b.likes - a.likes); // trending

        renderShopProjects(filtered);
    };

    // Expose for external cart-drawer refresh
    window.filterAndRenderProjects = filterAndRenderProjects;

    // ── Render grid ───────────────────────────────────────────────────────────
    const renderShopProjects = (items) => {
        if (items.length === 0) {
            projectsGrid.innerHTML = `
                <div class="premium-empty-state glass" style="grid-column: 1/-1;">
                    <div style="font-size:2.5rem;color:var(--text-muted);">⚙</div>
                    <h3 style="color:var(--text-primary);">No assets match your search</h3>
                    <p style="color:var(--text-muted)">Try adjusting your filters or categories.</p>
                </div>
            `;
            return;
        }

        projectsGrid.innerHTML = items.map((p, index) => {
            const inCart = cartSet.has(p.id);
            const inWish = getWishlist().includes(p.id);
            const hasDemo = p.demoUrl && p.demoUrl !== '#';

            return `
                <div class="project-card shop-product-card" data-id="${p.id}">
                    <div class="project-card-img-wrapper">
                        <img src="${getImage(p.image)}" alt="${p.title}" ${index === 0 ? 'fetchpriority="high"' : ''} loading="${index < 4 ? 'eager' : 'lazy'}">
                        <div class="project-card-overlay">
                            <button
                                class="btn btn-primary preview-trigger-btn clickable"
                                data-id="${p.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                    <div class="project-card-content">
                        <div class="project-card-header">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-direction:column;">
                            <h3 class="project-card-title" style="margin-bottom: 4px;">${p.title}</h3>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">By ${p.seller || 'Unknown'}</span>
                        </div>
                    </div>
                        <div class="project-card-tags">
                            ${p.tags.slice(0, 3).map(t => `<span class="badge badge-outline" style="font-size:0.65rem;">${t}</span>`).join('')}
                        </div>
                        <div class="project-card-footer">
                            <span class="project-card-price">₹${p.price.toFixed(2)}</span>
                            <button
                                class="btn btn-glow cart-action-btn clickable"
                                data-id="${p.id}"
                                style="background:${inCart ? 'rgba(16,185,129,0.15)' : ''};
                                       color:${inCart ? '#217157ff' : ''};
                                       border-color:${inCart ? '#1a392eff' : ''};">
                                ${inCart ? 'Added ✓' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind events AFTER HTML is injected — never inline onclick
        bindProductActions();
    };

    // ── Event delegation — all bound via querySelectorAll, no onclick attr ────
    const bindProductActions = () => {

        // "View Details" overlay button
        projectsGrid.querySelectorAll('.preview-trigger-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openGlobalPreviewDrawer(btn.dataset.id, cartSet, syncCartSet);
            });
        });

        // "Add to Cart" / "Added ✓" toggle
        projectsGrid.querySelectorAll('.cart-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;

                if (cartSet.has(id)) {
                    // Already in cart — toggle removal
                    removeFromCart(id);
                    cartSet.delete(id);
                    btn.textContent = 'Add to Cart';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    showToast('Removed from your cart.', 'info');
                } else {
                    const result = addToCart(id);
                    if (result === null) return; // login redirect
                    if (result) {
                        cartSet.add(id);
                        btn.textContent = 'Added ✓';
                        btn.style.background = 'rgba(16,185,129,0.15)';
                        btn.style.color = '#10b981';
                        btn.style.borderColor = '#10b981';
                        showToast('Project added to cart!', 'success');
                    } else {
                        showToast('Already in your cart.', 'info');
                    }
                }
                if (window.updateCartDrawer) window.updateCartDrawer();
            });
        });

    };

    // Keep cartSet in sync when drawer's "Add to Cart" button is used externally
    const syncCartSet = () => {
        getCart().forEach(id => cartSet.add(id));
    };

    // ── Input listeners ───────────────────────────────────────────────────────
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.query = e.target.value.toLowerCase().trim();
            filterAndRenderProjects();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sort = e.target.value;
            filterAndRenderProjects();
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCategoriesState();
            filterAndRenderProjects();
        });
    });

    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            const limit = parseFloat(e.target.value);
            state.maxPrice = limit;
            if (priceDisplay) priceDisplay.textContent = `₹${limit.toFixed(2)}`;
            filterAndRenderProjects();
        });
    }

    // ── Initial render ────────────────────────────────────────────────────────
    if (window.updateCartDrawer) window.updateCartDrawer();
    filterAndRenderProjects();
}
