/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - SHOP / MARKETPLACE SCRIPT
   Dynamically processes multi-category filters, sorting, search ranges,
   wishlist logs, and simulated purchase checkout states.
   ==========================================================================
*/

import { getProjects, addToCart, removeFromCart, addToWishlist, getCart, getWishlist } from './db.js';
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
    
    // Parse preset parameters (useful for queries incoming from Command Palette)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) {
        searchInput.value = decodeURIComponent(searchParam);
    }
    
    // Core filter state
    let state = {
        query: searchInput ? searchInput.value.toLowerCase().trim() : '',
        sort: sortSelect ? sortSelect.value : 'trending',
        categories: [],
        maxPrice: priceSlider ? parseFloat(priceSlider.value) : 100
    };
    
    // Categories active values
    const updateCategoriesState = () => {
        state.categories = Array.from(categoryBtns)
            .filter(btn => btn.classList.contains('active') && btn.dataset.category !== 'all')
            .map(btn => btn.dataset.category.toLowerCase());
    };
    updateCategoriesState();
    
    // Trigger render matching state
    const filterAndRenderProjects = () => {
        const projects = getProjects();
        
        let filtered = projects.filter(p => {
            // Text query
            const matchesQuery = p.title.toLowerCase().includes(state.query) || 
                                 p.description.toLowerCase().includes(state.query) ||
                                 p.seller.toLowerCase().includes(state.query);
            
            // Categories
            const matchesCategory = state.categories.length === 0 || 
                                    p.tags.some(t => state.categories.includes(t.toLowerCase()));
            
            // Max Price
            const matchesPrice = p.price <= state.maxPrice;
            
            return matchesQuery && matchesCategory && matchesPrice;
        });
        
        // Sorting index
        if (state.sort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (state.sort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (state.sort === 'newest') {
            // Mock ID sorting representing chronologies
            filtered.sort((a, b) => b.id.localeCompare(a.id));
        } else { // 'trending'
            filtered.sort((a, b) => b.likes - a.likes);
        }
        
        renderShopProjects(filtered);
    };
    
    // Expose for global cart logic
    window.filterAndRenderProjects = filterAndRenderProjects;
    
    // Render list outputs
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
        
        projectsGrid.innerHTML = items.map(p => {
            const inCart = getCart().includes(p.id);
            const inWish = getWishlist().includes(p.id);
            const isEditorial = p.tags.includes('Editorial');
            
            return `
                <div class="project-card shop-product-card" data-id="${p.id}">
                    <div class="project-card-img-wrapper">
                        <img src="${p.image}" alt="${p.title}" loading="lazy">
                        <div class="project-card-overlay">
                            ${isEditorial ? `<a href="${p.liveDemo || '#'}" target="_blank" class="btn btn-primary clickable">Live Portfolio</a>` : `<button class="btn btn-primary preview-trigger-btn clickable">View Details</button>`}
                        </div>
                    </div>
                    <div class="project-card-content">
                        <div class="project-card-header">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="badge badge-primary" style="font-size:0.7rem;">${p.tags[0] || p.status}</span>
                                <button class="btn btn-secondary wishlist-action-btn clickable" style="width:28px;height:28px;padding:0;font-size:0.7rem;border-radius:50%;color:${inWish ? 'var(--danger)' : ''};border-color:${inWish ? 'var(--danger)' : ''};" title="Add to Wishlist">♥</button>
                            </div>
                            <h3 class="project-card-title">${p.title}</h3>
                            <span class="project-card-seller">by @${p.seller}</span>
                        </div>
                        <p class="project-card-desc">${p.description}</p>
                        <div class="project-card-tags">
                            ${p.tags.slice(0, 3).map(t => `<span class="badge badge-outline" style="font-size:0.65rem;">${t}</span>`).join('')}
                        </div>
                        <div class="project-card-footer">
                            ${isEditorial ? `
                                <span style="font-weight:600; color:var(--text-secondary);">Live Portfolio</span>
                                <a href="${p.liveDemo || '#'}" target="_blank" class="btn btn-glow clickable">Visit</a>
                            ` : `
                                <span class="project-card-price">₹${p.price.toFixed(2)}</span>
                                <button class="btn btn-glow cart-action-btn clickable" style="background:${inCart ? 'rgba(16, 185, 129, 0.15)' : ''};color:${inCart ? '#10b981' : ''};border-color:${inCart ? '#10b981' : ''};">
                                    ${inCart ? 'Added ✓' : 'Add to Cart'}
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        bindProductActions();
    };
    
    // Bind interaction buttons
    const bindProductActions = () => {
        // Preview modal drawer
        projectsGrid.querySelectorAll('.preview-trigger-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.shop-product-card');
                const id = card.dataset.id;
                openGlobalPreviewDrawer(id);
            });
        });
        
        // Cart simulator clicker
        projectsGrid.querySelectorAll('.cart-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.shop-product-card');
                const id = card.dataset.id;
                
                const isAdded = addToCart(id);
                if (isAdded) {
                    btn.textContent = 'Added ✓';
                    btn.style.background = 'rgba(16, 185, 129, 0.15)';
                    btn.style.color = '#10b981';
                    btn.style.borderColor = '#10b981';
                    showToast('Project added to shopping cart!', 'success');
                    if (window.updateCartDrawer) window.updateCartDrawer();
                } else {
                    showToast('Project is already in shopping cart.', 'info');
                }
            });
        });
        
        // Wishlist simulated fav button
        projectsGrid.querySelectorAll('.wishlist-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.shop-product-card');
                const id = card.dataset.id;
                
                const isAdded = addToWishlist(id);
                if (isAdded) {
                    btn.style.color = 'var(--danger)';
                    btn.style.borderColor = 'var(--danger)';
                    showToast('Added to your favorite wishlist!', 'success');
                } else {
                    showToast('Item already saved in wishlist.', 'info');
                }
            });
        });
    };
    
    // Connect input listeners
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
            // Remove active from all
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
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
    
    // Initial Hydration
    if (window.updateCartDrawer) window.updateCartDrawer();
    filterAndRenderProjects();
}
