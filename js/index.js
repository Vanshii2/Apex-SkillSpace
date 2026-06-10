/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - APP ENTRANCE COORDINATOR
   Seeds LocalStorage database and coordinates page modules dynamic loaders.
   ==========================================================================
*/

import { initDB, getProjects, getCreators, likeProject, bookmarkProject } from './modules/db.js';
import { initTheme } from './core/theme.js';
import { initCustomCursor, initSpotlightCards, initScrollProgress, initLazyLoadSections, initPageTransitions, showToast, initAntigravityParticles, initTypewriter } from './core/global.js';
import { initNavbarScroll, initFloatingDock, initNotifications, initCommandPalette } from './core/ui.js';
import { addToCart, getCart, removeFromCart } from './modules/db.js';

// --- Page Specific Imports ---
import { initPortfolioPage, openGlobalPreviewDrawer, closeGlobalPreviewDrawer } from './modules/portfolio.js';
import { initShopPage } from './modules/shop.js';
import { initProfilePage } from './modules/profile.js';
import { logoutUser, requireAuth, getCurrentUser } from './auth.js';
import { initParticles } from './modules/particles.js';
import { initPortfolioBuilder } from './portfolio-builder.js';

document.addEventListener('DOMContentLoaded', () => {
    // Remove transitions override to re-enable them for hover events
    setTimeout(() => {
        const foucStyle = document.getElementById('fouc-preload');
        if (foucStyle) foucStyle.remove();
    }, 50);

    // 1. Initialize Client Database Seeds
    initDB();

    // 2. Initialize Visual System & Interactions
    initTheme();
    initCustomCursor();
    initSpotlightCards();
    initScrollProgress();
    initLazyLoadSections();
    initPageTransitions();

    // 3. Initialize Shared Layout Elements
    initNavbarScroll();
    initFloatingDock();
    initNotifications();
    initCommandPalette();

    // 4. Bind Global Modal/Drawer Closers
    document.addEventListener('click', (e) => {
        if (e.target.closest('#drawer-close')) {
            closeGlobalPreviewDrawer();
        }
    });

    // 5. Page-Specific Coordinators
    window.detectPageAndLoadModule = detectPageAndLoadModule;
    detectPageAndLoadModule();

    // 6. Global Cart Logic
    initGlobalCart();

    // 7. Update navbar auth buttons based on session state
    updateNavbarAuthButtons();
});

function updateNavbarAuthButtons() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (isLoggedIn) {
        // Hide guest buttons
        const loginLink = navActions.querySelector('a[href="login.html"]');
        const signupLink = navActions.querySelector('a[href="signup.html"]');
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';

        // Inject cart icon button (if not already injected)
        if (!document.getElementById('nav-cart-btn')) {
            const cartBtn = document.createElement('button');
            cartBtn.id = 'nav-cart-btn';
            cartBtn.className = 'nav-btn cart-toggle-btn';
            cartBtn.title = 'Cart';
            cartBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span id="cart-count-badge" class="cart-count-badge" style="display:none;">0</span>`;
            navActions.insertBefore(cartBtn, navActions.firstChild);
        }

        // Inject profile avatar circle + dropdown (if not already injected)
        if (!document.getElementById('nav-profile-wrap')) {
            const userData = JSON.parse(localStorage.getItem('apex_user_data') || '{}');
            const initials = (userData.name || 'U').charAt(0).toUpperCase();

            const wrap = document.createElement('div');
            wrap.id = 'nav-profile-wrap';
            wrap.style.cssText = 'position:relative; display:inline-flex; align-items:center;';
            wrap.innerHTML = `
                <button id="nav-profile-btn" title="Profile" style="
                    width:36px; height:36px; border-radius:50%;
                    background:linear-gradient(135deg,var(--primary,#00f2fe),var(--accent,#8b5cf6));
                    border:2px solid rgba(255,255,255,0.2);
                    color:#fff; font-weight:700; font-size:0.85rem;
                    display:flex; align-items:center; justify-content:center;
                    cursor:pointer; transition:transform 0.2s, box-shadow 0.2s;
                ">${initials}</button>
                <div id="nav-profile-dropdown" style="
                    display:none; position:absolute; top:calc(100% + 10px); right:0;
                    min-width:160px; background:var(--bg-surface); border:1px solid var(--border-color);
                    border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.25);
                    padding:8px; z-index:1100; flex-direction:column; gap:4px;
                ">
                    <button class="nav-dropdown-item cart-toggle-btn" style="
                        width:100%; padding:10px 14px; background:transparent; border:none;
                        color:var(--text-primary); font-size:0.9rem; text-align:left; border-radius:8px;
                        cursor:pointer; display:flex; align-items:center; gap:10px;
                        transition:background 0.15s;
                    ">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        Cart
                    </button>
                    <button id="nav-logout-btn" class="nav-dropdown-item" style="
                        width:100%; padding:10px 14px; background:transparent; border:none;
                        color:var(--danger,#ef4444); font-size:0.9rem; text-align:left; border-radius:8px;
                        cursor:pointer; display:flex; align-items:center; gap:10px;
                        transition:background 0.15s;
                    ">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>`;
            navActions.appendChild(wrap);

            // Toggle dropdown on profile click
            const profileBtn = wrap.querySelector('#nav-profile-btn');
            const dropdown = wrap.querySelector('#nav-profile-dropdown');
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.style.display === 'flex';
                dropdown.style.display = isOpen ? 'none' : 'flex';
            });
            profileBtn.addEventListener('mouseenter', () => {
                profileBtn.style.transform = 'scale(1.08)';
                profileBtn.style.boxShadow = '0 0 14px rgba(0,242,254,0.35)';
            });
            profileBtn.addEventListener('mouseleave', () => {
                profileBtn.style.transform = '';
                profileBtn.style.boxShadow = '';
            });

            // Hover state on dropdown items
            wrap.querySelectorAll('.nav-dropdown-item').forEach(item => {
                item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.06)');
                item.addEventListener('mouseleave', () => item.style.background = 'transparent');
            });

            // Logout action
            wrap.querySelector('#nav-logout-btn').addEventListener('click', () => {
                logoutUser();
            });

            // Close dropdown on outside click
            document.addEventListener('click', () => {
                dropdown.style.display = 'none';
            });
        }
    }
}

