import { getProjects, getCreators, bookmarkProject, addToCart } from './db.js';
import { showToast } from '../core/global.js';
import { getImage } from './images.js';

/* ==========================================================================
   HELPERS
   ========================================================================== */


/* ==========================================================================
   PROJECT CARD TEMPLATE
   Image-first. Bottom bar: name + price only.
   Hover: single "View Details" button over blurred image.
   ========================================================================== */

function renderProjectCard(project) {
    return `
        <div class="project-card" data-id="${project.id}">

            <div class="project-img-wrap">
                <img src="${getImage(project.image)}" alt="${project.title}" width="500" height="288" loading="lazy" decoding="async">

               

                <div class="project-hover-overlay">
                    <button class="overlay-btn-primary btn-view-details" data-id="${project.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5"
                             stroke-linecap="round" stroke-linejoin="round"
                             aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        View Details
                    </button>
                </div>
            </div>

            <div class="project-body">
                <h3 class="project-title">${project.title}</h3>
                <span class="project-price">₹${project.price.toFixed(2)}</span>
            </div>

        </div>
    `;
}

/* ==========================================================================
   BIND CARD EVENTS
   Call this immediately after rendering cards into the grid.
   ========================================================================== */

function bindProjectCardEvents(gridEl) {
    // "View Details" button — opens drawer, stops card click from double-firing
    gridEl.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openGlobalPreviewDrawer(btn.dataset.id);
        });
    });

    // Clicking anywhere on the card itself also opens the drawer
    gridEl.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            openGlobalPreviewDrawer(card.dataset.id);
        });
    });
}

/* ==========================================================================
   INIT PORTFOLIO / SHOWCASE PAGE
   ========================================================================== */

