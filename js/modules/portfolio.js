/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - PORTFOLIO SHOWCASE LOGIC
   Loads verified creators and active portfolios dynamically from DB.
   ==========================================================================
*/
/*
*/
import { getProjects, getCreators, likeProject, bookmarkProject, addToCart } from './db.js';
import { showToast } from '../core/global.js';

export function initPortfolioPage() {
    const creatorsSection = document.getElementById('portfolio-creators-list');
    const projectsGrid = document.getElementById('portfolio-projects-grid');

    if (!creatorsSection || !projectsGrid) return;

    // Render all verified creators
    const creators = getCreators();
    creatorsSection.innerHTML = creators.map(creator => `
    <div class="creator-showcase-card glass spotlight-card" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
        <div style="width:100%;">
            <img src="${creator.banner}" alt="banner" class="creator-banner-img">
            <div class="creator-details">
                <img src="${creator.avatar}" alt="avatar" class="creator-avatar-img">
                <h3 style="font-size:1.1rem;margin-bottom:4px;">${creator.name}</h3>
                <span class="text-mono" style="font-size:0.7rem;margin-bottom:12px;">@${creator.username}</span>
                <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:60px;overflow:hidden;">${creator.bio}</p>
                
                <div class="creator-skills-row">
                    ${creator.skills.slice(0, 3).map(skill => `<span class="badge badge-outline" style="font-size:0.6rem;">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
        
        <div style="padding:0 24px 24px 24px; display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex;justify-content:space-around;width:100%;padding-top:16px;border-top:1px solid var(--border-color);font-size:0.8rem;">
                <div><span style="font-weight:bold;color:var(--text-primary);">${creator.stats.projects}</span> <span style="color:var(--text-muted);">Projects</span></div>
                <div><span style="font-weight:bold;color:var(--text-primary);">${creator.stats.likes}</span> <span style="color:var(--text-muted);">Likes</span></div>
            </div>
            <a href="view-portfolio.html?user=${creator.username}" class="btn btn-primary clickable" style="width:100%; text-align:center; padding:8px 0; font-size:0.75rem; display:block; text-decoration:none;">View Portfolio</a>
        </div>
    </div>
`).join('');

    // Render all projects
    const renderProjects = () => {
        const projects = getProjects();
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
                <div style="font-size:3rem;margin-bottom:16px;">⚱</div>
                <h3>No portfolio listings found</h3>
                <p style="color:var(--text-muted);margin-top:8px;">Add your project in the Sell Project page to seed the list.</p>
            </div>
        `;
            return;
        }

        projectsGrid.innerHTML = projects.map(p => {
            const isFeatured = p.status === 'Featured' || p.status === 'Trending';
            return `
            <div class="glass-card spotlight-card project-portfolio-card" data-id="${p.id}" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;">
                <div>
                    <div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:16px;">
                        <img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;">
                        <span class="badge ${isFeatured ? 'badge-primary' : 'badge-outline'}" style="position:absolute;top:12px;left:12px;backdrop-filter:blur(8px);">${p.status}</span>
                    </div>
                    
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <span class="text-mono" style="font-size:0.65rem;">BY @${p.seller}</span>
                        <span style="font-weight:bold;color:var(--primary);font-size:0.95rem;">₹${p.price.toFixed(2)}</span>
                    </div>
                    
                    <h3 style="font-size:1.1rem;margin-bottom:8px;line-height:1.3;max-height:2.6em;overflow:hidden;">${p.title}</h3>
                    <p style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary);max-height:4.5em;overflow:hidden;margin-bottom:16px;">${p.description}</p>
                </div>
                
                <div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
                        ${p.tags.map(t => `<span class="badge badge-outline" style="font-size:0.65rem;">${t}</span>`).join('')}
                    </div>
                    
                    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border-color);">
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-secondary clickable like-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Like Project">
                                ♥ <span class="like-count" style="font-size:0.75rem;margin-left:2px;">${p.likes}</span>
                            </button>
                            <button class="btn btn-secondary clickable bookmark-btn" style="width:36px;height:36px;padding:0;border-radius:50%;" title="Bookmark Project">
                                ★
                            </button>
                        </div>
                        
                        <button class="btn btn-primary clickable preview-trigger" style="padding:6px 14px;font-size:0.75rem;">View Details</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        bindProjectInteractionListeners();
    };

    const bindProjectInteractionListeners = () => {
        // Like handlers
        projectsGrid.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.project-portfolio-card');
                const id = card.dataset.id;
                const result = likeProject(id);

                const countNode = btn.querySelector('.like-count');
                if (countNode) countNode.textContent = result.count;

                if (result.isLiked) {
                    btn.style.color = 'var(--danger)';
                    btn.style.borderColor = 'var(--danger)';
                    showToast('Project added to liked list!', 'success');
                } else {
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    showToast('Project removed from liked list.', 'info');
                }
            });
        });

        // Bookmark handlers
        projectsGrid.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.project-portfolio-card');
                const id = card.dataset.id;
                const result = bookmarkProject(id);

                if (result.isBookmarked) {
                    btn.style.color = 'var(--warning)';
                    btn.style.borderColor = 'var(--warning)';
                    showToast('Project added to bookmarks!', 'success');
                } else {
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    showToast('Project removed from bookmarks.', 'info');
                }
            });
        });

        // Preview drawer trigger
        projectsGrid.querySelectorAll('.preview-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.project-portfolio-card');
                const id = card.dataset.id;
                openGlobalPreviewDrawer(id);
            });
        });
    };

    renderProjects();
}
// Global preview drawer helper attached to document scope
export function openGlobalPreviewDrawer(id) {
    const projects = getProjects();
    const p = projects.find(item => item.id === id);
    if (!p) return;

    const drawer = document.getElementById('preview-drawer');
    if (!drawer) return;

    document.getElementById('drawer-title').textContent = p.title;
    document.getElementById('drawer-img').src = p.image;
    document.getElementById('drawer-badge').textContent = p.status;
    document.getElementById('drawer-price').textContent = `₹${p.price.toFixed(2)}`;
    document.getElementById('drawer-desc').textContent = p.description;

    const tagsContainer = document.getElementById('drawer-tags');
    tagsContainer.innerHTML = p.tags.map(t => `<span class="badge badge-outline">${t}</span>`).join('');

    // Wire drawer action buttons
    const buyBtn = document.getElementById('drawer-buy-btn');
    const wishBtn = document.getElementById('drawer-wishlist-btn');

    buyBtn.onclick = () => {
        const isAdded = addToCart(p.id);
        if (isAdded) {
            showToast(`${p.title} added to shopping cart!`, 'success');
            if (window.updateCartDrawer) window.updateCartDrawer();
        } else {
            showToast(`${p.title} is already in the cart.`, 'info');
        }
    };

    if (wishBtn) {
        wishBtn.onclick = () => {
            showToast(`Saved ${p.title} to your profile wishlist!`, 'success');
            drawer.classList.remove('show');
        };
    }

    drawer.classList.add('show');
}
export function closeGlobalPreviewDrawer() {
    const drawer = document.getElementById('preview-drawer');
    if (drawer) drawer.classList.remove('show');
}

