/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - SHOP / MARKETPLACE SCRIPT
   Dynamically processes multi-category filters, sorting, search ranges,
   wishlist logs, and simulated purchase checkout states.
   ==========================================================================
*/

import { getProjects, addToCart, addToWishlist, getCart, getWishlist } from './db.js';
import { showToast } from '../core/global.js';
import { openGlobalPreviewDrawer } from './portfolio.js';

export function initShopPage() {
    const projectsGrid = document.getElementById('shop-projects-grid');
    const searchInput = document.getElementById('shop-search-field');
    const sortSelect = document.getElementById('shop-sort-select');
    const categoryChecks = document.querySelectorAll('.category-filter-check');
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
    
    // Categories checked values
    const updateCategoriesState = () => {
        state.categories = Array.from(categoryChecks)
            .filter(c => c.checked)
            .map(c => c.value.toLowerCase());
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
    
    // Render list outputs
    const renderShopProjects = (items) => {
        if (items.length === 0) {
            projectsGrid.innerHTML = `
                <div class="premium-empty-state glass" style="grid-column: 1/-1;">
                    <div style="font-size:2.5rem;">⚙</div>
                    <h3>No assets match your search</h3>
                    <p style="color:var(--text-muted)">Try adjusting your price range limit or toggle different categories.</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = items.map(p => {
            const inCart = getCart().includes(p.id);
            const inWish = getWishlist().includes(p.id);
            
            return `
                <div class="glass-card spotlight-card shop-product-card" data-id="${p.id}" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;">
                    <div>
                        <div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:16px;">
                            <img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;">
                            <span style="position:absolute;bottom:12px;right:12px;font-weight:bold;font-size:1.05rem;background:rgba(10,10,12,0.85);backdrop-filter:blur(8px);padding:4px 10px;border-radius:6px;border:1px solid var(--border-color);color:var(--primary);">$${p.price.toFixed(2)}</span>
                        </div>
                        
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                            <span class="text-mono" style="font-size:0.65rem;">BY @${p.seller}</span>
                            <div style="display:flex;gap:4px;">
                                <button class="btn btn-secondary wishlist-action-btn clickable" style="width:28px;height:28px;padding:0;font-size:0.7rem;border-radius:50%;color:${inWish ? 'var(--danger)' : ''};border-color:${inWish ? 'var(--danger)' : ''};" title="Simulate Wishlist">♥</button>
                            </div>
                        </div>
                        
                        <h3 style="font-size:1.05rem;margin-bottom:8px;line-height:1.3;max-height:2.6em;overflow:hidden;">${p.title}</h3>
                        <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:3em;overflow:hidden;margin-bottom:16px;">${p.description}</p>
                    </div>
                    
                    <div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;">
                            ${p.tags.slice(0, 3).map(t => `<span class="badge badge-outline" style="font-size:0.6rem;">${t}</span>`).join('')}
                        </div>
                        
                        <div style="display:flex;gap:8px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <button class="btn btn-secondary preview-trigger-btn clickable" style="flex:1;padding:8px 12px;font-size:0.75rem;">Preview</button>
                            <button class="btn btn-primary cart-action-btn clickable" style="flex:1;padding:8px 12px;font-size:0.75rem;background:${inCart ? 'rgba(0,230,118,0.15)' : ''};color:${inCart ? 'var(--success)' : ''};border-color:${inCart ? 'var(--success)' : ''};">
                                ${inCart ? 'Added ✓' : 'Add to Cart'}
                            </button>
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
                    btn.style.background = 'rgba(0, 230, 118, 0.15)';
                    btn.style.color = 'var(--success)';
                    btn.style.borderColor = 'var(--success)';
                    showToast('Project added to shopping cart!', 'success');
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
    
    categoryChecks.forEach(c => {
        c.addEventListener('change', () => {
            updateCategoriesState();
            filterAndRenderProjects();
        });
    });
    
    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            const limit = parseFloat(e.target.value);
            state.maxPrice = limit;
            if (priceDisplay) priceDisplay.textContent = `$${limit.toFixed(2)}`;
            filterAndRenderProjects();
        });
    }
    
    // Initial Hydration
    filterAndRenderProjects();
}