export function initPortfolioPage() {
    const creatorsSection = document.getElementById('portfolio-creators-list');
    const projectsGrid = document.getElementById('portfolio-projects-grid');

    if (!creatorsSection || !projectsGrid) return;

    // ── Render creator cards ──────────────────────────────────────────────────
    const creators = getCreators();
    creatorsSection.innerHTML = creators.map(creator => `
        <div class="creator-card" data-username="${creator.username}" style="position: relative;">
            <div class="creator-banner" style="background-image: url('${creator.banner}'); position: relative;">
                <button class="follow-icon-btn" title="Follow" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; backdrop-filter: blur(4px); transition: all 0.2s;" onclick="
                    const isFollowing = this.getAttribute('data-following') === 'true';
                    const countSpan = this.closest('.creator-card').querySelector('.follower-count');
                    let count = parseInt(countSpan.getAttribute('data-count'));
                    if (isFollowing) {
                        this.setAttribute('data-following', 'false');
                        this.innerHTML = '<svg width=\\'18\\' height=\\'18\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\\'></path><circle cx=\\'8.5\\' cy=\\'7\\' r=\\'4\\'></circle><line x1=\\'20\\' y1=\\'8\\' x2=\\'20\\' y2=\\'14\\'></line><line x1=\\'23\\' y1=\\'11\\' x2=\\'17\\' y2=\\'11\\'></line></svg>';
                        this.style.background = 'rgba(0,0,0,0.5)';
                        this.style.color = '#fff';
                        countSpan.textContent = count;
                    } else {
                        this.setAttribute('data-following', 'true');
                        this.innerHTML = '<svg width=\\'18\\' height=\\'18\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\\'></path><circle cx=\\'8.5\\' cy=\\'7\\' r=\\'4\\'></circle><polyline points=\\'17 11 19 13 23 9\\'></polyline></svg>';
                        this.style.background = 'var(--primary)';
                        this.style.color = 'var(--bg-base)';
                        countSpan.textContent = count + 1;
                    }
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </button>
            </div>
            <div class="creator-body">
                <div class="creator-avatar">
                    <img src="${creator.avatar}" alt="${creator.name}" width="64" height="64" loading="lazy" decoding="async">
                </div>
                <p class="creator-name" style="display: flex; align-items: center; gap: 8px;">
                    ${creator.name}
                    ${creator.stats && creator.stats.sales >= 300 ? '<span title="Elite Seller: 300+ Sales" style="background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Elite</span>' : 
                      creator.stats && creator.stats.sales >= 100 ? '<span title="Pro Seller: 100+ Sales" style="background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Pro</span>' : 
                      creator.stats && creator.stats.sales > 0 ? '<span title="Rising Seller" style="background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Rising</span>' : 
                      '<span title="New Creator" style="background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">New</span>'}
                </p>
                <p class="creator-handle">@${creator.username}</p>
                <p class="creator-bio">${creator.bio}</p>
                <div class="skills-row">
                    ${creator.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
                ${(() => {
                    const dummyFollowers = Math.floor(Math.random() * 900) + 100;
                    return `
                    <div class="creator-stats" style="margin: 12px 0; font-size: 0.9rem; color: var(--text-secondary);">
                        <span class="follower-count" data-count="${dummyFollowers}" style="font-weight: 600; color: var(--text-primary);">${dummyFollowers}</span> Followers
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <a href="view-portfolio.html?user=${creator.username}" class="btn-view" style="flex: 1; text-align: center; padding: 10px; border-radius: 8px;">View Portfolio</a>
                    </div>
                    `;
                })()}
            </div>
        </div>
    `).join('');

    // ── Render project cards ──────────────────────────────────────────────────
    const renderProjects = () => {
        const projects = getProjects().slice(0, 6);

        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="ti ti-ghost-2"></i>
                    <h3>No listings yet</h3>
                    <p>Add your project on the Sell Project page to get started.</p>
                </div>`;
            return;
        }

        // Use the new card template for every project
        projectsGrid.innerHTML = projects.map(renderProjectCard).join('');

        // Wire up the hover overlay button + card click → drawer
        bindProjectCardEvents(projectsGrid);
    };

    renderProjects();
}

/* ==========================================================================
   GLOBAL PREVIEW DRAWER
   ========================================================================== */

export function openGlobalPreviewDrawer(id, cartSet, syncCartSet) {
    try {
        console.log("openGlobalPreviewDrawer called for id:", id);
        const projects = getProjects();
        const p = projects.find(item => item.id === id);
        if (!p) {
            console.warn("Project not found for id:", id);
            return;
        }

        let drawer = document.getElementById('preview-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.className = 'preview-drawer';
            drawer.id = 'preview-drawer';
            drawer.innerHTML = `
                <div class="notification-header" style="border-bottom:1px solid var(--border-color);padding:20px 24px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 id="drawer-title" style="margin:0;font-size:1.15rem;">Project Preview</h3>
                    <button class="nav-btn clickable" id="drawer-close" style="width:32px;height:32px; display:flex; align-items:center; justify-content:center;">✕</button>
                </div>
                <div style="flex-grow:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;">
                    <img src="" alt="Thumbnail" id="drawer-img" style="width:100%;height:220px;object-fit:cover;border-radius:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-primary" id="drawer-badge">Web Experience</span>
                        <span style="font-weight:bold;color:var(--primary);font-size:1.2rem;" id="drawer-price">₹1099.00</span>
                    </div>
                    <p id="drawer-desc" style="font-size:0.9rem;line-height:1.6;color:var(--text-secondary);"></p>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <h4 style="font-size:0.8rem;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.05em;">Tech Specs</h4>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;" id="drawer-tags"></div>
                    </div>
                </div>
                <div style="padding:20px 24px;border-top:1px solid var(--border-color);display:flex;gap:12px;">
                    <button class="btn btn-glow clickable" style="flex-grow:1;" id="drawer-buy-btn">Add to Cart</button>
                </div>
            `;
            document.body.appendChild(drawer);

            // Re-bind the close button since we just created it
            const closeBtn = drawer.querySelector('#drawer-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    drawer.classList.remove('show');
                });
            }
        }

        const titleEl = document.getElementById('drawer-title');
        const imgEl = document.getElementById('drawer-img');
        const badgeEl = document.getElementById('drawer-badge');
        const priceEl = document.getElementById('drawer-price');
        const descEl = document.getElementById('drawer-desc');
        const tagsEl = document.getElementById('drawer-tags');
        const buyBtn = document.getElementById('drawer-buy-btn');

        if (titleEl) titleEl.textContent = p.title || '';
        if (imgEl) imgEl.src = p.image ? getImage(p.image) : '';
        if (badgeEl) badgeEl.textContent = p.status || p.category || '';
        if (priceEl) priceEl.textContent = `₹${(p.price || 0).toFixed(2)}`;
        if (descEl) descEl.textContent = p.description || '';

        if (tagsEl) {
            tagsEl.innerHTML = (p.tags || [])
                .map(t => `<span class="project-tag">${t}</span>`).join('');
        }

        // ── Live Demo & GitHub links inside drawer ────────────────────────────
        // Remove any previously injected link rows
        drawer.querySelectorAll('.drawer-link-row').forEach(el => el.remove());

        const drawerBody = drawer.querySelector('.drawer-body') || drawer.querySelector('[style*="overflow-y:auto"]');
        if (drawerBody) {
            const hasDemo = p.demoUrl && p.demoUrl !== '#';
            const hasGithub = p.github && p.github !== '#';

            if (hasDemo || hasGithub) {
                const linkRow = document.createElement('div');
                linkRow.className = 'drawer-link-row';
                linkRow.style.cssText = 'display:flex; gap:10px; flex-wrap:wrap;';

                if (hasDemo) {
                    const demoLink = document.createElement('a');
                    demoLink.href = p.demoUrl;
                    demoLink.target = '_blank';
                    demoLink.rel = 'noopener noreferrer';
                    demoLink.className = 'btn btn-secondary clickable drawer-demo-link';
                    demoLink.style.cssText = 'flex:1; text-align:center; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:0.85rem; padding:10px 16px; border-radius:10px;';
                    demoLink.innerHTML = 'View Live Demo';
                    linkRow.appendChild(demoLink);
                }

                if (hasGithub) {
                    const ghLink = document.createElement('a');
                    ghLink.href = p.github;
                    ghLink.target = '_blank';
                    ghLink.rel = 'noopener noreferrer';
                    ghLink.className = 'btn btn-secondary clickable drawer-github-link';
                    ghLink.style.cssText = 'flex:1; text-align:center; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:0.85rem; padding:10px 16px; border-radius:10px;';
                    ghLink.innerHTML = '⌥ View on GitHub';
                    linkRow.appendChild(ghLink);
                }

                drawerBody.appendChild(linkRow);
            }
        }

        // ── Buy / Cart button: reflects cartSet state ─────────────────────────
        if (buyBtn) {
            const alreadyInCart = cartSet ? cartSet.has(p.id) : false;
            buyBtn.textContent = alreadyInCart ? 'Added ✓' : 'Add to Cart';
            buyBtn.style.background = alreadyInCart ? 'rgba(16,185,129,0.15)' : '';
            buyBtn.style.color = alreadyInCart ? '#10b981' : '';
            buyBtn.style.borderColor = alreadyInCart ? '#10b981' : '';

            // Clone to remove any stale listeners
            const newBtn = buyBtn.cloneNode(true);
            buyBtn.parentNode.replaceChild(newBtn, buyBtn);

            newBtn.addEventListener('click', () => {
                const isInCart = cartSet ? cartSet.has(p.id) : false;

                if (isInCart) {
                    // Remove from cart
                    const { removeFromCart: remove } = { removeFromCart: () => { } }; // handled via db import
                    import('./db.js').then(({ removeFromCart }) => {
                        removeFromCart(p.id);
                        if (cartSet) cartSet.delete(p.id);
                        if (syncCartSet) syncCartSet();
                        newBtn.textContent = 'Add to Cart';
                        newBtn.style.background = '';
                        newBtn.style.color = '';
                        newBtn.style.borderColor = '';
                        showToast('Removed from your cart.', 'info');
                        if (window.updateCartDrawer) window.updateCartDrawer();
                        if (window.filterAndRenderProjects) window.filterAndRenderProjects();
                    });
                } else {
                    const result = addToCart(p.id);
                    if (result === null) return;
                    if (result) {
                        if (cartSet) cartSet.add(p.id);
                        if (syncCartSet) syncCartSet();
                        newBtn.textContent = 'Added ✓';
                        newBtn.style.background = 'rgba(16,185,129,0.15)';
                        newBtn.style.color = '#065a1dff';
                        newBtn.style.borderColor = '#077528ff';
                        showToast(`${p.title} added to cart!`, 'success');
                        if (window.updateCartDrawer) window.updateCartDrawer();
                        if (window.filterAndRenderProjects) window.filterAndRenderProjects();
                    } else {
                        showToast(`${p.title} is already in your cart.`, 'info');
                    }
                }
            });
        }

        // Wishlist removed

        drawer.classList.add('show');
        console.log("Preview drawer opened successfully for:", p.title);
    } catch (error) {
        console.error("Error in openGlobalPreviewDrawer:", error);
    }
}

export function closeGlobalPreviewDrawer() {
    const drawer = document.getElementById('preview-drawer');
    if (drawer) drawer.classList.remove('show');
}