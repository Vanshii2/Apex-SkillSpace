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

// --- Page Specific Imports ---
import { initPortfolioPage, openGlobalPreviewDrawer, closeGlobalPreviewDrawer } from './modules/portfolio.js';
import { initDashboard } from './modules/dashboard.js';
import { initProfilePage } from './modules/profile.js';
import { logoutUser, requireAuth, getCurrentUser } from './auth.js';
import { initParticles } from './modules/particles.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const drawerClose = document.getElementById('drawer-close');
    if (drawerClose) {
        drawerClose.addEventListener('click', closeGlobalPreviewDrawer);
    }

    // 5. Page-Specific Coordinators
    window.detectPageAndLoadModule = detectPageAndLoadModule;
    detectPageAndLoadModule();
});

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
    if (document.querySelector('.workflow-carousel')) {
    initWorkflowCarousel();
}

    // SECONDARY CAROUSEL
    if (document.getElementById('secondary-carousel')) {
        initSecondaryCarousel();
    }

    // B. PORTFOLIO SHOWCASE PAGE
    if (document.getElementById('portfolio-projects-grid')) {
        initPortfolioPage();
    }


    // D. USER HUB DASHBOARD
    if (document.getElementById('heatmap-grid')) {
        if (requireAuth()) {
            initDashboard();
        }
    }

    // E. PUBLIC PROFILE PAGE
    if (document.getElementById('prof-avatar')) {
        initProfilePage();
    }
}