function injectCartDrawer() {
    if (document.getElementById('cart-drawer')) return;
    if (!document.querySelector('.nav-actions')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'cart-backdrop';
    backdrop.className = 'cart-backdrop';
    document.body.appendChild(backdrop);

    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
        <div class="cart-header">
            <h2>Your Cart</h2>
            <button class="cart-close-btn" id="cart-close">✕</button>
        </div>
        <div class="cart-items-container" id="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total-row">
                <span>Total:</span>
                <span id="cart-total-amount" style="color:var(--primary);">₹0.00</span>
            </div>
            <div class="cart-actions">
                <button class="btn btn-primary clickable" style="width:100%;" id="checkout-btn-global">Checkout Securely</button>
                <button class="btn btn-secondary clickable" style="width:100%;" id="cart-continue-shopping">Continue Shopping</button>
            </div>
        </div>
    `;
    document.body.appendChild(drawer);

    const contBtn = drawer.querySelector('#cart-continue-shopping');
    if (contBtn) {
        contBtn.addEventListener('click', () => window.toggleCart());
    }
}

function initGlobalCart() {
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;

    injectCartDrawer();

    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close');

    window.updateCartDrawer = () => {
        const cartIds = getCart();
        const allProjects = getProjects();
        const cartItems = cartIds.map(id => allProjects.find(p => p.id === id)).filter(Boolean);

        const cartBadge = document.getElementById('cart-count-badge');
        if (cartBadge) {
            cartBadge.textContent = cartItems.length;
            cartBadge.style.display = cartItems.length > 0 ? 'flex' : 'none';
        }

        const cartContainer = document.getElementById('cart-items');
        const totalAmountEl = document.getElementById('cart-total-amount');

        if (cartContainer) {
            if (cartItems.length === 0) {
                cartContainer.innerHTML = '<div class="empty-cart-state">Your cart is empty.</div>';
                if (totalAmountEl) totalAmountEl.textContent = '₹0.00';
            } else {
                let total = 0;
                cartContainer.innerHTML = cartItems.map(item => {
                    total += item.price;
                    return `
                        <div class="cart-item">
                            <img src="${item.image}" alt="" class="cart-item-img">
                            <div class="cart-item-details">
                                <h4 class="cart-item-title">${item.title}</h4>
                                <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
                            </div>
                            <button class="cart-item-remove clickable" data-id="${item.id}">✕</button>
                        </div>
                    `;
                }).join('');
                if (totalAmountEl) totalAmountEl.textContent = `₹${total.toFixed(2)}`;

                // Bind remove buttons
                cartContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        removeFromCart(id);
                        window.updateCartDrawer();
                        // Re-render shop projects if we are on shop page
                        if (typeof window.filterAndRenderProjects === 'function') {
                            window.filterAndRenderProjects();
                        }
                    });
                });
            }
        }

        // Re-render shop projects if we are on shop page
        if (typeof window.filterAndRenderProjects === 'function') {
            window.filterAndRenderProjects();
        }
    };

    window.toggleCart = () => {
        if (cartDrawer && cartBackdrop) {
            cartDrawer.classList.toggle('active');
            cartBackdrop.classList.toggle('active');
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target.closest('.cart-toggle-btn') || e.target === cartCloseBtn || e.target.id === 'cart-close' || e.target === cartBackdrop) {
            window.toggleCart();
        }

        // Handle checkout button clicks securely to avoid inline handler restrictions
        const checkoutBtn = e.target.closest('#checkout-btn-marketplace') || e.target.closest('#checkout-btn-global') || (e.target.textContent && e.target.textContent.trim() === 'Checkout Securely');
        if (checkoutBtn) {
            e.preventDefault();
            e.stopPropagation();
            const cart = getCart();
            if (!cart || cart.length === 0) {
                showToast('Your cart is empty. Please add items to your cart before checking out.', 'error');
            } else {
                window.location.href = 'checkout.html';
            }
        }
    });

    window.updateCartDrawer();
}

function detectPageAndLoadModule() {
    // We check for key semantic IDs in the markup to load modules safely

    // A. HOME PAGE
    if (document.getElementById('trending-projects-grid')) {
        hydrateHomePage();
    }

    // B. ANTIGRAVITY HERO SPECKS
    if (document.getElementById('particle-container')) {
        initParticles();
    }

    // TYPEWRITER HERO ANIMATION
    if (document.getElementById('typewriter-hero')) {
        initTypewriter();
    }

    // MARQUEE CAROUSEL
    if (document.getElementById('marquee-track')) {
        initMarqueeCarousel();
    }
    // How it works CAROUSEL
    //     if (document.querySelector('.workflow-carousel')) {
    //     initWorkflowCarousel();
    // }

    // SECONDARY CAROUSEL
    if (document.getElementById('secondary-carousel')) {
        initSecondaryCarousel();
    }

    // B. PORTFOLIO SHOWCASE PAGE
    if (document.getElementById('portfolio-projects-grid')) {
        initPortfolioPage();
    }

    // C. MARKETPLACE / SHOP PAGE
    if (document.getElementById('shop-projects-grid')) {
        initShopPage();
    }

    // E. PUBLIC PROFILE PAGE
    if (document.getElementById('prof-avatar')) {
        if (requireAuth()) {
            initProfilePage();
        }
    }

    // F. PORTFOLIO BUILDER PAGE
    if (document.querySelector('.portfolio-builder-container')) {
        if (requireAuth()) {
            initPortfolioBuilder().then(() => {
                console.log('Portfolio Builder initialized');
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }
    }
}



// --- Home Page Seeding Hydrators ---
// function hydrateHomePage() {
//     const trendingGrid = document.getElementById('trending-projects-grid');
//     const creatorsGrid = document.getElementById('creators-grid');

//     if (trendingGrid) {
//         const projects = getProjects().slice(0, 3); // Take top 3
//         trendingGrid.innerHTML = projects.map(p => `
//             <div class="glass-card spotlight-card project-home-card" data-id="${p.id}" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;">
//                 <div>
//                     <div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:16px;">
//                         <img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;">
//                         <span class="badge badge-primary" style="position:absolute;top:12px;left:12px;backdrop-filter:blur(8px);">${p.status}</span>
//                     </div>
                    
//                     <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
//                         <span class="text-mono" style="font-size:0.65rem;">BY @${p.seller}</span>
//                         <span style="font-weight:bold;color:var(--primary);font-size:0.95rem;">₹${p.price.toFixed(2)}</span>
//                     </div>
                    
//                     <h3 style="font-size:1.15rem;margin-bottom:8px;line-height:1.3;max-height:2.6em;overflow:hidden;">${p.title}</h3>
//                     <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:3em;overflow:hidden;margin-bottom:16px;">${p.description}</p>
//                 </div>
                
//                 <div>
//                     <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
//                         ${p.tags.slice(0, 3).map(t => `<span class="badge badge-outline" style="font-size:0.65rem;">${t}</span>`).join('')}
//                     </div>
                    
//                     <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border-color);">
//                         <div style="display:flex;gap:8px;">
//                             <button class="btn btn-secondary clickable home-like-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Like Product">
//                                 ♥ <span class="like-count" style="font-size:0.75rem;">${p.likes}</span>
//                             </button>
//                             <button class="btn btn-secondary clickable home-bookmark-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Bookmark Product">
//                                 ★
//                             </button>
//                         </div>
//                         <button class="btn btn-primary clickable home-preview-trigger" style="padding:6px 14px;font-size:0.75rem;">Preview</button>
//                     </div>
//                 </div>
//             </div>
//         `).join('');

//         bindHomeProjectActions();
//     }

//     if (creatorsGrid) {
//         const creators = getCreators().slice(0, 3); // Take top 3
//         creatorsGrid.innerHTML = creators.map(c => `
//             <div class="creator-showcase-card glass spotlight-card">
//                 <img src="${c.banner}" alt="banner" class="creator-banner-img">
//                 <div class="creator-details">
//                     <img src="${c.avatar}" alt="avatar" class="creator-avatar-img">
//                     <h3 style="font-size:1.15rem;margin-bottom:4px;">${c.name}</h3>
//                     <span class="text-mono" style="font-size:0.7rem;margin-bottom:12px;">@${c.username}</span>
//                     <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:4.5em;overflow:hidden;">${c.bio}</p>
                    
//                     <div class="creator-skills-row">
//                         ${c.skills.slice(0, 3).map(skill => `<span class="badge badge-outline" style="font-size:0.6rem;">${skill}</span>`).join('')}
//                     </div>
                    
//                     <div style="display:flex;justify-content:space-around;width:100%;margin-top:auto;padding-top:16px;border-top:1px solid var(--border-color);font-size:0.8rem;">
//                         <div><span style="font-weight:bold;color:var(--text-primary);">${c.stats.projects}</span> <span style="color:var(--text-muted);">Assets</span></div>
//                         <div><span style="font-weight:bold;color:var(--text-primary);">${c.stats.likes}</span> <span style="color:var(--text-muted);">Likes</span></div>
//                     </div>
//                 </div>
//             </div>
//         `).join('');
//     }
// }

// function bindHomeProjectActions() {
//     const grid = document.getElementById('trending-projects-grid');
//     if (!grid) return;

//     // Like button binding
//     grid.querySelectorAll('.home-like-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             const card = btn.closest('.project-home-card');
//             const id = card.dataset.id;
//             const result = likeProject(id);

//             const countNode = btn.querySelector('.like-count');
//             if (countNode) countNode.textContent = result.count;

//             if (result.isLiked) {
//                 btn.style.color = 'var(--danger)';
//                 btn.style.borderColor = 'var(--danger)';
//                 showToast('Added to liked list!', 'success');
//             } else {
//                 btn.style.color = '';
//                 btn.style.borderColor = '';
//                 showToast('Removed from liked list.', 'info');
//             }
//         });
//     });

//     // Bookmark button binding
//     grid.querySelectorAll('.home-bookmark-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             const card = btn.closest('.project-home-card');
//             const id = card.dataset.id;
//             const result = bookmarkProject(id);

//             if (result.isBookmarked) {
//                 btn.style.color = 'var(--warning)';
//                 btn.style.borderColor = 'var(--warning)';
//                 showToast('Saved to bookmarks!', 'success');
//             } else {
//                 btn.style.color = '';
//                 btn.style.borderColor = '';
//                 showToast('Removed from bookmarks.', 'info');
//             }
//         });
//     });

//     // Preview drawer binding
//     grid.querySelectorAll('.home-preview-trigger').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const card = btn.closest('.project-home-card');
//             const id = card.dataset.id;
//             openGlobalPreviewDrawer(id);
//         });
//     });
// }

// marquee A shaped


export function initMarqueeCarousel() {
    const track = document.getElementById('marquee-track');
    const container = track?.parentElement;
    if (!track || !container) return;

    const CARD_W = 420;
    const GAP = 16;
    const STEP = CARD_W + GAP;
    const PAUSE_MS = 1400;
    const MOVE_MS = 850;

    // Height per distance-step from center. All share same bottom baseline.
    // const HEIGHTS = [420, 350, 290, 240, 200];
    const HEIGHTS = [360, 320, 280, 240, 180];

    const origCards = Array.from(track.querySelectorAll('.marquee-card'));
    const total = origCards.length;
    origCards.forEach(c => track.appendChild(c.cloneNode(true)));
    origCards.forEach(c => track.appendChild(c.cloneNode(true)));
    const all = Array.from(track.querySelectorAll('.marquee-card'));

    let offset = 0;
    let centerIdx = total;
    let animating = false;

    const vpW = () => container.offsetWidth;

    function initOffset() {
        return vpW() / 2 - centerIdx * STEP - CARD_W / 2;
    }

    function styleCards(off) {
        const cx = vpW() / 2;
        all.forEach((card, i) => {
            const cardCx = off + i * STEP + CARD_W / 2;
            const frac = Math.abs(cardCx - cx) / STEP;
            const lo = Math.floor(frac);
            const hi = Math.min(lo + 1, HEIGHTS.length - 1);
            const t = frac - lo;
            const hLo = HEIGHTS[Math.min(lo, HEIGHTS.length - 1)];
            const hHi = HEIGHTS[hi];
            const h = hLo + (hHi - hLo) * t;
            const op = 0.55 + Math.max(0, 1 - frac / 2.5) * 0.45;
            card.style.height = h + 'px';
            card.style.opacity = op;
            card.style.transform = 'none'; // no scale, no translate
        });
    }

    function setTrack(off, animated) {
        track.style.transition = animated
            ? `transform ${MOVE_MS}ms cubic-bezier(0.4,0,0.2,1)`
            : 'none';
        track.style.transform = `translateX(${off}px)`;
    }

    function easeIO(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function advance() {
        if (animating) return;
        animating = true;

        const from = offset;
        const to = offset - STEP;
        const t0 = performance.now();

        setTrack(to, true);

        (function raf(now) {
            const p = Math.min((now - t0) / MOVE_MS, 1);
            styleCards(from + (to - from) * easeIO(p));
            if (p < 1) requestAnimationFrame(raf);
        })(performance.now());

        setTimeout(() => {
            offset = to;
            centerIdx++;
            animating = false;

            if (centerIdx >= total * 2) {
                centerIdx = total;
                offset = initOffset();
                setTrack(offset, false);
                track.getBoundingClientRect();
                styleCards(offset);
            }

            setTimeout(advance, PAUSE_MS);
        }, MOVE_MS);
    }

    function init() {
        offset = initOffset();
        setTrack(offset, false);
        styleCards(offset);
        setTimeout(advance, PAUSE_MS);
    }

    window.addEventListener('resize', () => {
        offset = initOffset();
        setTrack(offset, false);
        styleCards(offset);
    });

    setTimeout(init, 60);
}
export function initSecondaryCarousel() {
    const track = document.getElementById('secondary-carousel');
    const prevBtn = document.getElementById('sec-carousel-prev');
    const nextBtn = document.getElementById('sec-carousel-next');
    if (!track) return;

    const cards = Array.from(track.children);
    const perPage = window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
    const pages = Math.ceil(cards.length / perPage);
    let current = 0;

    // Rebuild footer as centered dots only
    const footer = track.closest('.feature-carousel-section').querySelector('.feature-carousel-footer');
    if (footer) {
        footer.innerHTML = '';
        footer.style.justifyContent = 'center';
        for (let i = 0; i < pages; i++) {
            const d = document.createElement('div');
            d.className = 'feature-dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => goTo(i));
            footer.appendChild(d);
        }
    }

    function cardStep() {
        return cards[0].offsetWidth + 20;
    }

    function goTo(p) {
        current = Math.max(0, Math.min(pages - 1, p));
        track.style.transform = `translateX(${-current * perPage * cardStep()}px)`;
        footer?.querySelectorAll('.feature-dot')
            .forEach((d, i) => d.classList.toggle('active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
}
// export function initWorkflowCarousel() {

//     const cards =
//         document.querySelectorAll('.workflow-card');

//     if (!cards.length) return;

//     let activeIndex = 1; // CREATE starts in center

//     function updateCards() {

//         cards.forEach(card => {
//             card.classList.remove(
//                 'prev',
//                 'active',
//                 'next'
//             );
//         });
//         // console.log("workflow initialized");

//         cards[activeIndex].classList.add('active');

//         cards[
//             (activeIndex - 1 + cards.length)
//             % cards.length
//         ].classList.add('prev');

//         cards[
//             (activeIndex + 1)
//             % cards.length
//         ].classList.add('next');
//     }

//     updateCards();

//     cards.forEach((card, index) => {

//         card.addEventListener('click', () => {

//             activeIndex = index;

//             updateCards();
//         });

//     });

//     let startX = 0;

//     const carousel =
//         document.querySelector('.workflow-carousel');

//     carousel.addEventListener('touchstart', e => {
//         startX = e.touches[0].clientX;
//     });

//     carousel.addEventListener('touchend', e => {

//         const endX =
//             e.changedTouches[0].clientX;

//         if (startX - endX > 50) {

//             activeIndex =
//                 (activeIndex + 1)
//                 % cards.length;

//             updateCards();
//         }

//         if (endX - startX > 50) {

//             activeIndex =
//                 (activeIndex - 1 + cards.length)
//                 % cards.length;

//             updateCards();
//         }
//     });

// }