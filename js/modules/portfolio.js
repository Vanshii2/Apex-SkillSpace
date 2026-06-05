import { getProjects, getCreators, bookmarkProject, addToCart } from './db.js';
import { showToast } from '../core/global.js';

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
                <img src="${project.image}" alt="${project.title}" loading="lazy">

               

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
    const projectsGrid    = document.getElementById('portfolio-projects-grid');

    if (!creatorsSection || !projectsGrid) return;

    // ── Render creator cards ──────────────────────────────────────────────────
    const creators = getCreators();
    creatorsSection.innerHTML = creators.map(creator => `
        <div class="creator-card" data-username="${creator.username}">
            <div class="creator-banner" style="background-image: url('${creator.banner}');"></div>
            <div class="creator-body">
                <div class="creator-avatar">
                    <img src="${creator.avatar}" alt="${creator.name}">
                </div>
                <p class="creator-name">${creator.name}</p>
                <p class="creator-handle">@${creator.username}</p>
                <p class="creator-bio">${creator.bio}</p>
                <div class="skills-row">
                    ${creator.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
                <div class="creator-stats"></div>
                <a href="view-portfolio.html?user=${creator.username}" class="btn-view">View portfolio</a>
            </div>
        </div>
    `).join('');

    // ── Render project cards ──────────────────────────────────────────────────
    const renderProjects = () => {
        const projects = getProjects();

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

export function openGlobalPreviewDrawer(id) {
    const projects = getProjects();
    const p = projects.find(item => item.id === id);
    if (!p) return;

    const drawer = document.getElementById('preview-drawer');
    if (!drawer) return;

    document.getElementById('drawer-title').textContent  = p.title;
    document.getElementById('drawer-img').src            = p.image;
    document.getElementById('drawer-badge').textContent  = p.status;
    document.getElementById('drawer-price').textContent  = `₹${p.price.toFixed(2)}`;
    document.getElementById('drawer-desc').textContent   = p.description;
    document.getElementById('drawer-tags').innerHTML     = p.tags
        .map(t => `<span class="project-tag">${t}</span>`).join('');

    document.getElementById('drawer-buy-btn').onclick = () => {
        const isAdded = addToCart(p.id);
        showToast(
            isAdded ? `${p.title} added to cart!` : `${p.title} is already in your cart.`,
            isAdded ? 'success' : 'info'
        );
        if (isAdded && window.updateCartDrawer) window.updateCartDrawer();
    };

    const wishBtn = document.getElementById('drawer-wishlist-btn');
    if (wishBtn) {
        wishBtn.onclick = () => {
            showToast(`Saved ${p.title} to your wishlist!`, 'success');
            drawer.classList.remove('show');
        };
    }

    drawer.classList.add('show');
}

export function closeGlobalPreviewDrawer() {
    const drawer = document.getElementById('preview-drawer');
    if (drawer) drawer.classList.remove('show');
}