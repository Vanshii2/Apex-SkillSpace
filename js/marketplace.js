function createProjectCard(p) {
    const tagsHtml = (p.tags || [])
        .map(t => `<span class="badge badge-outline">${t}</span>`)
        .join('');

    return `
        <div class="project-card">
            <div class="project-card-img-wrapper">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
                <div class="project-card-overlay">
                    <button class="btn btn-primary clickable"
                        onclick="viewProjectDetails('${p.id}')">
                        View Details
                    </button>
                </div>
            </div>

            <div class="project-card-content">
                <div class="project-card-header">
                    <span class="badge badge-primary">${p.category || 'Asset'}</span>
                    <h3 class="project-card-title">${p.title}</h3>
                    <span class="project-card-seller">by ${p.seller}</span>
                </div>

                <div class="project-card-footer">
                    <span class="project-card-price">₹${Number(p.price).toFixed(2)}</span>
                    <button class="btn btn-glow clickable" onclick="addToCart('${p.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createFeaturedCard(p) {
    const tagsHtml = (p.tags || [])
        .map(t => `<span class="badge badge-outline">${t}</span>`)
        .join('');

    return `
        <div class="featured-card">
            <img src="${p.image}" alt="${p.title}" class="featured-card-img">

            <div class="featured-card-info">
                <span class="badge badge-glow">${p.category || 'Featured'}</span>

                <h2 class="featured-card-title">${p.title}</h2>

                <p class="featured-card-desc">${p.description}</p>

                <div class="project-card-tags" style="margin-bottom:24px;">
                    ${tagsHtml}
                </div>

                <div style="display:flex; gap:16px; align-items:center;">
                    <button class="btn btn-primary clickable"
                        onclick="viewProjectDetails('${p.id}')">
                        Explore Project
                    </button>

                    <span class="project-card-price" style="font-size:1.5rem;">
                        ₹${Number(p.price).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

window.viewProjectDetails = (id) => {
    // Assuming 'PROJECTS' is your imported or globally available array
    const p = PROJECTS.find(item => item.id === id);
    if (!p) return;

    document.getElementById('drawer-title').textContent = p.title;
    // CHANGED p.thumbnail to p.image
    document.getElementById('drawer-img').src = p.image; 
    document.getElementById('drawer-badge').textContent = p.category || 'Asset';
    document.getElementById('drawer-price').textContent = `₹${Number(p.price).toFixed(2)}`;
    document.getElementById('drawer-desc').textContent = p.description;

    document.getElementById('drawer-tags').innerHTML =
        (p.tags || [])
            .map(t => `<span class="badge badge-outline">${t}</span>`)
            .join('');

    const buyBtn = document.getElementById('drawer-buy-btn');

    if (buyBtn) {
        buyBtn.onclick = () => {
            const isAdded = addToCart(p.id);
            if (isAdded === null) return;
        };
    }

    document.getElementById('preview-drawer')?.classList.add('show');
};