// --- Home Page Seeding Hydrators ---
function hydrateHomePage() {
    const trendingGrid = document.getElementById('trending-projects-grid');
    const creatorsGrid = document.getElementById('creators-grid');

    if (trendingGrid) {
        const projects = getProjects().slice(0, 3); // Take top 3
        trendingGrid.innerHTML = projects.map(p => `
            <div class="glass-card spotlight-card project-home-card" data-id="${p.id}" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;">
                <div>
                    <div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:16px;">
                        <img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;">
                        <span class="badge badge-primary" style="position:absolute;top:12px;left:12px;backdrop-filter:blur(8px);">${p.status}</span>
                    </div>
                    
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span class="text-mono" style="font-size:0.65rem;">BY @${p.seller}</span>
                        <span style="font-weight:bold;color:var(--primary);font-size:0.95rem;">$${p.price.toFixed(2)}</span>
                    </div>
                    
                    <h3 style="font-size:1.15rem;margin-bottom:8px;line-height:1.3;max-height:2.6em;overflow:hidden;">${p.title}</h3>
                    <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:3em;overflow:hidden;margin-bottom:16px;">${p.description}</p>
                </div>
                
                <div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
                        ${p.tags.slice(0, 3).map(t => `<span class="badge badge-outline" style="font-size:0.65rem;">${t}</span>`).join('')}
                    </div>
                    
                    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border-color);">
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-secondary clickable home-like-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Like Product">
                                ♥ <span class="like-count" style="font-size:0.75rem;">${p.likes}</span>
                            </button>
                            <button class="btn btn-secondary clickable home-bookmark-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Bookmark Product">
                                ★
                            </button>
                        </div>
                        <button class="btn btn-primary clickable home-preview-trigger" style="padding:6px 14px;font-size:0.75rem;">Preview</button>
                    </div>
                </div>
            </div>
        `).join('');

        bindHomeProjectActions();
    }

    if (creatorsGrid) {
        const creators = getCreators().slice(0, 3); // Take top 3
        creatorsGrid.innerHTML = creators.map(c => `
            <div class="creator-showcase-card glass spotlight-card">
                <img src="${c.banner}" alt="banner" class="creator-banner-img">
                <div class="creator-details">
                    <img src="${c.avatar}" alt="avatar" class="creator-avatar-img">
                    <h3 style="font-size:1.15rem;margin-bottom:4px;">${c.name}</h3>
                    <span class="text-mono" style="font-size:0.7rem;margin-bottom:12px;">@${c.username}</span>
                    <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:4.5em;overflow:hidden;">${c.bio}</p>
                    
                    <div class="creator-skills-row">
                        ${c.skills.slice(0, 3).map(skill => `<span class="badge badge-outline" style="font-size:0.6rem;">${skill}</span>`).join('')}
                    </div>
                    
                    <div style="display:flex;justify-content:space-around;width:100%;margin-top:auto;padding-top:16px;border-top:1px solid var(--border-color);font-size:0.8rem;">
                        <div><span style="font-weight:bold;color:var(--text-primary);">${c.stats.projects}</span> <span style="color:var(--text-muted);">Assets</span></div>
                        <div><span style="font-weight:bold;color:var(--text-primary);">${c.stats.likes}</span> <span style="color:var(--text-muted);">Likes</span></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function bindHomeProjectActions() {
    const grid = document.getElementById('trending-projects-grid');
    if (!grid) return;

    // Like button binding
    grid.querySelectorAll('.home-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-home-card');
            const id = card.dataset.id;
            const result = likeProject(id);

            const countNode = btn.querySelector('.like-count');
            if (countNode) countNode.textContent = result.count;

            if (result.isLiked) {
                btn.style.color = 'var(--danger)';
                btn.style.borderColor = 'var(--danger)';
                showToast('Added to liked list!', 'success');
            } else {
                btn.style.color = '';
                btn.style.borderColor = '';
                showToast('Removed from liked list.', 'info');
            }
        });
    });

    // Bookmark button binding
    grid.querySelectorAll('.home-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-home-card');
            const id = card.dataset.id;
            const result = bookmarkProject(id);

            if (result.isBookmarked) {
                btn.style.color = 'var(--warning)';
                btn.style.borderColor = 'var(--warning)';
                showToast('Saved to bookmarks!', 'success');
            } else {
                btn.style.color = '';
                btn.style.borderColor = '';
                showToast('Removed from bookmarks.', 'info');
            }
        });
    });

    // Preview drawer binding
    grid.querySelectorAll('.home-preview-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.project-home-card');
            const id = card.dataset.id;
            openGlobalPreviewDrawer(id);
        });
    });
}

export function initMarqueeCarousel() {
    const track = document.getElementById('marquee-track');
    if (!track) return;

    // The marquee automatically scrolls via CSS animations.
    // The control buttons were removed to improve performance.
}


export function initSecondaryCarousel() {
    const track = document.getElementById('secondary-carousel');
    const prevBtn = document.getElementById('sec-carousel-prev');
    const nextBtn = document.getElementById('sec-carousel-next');
    if (!track) return;

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // Find width of first card + gap.
            const card = track.querySelector('.feature-card');
            if (card) {
                const scrollAmount = card.offsetWidth + 24; // 24px gap
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const card = track.querySelector('.feature-card');
            if (card) {
                const scrollAmount = card.offsetWidth + 24; // 24px gap
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    }
}
export function initWorkflowCarousel() {

    const cards =
        document.querySelectorAll('.workflow-card');

    if (!cards.length) return;

    let activeIndex = 1; // CREATE starts in center

    function updateCards() {

        cards.forEach(card => {
            card.classList.remove(
                'prev',
                'active',
                'next'
            );
        });
        // console.log("workflow initialized");

        cards[activeIndex].classList.add('active');

        cards[
            (activeIndex - 1 + cards.length)
            % cards.length
        ].classList.add('prev');

        cards[
            (activeIndex + 1)
            % cards.length
        ].classList.add('next');
    }

    updateCards();

    cards.forEach((card, index) => {

        card.addEventListener('click', () => {

            activeIndex = index;

            updateCards();
        });

    });

    let startX = 0;

    const carousel =
        document.querySelector('.workflow-carousel');

    carousel.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });

    carousel.addEventListener('touchend', e => {

        const endX =
            e.changedTouches[0].clientX;

        if (startX - endX > 50) {

            activeIndex =
                (activeIndex + 1)
                % cards.length;

            updateCards();
        }

        if (endX - startX > 50) {

            activeIndex =
                (activeIndex - 1 + cards.length)
                % cards.length;

            updateCards();
        }
    });

}