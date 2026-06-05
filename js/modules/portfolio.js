import { getProjects, getCreators, bookmarkProject, addToCart } from './db.js';
import { showToast } from '../core/global.js';

export function initPortfolioPage() {
    const creatorsSection = document.getElementById('portfolio-creators-list');
    const projectsGrid = document.getElementById('portfolio-projects-grid');

    if (!creatorsSection || !projectsGrid) return;

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
                <div class="creator-stats">
                 
                </div>
                <a href="view-portfolio.html?user=${creator.username}" class="btn-view">View portfolio</a>
            </div>
        </div>
    `).join('');

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

        projectsGrid.innerHTML = projects.map(p => {
            const isFeatured = p.status === 'Featured';
            const isTrending = p.status === 'Trending';
            const statusClass = isFeatured ? 'status-featured' : isTrending ? 'status-trending' : 'status-default';

            return `
                <div class="project-card" data-id="${p.id}">
                    <div class="project-img-wrap">
                        <img src="${p.image}" alt="${p.title}">
                        <span class="project-status ${statusClass}">${p.status}</span>
                    </div>
                    <div class="project-body">
                        <div class="project-meta">
                            <span class="project-seller">by @${p.seller}</span>
                            <span class="project-price">₹${p.price.toFixed(2)}</span>
                        </div>
                        <h3 class="project-title">${p.title}</h3>
                        <p class="project-desc">${p.description}</p>
                        <div class="project-tags">
                            ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                        </div>
                        <div class="project-footer">
                            <button class="btn-bookmark bookmark-btn" title="Bookmark">
                                <i class="ti ti-bookmark"></i>
                            </button>
                            <button class="btn-details preview-trigger">View details</button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        bindProjectInteractionListeners();
    };

    const bindProjectInteractionListeners = () => {
        projectsGrid.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.closest('.project-card').dataset.id;
                const result = bookmarkProject(id);
                btn.classList.toggle('active', result.isBookmarked);
                showToast(
                    result.isBookmarked ? 'Added to bookmarks!' : 'Removed from bookmarks.',
                    result.isBookmarked ? 'success' : 'info'
                );
            });
        });

        projectsGrid.querySelectorAll('.preview-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.closest('.project-card').dataset.id;
                openGlobalPreviewDrawer(id);
            });
        });
    };

    renderProjects();
}

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
    document.getElementById('drawer-tags').innerHTML = p.tags
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


