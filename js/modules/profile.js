/*
   ==========================================================================
   FUTURISTIC PORTFOLIO - PROFILE PAGE LOGIC (RE-ENGINEERED)
   ==========================================================================
*/
import { storeImage, getImage } from './images.js';
// --- LOCAL STORAGE DATA LAYER ---
export function getUser() {
    let u = localStorage.getItem('dx_user');
    if (u) {
        try {
            const parsed = JSON.parse(u);
            // Check if this is a real user (not the seeded placeholder)
            if (parsed && parsed.name && parsed.name !== 'Nova Stark') {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing dx_user:', e);
        }
    }

    // Try to get the real user from apex_user_data (set by auth.js on signup/login)
    let authData = localStorage.getItem('apex_user_data');
    if (authData) {
        try {
            const authUser = JSON.parse(authData);
            if (authUser && authUser.name) {
                const username = authUser.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                // Check if we have an existing dx_user with extra fields (bio, avatar, etc)
                let existingDx = null;
                try { existingDx = JSON.parse(localStorage.getItem('dx_user')); } catch (_) { }
                const userObj = {
                    name: authUser.name,
                    username: existingDx && existingDx.username && existingDx.username !== 'apex_user' ? existingDx.username : username,
                    bio: (existingDx && existingDx.bio) || '',
                    avatar: (existingDx && existingDx.avatar) || '',
                    skills: (existingDx && existingDx.skills) || [],
                    followers: (existingDx && existingDx.followers) || 0,
                    availability: (existingDx && existingDx.availability) || 'Available for Work'
                };
                saveUser(userObj);
                return userObj;
            }
        } catch (e) {
            console.error('Error parsing apex_user_data:', e);
        }
    }

    // Migration fallback: use fpm_user_session if present
    let fpmSession = localStorage.getItem('fpm_user_session');
    let userObj = fpmSession ? JSON.parse(fpmSession) : null;
    if (!userObj) {
        userObj = {
            name: 'Creator',
            username: 'user',
            bio: '',
            avatar: '',
            skills: [],
            followers: 0,
            availability: 'Available for Work'
        };
    } else {
        userObj = {
            name: userObj.name || 'Creator',
            username: userObj.username || 'user',
            bio: userObj.bio || '',
            avatar: userObj.avatar || '',
            skills: userObj.skills || [],
            followers: userObj.followers || 0,
            availability: userObj.availability || 'Available for Work'
        };
    }
    saveUser(userObj);
    return userObj;
}

export function saveUser(user) {
    localStorage.setItem('dx_user', JSON.stringify(user));
}

export function getProjects() {
    let p = localStorage.getItem('dx_projects');
    if (p) {
        try {
            return JSON.parse(p);
        } catch (e) {
            console.error('Error parsing dx_projects:', e);
        }
    }

    // Migration fallback
    let fpmProjects = localStorage.getItem('fpm_projects');
    let projectsArray = fpmProjects ? JSON.parse(fpmProjects) : null;
    if (!projectsArray || projectsArray.length === 0) {
        projectsArray = [
            {
                id: 'proj_1',
                title: 'AI Face Recognition Project',
                description: 'This sophisticated software uses artificial intelligence algorithms to quickly and accurately detect and identify faces within photos or live video feeds.',
                seller: 'apex_user',
                price: 99.00,
                tags: ['AI', 'Python', 'Security'],
                category: 'AI Projects',
                demoUrl: 'https://github.com',
                thumbnail: 'assets/project1.webp',
                createdAt: new Date().toISOString()
            },
            {
                id: 'proj_2',
                title: 'Heart Disease Tracking',
                description: 'A helpful digital tool designed to let users easily log and track important heart health indicators like blood pressure and heart rate over time.',
                seller: 'apex_user',
                price: 79.00,
                tags: ['Health', 'Dashboard'],
                category: 'Dashboard',
                demoUrl: 'https://github.com',
                thumbnail: 'assets/project2.webp',
                createdAt: new Date().toISOString()
            }
        ];
    } else {
        projectsArray = projectsArray.map(item => ({
            id: item.id || `proj_${Date.now()}_${Math.random()}`,
            title: item.title,
            category: item.category || 'Dashboard',
            description: item.description,
            price: parseFloat(item.price) || 0,
            tags: item.tags || [],
            demoUrl: item.liveDemo || item.demoUrl || '',
            thumbnail: item.image || item.thumbnail || 'assets/project1.webp',
            seller: item.seller || 'apex_user',
            createdAt: item.createdAt || new Date().toISOString()
        }));
    }
    saveProjects(projectsArray);
    return projectsArray;
}

export function saveProjects(projects) {
    localStorage.setItem('dx_projects', JSON.stringify(projects));
    // Also sync to fpm_projects so marketplace (shop.js via db.js) sees the new projects
    const fpmProjects = projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        seller: p.seller,
        price: p.price,
        tags: p.tags || [],
        category: p.category || 'Dashboard',
        status: p.status || 'New',
        likes: p.likes || 0,
        bookmarks: p.bookmarks || 0,
        views: p.views || 1,
        image: p.thumbnail || p.image || 'assets/project1.webp',
        demoUrl: p.demoUrl || '#',
        liveDemo: p.demoUrl || '#',
        github: '#',
        createdAt: p.createdAt || new Date().toISOString()
    }));
    localStorage.setItem('fpm_projects', JSON.stringify(fpmProjects));
}

// Helper to split full name into first name (solid) and last name (outline)
export function updateDisplayNameUI(name) {
    const solidEl = document.getElementById('prof-name-solid');
    const outlineEl = document.getElementById('prof-name-outline');
    if (!solidEl || !outlineEl) return;

    const parts = (name || '').trim().split(/\s+/);
    const first = parts[0] || 'Creator';
    const last = parts.slice(1).join(' ') || 'Name';

    solidEl.textContent = first;
    outlineEl.textContent = last;
}

// --- INITIALIZE PAGE SYSTEM ---
export function initProfilePage() {
    const user = getUser();
    if (!user) return;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Populate user details in hero
    const inlineName = document.getElementById('prof-name-inline');
    if (inlineName) inlineName.textContent = user.name;
    updateDisplayNameUI(user.name);

    const handleEl = document.getElementById('prof-handle');
    if (handleEl) handleEl.textContent = '@' + user.username;

    // Bio
    const bioText = document.getElementById('prof-bio-text');
    if (bioText) {
        bioText.textContent = user.bio || 'Enter a short professional biography here.';
    }

    // Sidebar Capabilities (safely check first)
    const skillsContainer = document.getElementById('prof-skills-container');
    if (skillsContainer) {
        skillsContainer.innerHTML = (user.skills || []).map(s => `<span class="skill-badge">${s}</span>`).join('');
    }

    // Skills Marquee (safely check first)
    const marqueeEl = document.getElementById('prof-marquee-content');
    if (marqueeEl && user.skills && user.skills.length > 0) {
        const marqueeList = [...user.skills, ...user.skills, ...user.skills, ...user.skills];
        marqueeEl.innerHTML = marqueeList.map(s => `<span class="skills-marquee-item">${s}</span>`).join('');
    }

    // Avatar UI and Availability Status Badge (safely check first)
    updateAvatarUI(user);
    updateAvailabilityUI(user);

    // Initialize Components
    initTabs();
    updateStatsAndSummary();
    renderPublishedTab();
    setupUploadForm();
    setupDetailDrawerHandlers();
    setupEditProfileModal();
}

// --- HELPER FUNCTION IMPLEMENTATIONS ---
function updateAvatarUI(user) {
    const avatarImg = document.getElementById('prof-avatar');
    const initialsSpan = document.getElementById('prof-avatar-initials');
    const avatarContainer = document.getElementById('prof-avatar-container');

    if (!avatarContainer) return;

    if (user.avatar) {
        if (avatarImg) {
            avatarImg.src = getImage(user.avatar);
            avatarImg.style.display = 'block';
        }
        if (initialsSpan) {
            initialsSpan.style.display = 'none';
        }
    } else {
        if (avatarImg) {
            avatarImg.style.display = 'none';
        }
        if (initialsSpan) {
            let initials = 'U';
            if (user.name) {
                const parts = user.name.trim().split(/\s+/);
                if (parts.length >= 2) {
                    initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                } else if (parts.length === 1) {
                    initials = parts[0].substring(0, 2).toUpperCase();
                }
            }
            initialsSpan.textContent = initials;
            initialsSpan.style.display = 'flex';
        }
    }
}

function updateAvailabilityUI(user) {
    const dot = document.getElementById('prof-availability-dot');
    const text = document.getElementById('prof-availability-text');
    if (!text || !dot) return;

    const status = user.availability || 'Available for Work';
    text.textContent = status;

    // Reset classes
    dot.className = 'pulsing-dot';

    if (status === 'Available for Work' || status === 'Open to Freelance') {
        dot.classList.add('available');
    } else if (status === 'Busy') {
        dot.classList.add('busy');
    } else if (status === 'Hiring') {
        dot.classList.add('hiring');
    }
}

function updateStatsAndSummary() {
    const user = getUser();
    const projects = getProjects().filter(p => p.seller === user.username);

    // Update main metrics safely
    const followersEl = document.getElementById('prof-followers-count');
    const projectsEl = document.getElementById('prof-projects-count');
    const revenueEl = document.getElementById('prof-revenue-amount');

    if (followersEl) followersEl.textContent = user.followers || 0;
    if (projectsEl) projectsEl.textContent = projects.length;

    const revenueSum = projects.reduce((sum, p) => sum + (p.price || 0), 0);
    if (revenueEl) revenueEl.textContent = `₹${revenueSum.toFixed(2)}`;

    // Update Seller Summary card
    const summaryPublished = document.getElementById('summary-published-count');
    const summaryRevenue = document.getElementById('summary-revenue-amount');
    const summaryAvgPrice = document.getElementById('summary-avg-price');
    const summaryCategories = document.getElementById('summary-categories');

    if (summaryPublished) summaryPublished.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'}`;
    if (summaryRevenue) summaryRevenue.textContent = `₹${revenueSum.toFixed(2)}`;

    const avg = projects.length > 0 ? (revenueSum / projects.length) : 0;
    if (summaryAvgPrice) summaryAvgPrice.textContent = `₹${avg.toFixed(2)}`;

    const uniqueCats = [...new Set(projects.map(p => p.category).filter(Boolean))];
    if (summaryCategories) {
        summaryCategories.textContent = uniqueCats.length > 0 ? uniqueCats.join(', ') : 'None';
    }
}

// --- TABS SYSTEM ---
function initTabs() {
    const tabs = document.querySelectorAll('.profile-tab-btn');
    const contents = document.querySelectorAll('.profile-tab-content');
    const indicator = document.querySelector('.tab-indicator');
    const nav = document.querySelector('.profile-tabs-nav');

    if (!tabs.length || !indicator || !nav) return;

    const updateIndicator = (activeBtn) => {
        const navRect = nav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        indicator.style.left = (btnRect.left - navRect.left) + 'px';
        indicator.style.width = btnRect.width + 'px';
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            updateIndicator(tab);

            if (tab.dataset.tab === 'published') {
                renderPublishedTab();
            } else if (tab.dataset.tab === 'portfolios') {
                renderPortfoliosTab();
            }
        });
    });

    const activeTab = document.querySelector('.profile-tab-btn.active');
    if (activeTab) {
        setTimeout(() => updateIndicator(activeTab), 100);
    }

    const handleResize = () => {
        if (!document.getElementById('prof-avatar')) {
            window.removeEventListener('resize', handleResize);
            return;
        }
        const currentActive = document.querySelector('.profile-tab-btn.active');
        if (currentActive) {
            updateIndicator(currentActive);
        }
    };
    window.addEventListener('resize', handleResize);
}

function renderPublishedTab() {
    const grid = document.getElementById('prof-uploaded-projects-grid');
    if (!grid) return;

    const user = getUser();
    const allProjects = getProjects();
    const owned = allProjects.filter(p => p.seller === user.username);

    if (owned.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i data-lucide="folder-open" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
                <p style="color:var(--text-secondary); font-size:0.95rem; margin: 0 0 8px 0;">You have not published any projects yet.</p>
                <button class="pill-btn solid clickable" id="empty-switch-to-upload" style="padding: 10px 20px; font-size: 0.85rem;">Upload a Project</button>
            </div>
        `;
        const switchBtn = document.getElementById('empty-switch-to-upload');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                const uploadTabBtn = document.querySelector('.profile-tab-btn[data-tab="upload"]');
                if (uploadTabBtn) uploadTabBtn.click();
            });
        }
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    grid.innerHTML = owned.map(p => `
        <div class="project-card clickable" data-id="${p.id}">
            <img src="${p.thumbnail || 'assets/project1.webp'}" alt="${p.title}" class="project-img">
            <div class="project-info">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px; gap: 8px;">
                    <h3 class="project-title" style="font-size: 1rem; margin:0; line-height:1.3; font-weight:600; font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.02em;">${p.title}</h3>
                    <span class="badge" style="padding: 4px 8px; background: rgba(128,128,128,0.06); border: 1px solid var(--border-color); border-radius: 99px; font-size: 0.7rem; font-family:var(--font-mono); text-transform:uppercase; flex-shrink:0;">${p.category || 'Dashboard'}</span>
                </div>
                <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">₹${(p.price || 0).toFixed(2)}</div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openProjectDetailDrawer(id);
        });
    });

    if (window.lucide) window.lucide.createIcons();
}

function deletePortfolioItem(portId) {
    if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
        let list = [];
        const savedList = localStorage.getItem('dx_portfolios') || localStorage.getItem('apex-portfolios-list');
        if (savedList) {
            try {
                list = JSON.parse(savedList);
            } catch (e) {
                console.error(e);
            }
        }
        list = list.filter(p => p.id !== portId);
        localStorage.setItem('dx_portfolios', JSON.stringify(list));
        localStorage.setItem('apex-portfolios-list', JSON.stringify(list));
        renderPortfoliosTab();
        showToast('Portfolio deleted successfully.', 'success');
    }
}

function renderPortfoliosTab() {
    const grid = document.getElementById('prof-portfolios-grid');
    if (!grid) return;

    let list = [];
    const savedList = localStorage.getItem('dx_portfolios') || localStorage.getItem('apex-portfolios-list');
    if (savedList) {
        try {
            list = JSON.parse(savedList);
        } catch (e) {
            console.error(e);
        }
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i data-lucide="book-open" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
                <p style="color:var(--text-secondary); font-size:0.95rem; margin: 0 0 8px 0;">No portfolios created yet.</p>
                <a href="portfolio.html" class="pill-btn solid clickable" style="text-decoration: none; padding: 10px 20px; font-size: 0.85rem;">Create a Portfolio</a>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    grid.innerHTML = list.map(port => {
        const themeLabel = port.selectedTemplate || 'minimal';
        const thumbnail = port.photo || 'assets/right2.jpg';
        return `
            <div class="portfolio-card" style="border: 1px solid var(--border-color); border-radius:16px; overflow:hidden; background:var(--bg-base); display:flex; flex-direction:column; height: 100%;">
                <div style="height: 160px; overflow:hidden; position:relative;">
                    <img src="${thumbnail}" alt="${port.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="padding: 16px; display:flex; flex-direction:column; gap:4px; border-bottom: 1px solid var(--border-color);">
                    <h4 style="margin:0; font-size: 1rem; font-weight:600; font-family:var(--font-mono); text-transform:uppercase;">${port.name || 'Untitled Portfolio'}</h4>
                    <span style="font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-mono); text-transform:uppercase; margin-top:2px;">Theme: ${themeLabel}</span>
                </div>
                <div class="portfolio-card-actions">
                    <button class="pill-btn solid clickable btn-view-portfolio" data-id="${port.id}" style="flex: 1;">View</button>
                    <button class="pill-btn outline clickable btn-delete-portfolio" data-id="${port.id}" style="flex: 1; border-color: rgba(239, 68, 68, 0.4); color: #ef4444;">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    // Bind action listeners
    grid.querySelectorAll('.btn-view-portfolio').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const portId = btn.dataset.id;
            const port = list.find(p => p.id === portId);
            if (port) {
                localStorage.setItem('apex-portfolio', JSON.stringify(port));
                window.open('view-portfolio.html?user=current', '_blank');
            }
        });
    });

    grid.querySelectorAll('.btn-delete-portfolio').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const portId = btn.dataset.id;
            deletePortfolioItem(portId);
        });
    });

    if (window.lucide) window.lucide.createIcons();
}

// --- UPLOAD FORM CONTROLLER ---
let selectedThumbId = null;

function setupUploadForm() {
    const thumbZone = document.getElementById('thumb-drop-zone');
    const thumbInput = document.getElementById('thumb-file-input');
    const thumbPreview = document.getElementById('thumb-preview-img');
    const placeholder = thumbZone ? thumbZone.querySelector('.drop-zone-placeholder') : null;

    if (thumbZone && thumbInput) {
        thumbZone.addEventListener('click', () => thumbInput.click());

        thumbZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            thumbZone.style.borderColor = 'var(--text-primary)';
            thumbZone.style.background = 'rgba(128, 128, 128, 0.08)';
        });
        thumbZone.addEventListener('dragleave', () => {
            thumbZone.style.borderColor = 'var(--border-color)';
            thumbZone.style.background = 'rgba(128, 128, 128, 0.02)';
        });
        thumbZone.addEventListener('drop', (e) => {
            e.preventDefault();
            thumbZone.style.borderColor = 'var(--border-color)';
            thumbZone.style.background = 'rgba(128, 128, 128, 0.02)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleThumbFile(e.dataTransfer.files[0]);
            }
        });
        thumbInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleThumbFile(e.target.files[0]);
            }
        });
    }

    function handleThumbFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedThumbId = storeImage(e.target.result);
            if (thumbPreview) {
                thumbPreview.src = e.target.result; // show the raw base64 only for preview
                thumbPreview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            document.getElementById('upload-thumb-error').parentElement.classList.remove('invalid');
        };
        reader.readAsDataURL(file);
    }

    // Actions
    const clearBtn = document.getElementById('btn-clear-upload');
    if (clearBtn) clearBtn.addEventListener('click', clearUploadForm);

    const publishBtn = document.getElementById('btn-publish-project');
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('upload-title');
            const categoryInput = document.getElementById('upload-category');
            const descInput = document.getElementById('upload-description');
            const priceInput = document.getElementById('upload-price');
            const tagsInput = document.getElementById('upload-tags');
            const demoUrlInput = document.getElementById('upload-demo-url');

            const title = titleInput.value.trim();
            const category = categoryInput.value;
            const description = descInput.value.trim();
            const priceVal = priceInput.value.trim();
            const tagsRaw = tagsInput.value.trim();
            const demoUrl = demoUrlInput.value.trim();

            let isValid = true;

            // Validate Title
            if (!title) {
                titleInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                titleInput.parentElement.classList.remove('invalid');
            }

            // Validate Category
            if (!category) {
                categoryInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                categoryInput.parentElement.classList.remove('invalid');
            }

            // Validate Description
            if (!description) {
                descInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                descInput.parentElement.classList.remove('invalid');
            }

            // Validate Thumbnail
            if (!selectedThumbId) {
                document.getElementById('thumb-drop-zone').parentElement.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('thumb-drop-zone').parentElement.classList.remove('invalid');
            }

            // Validate Price
            const price = parseFloat(priceVal);
            if (isNaN(price) || price < 0) {
                priceInput.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                priceInput.parentElement.classList.remove('invalid');
            }

            // Validate Demo URL format if entered
            if (demoUrl) {
                const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-._~:\/?#\[\]@!$&'()*+,;=]*)?$/i;
                if (!urlPattern.test(demoUrl)) {
                    document.getElementById('upload-url-error').style.display = 'block';
                    demoUrlInput.parentElement.parentElement.classList.add('invalid');
                    isValid = false;
                } else {
                    document.getElementById('upload-url-error').style.display = 'none';
                    demoUrlInput.parentElement.parentElement.classList.remove('invalid');
                }
            } else {
                document.getElementById('upload-url-error').style.display = 'none';
                demoUrlInput.parentElement.parentElement.classList.remove('invalid');
            }

            if (!isValid) {
                showToast('Please fix all validation errors before publishing.', 'error');
                return;
            }

            // Build new Project
            const userObj = getUser();
            const project = {
                id: `proj_${Date.now()}`,
                title,
                category,
                description,
                price: price,
                tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
                demoUrl,
                thumbnail: selectedThumbId,
                seller: userObj.username,
                createdAt: new Date().toISOString()
            };

            const projects = getProjects();
            projects.unshift(project);
            saveProjects(projects);

            showToast('Project published to Marketplace successfully!', 'success');
            clearUploadForm();
            updateStatsAndSummary();

            // Switch to Published tab
            const publishedTabBtn = document.querySelector('.profile-tab-btn[data-tab="published"]');
            if (publishedTabBtn) {
                publishedTabBtn.click();
            }
        });
    }
}

function clearUploadForm() {
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-category').value = '';
    document.getElementById('upload-description').value = '';
    document.getElementById('upload-price').value = '';
    document.getElementById('upload-tags').value = '';
    document.getElementById('upload-demo-url').value = '';

    selectedThumbId = null;
    const thumbPreview = document.getElementById('thumb-preview-img');
    const placeholder = document.querySelector('.drop-zone-placeholder');
    if (thumbPreview) {
        thumbPreview.src = '';
        thumbPreview.style.display = 'none';
    }
    if (placeholder) {
        placeholder.style.display = 'block';
    }

    document.querySelectorAll('#tab-upload .form-group').forEach(group => {
        group.classList.remove('invalid');
        const err = group.querySelector('.error-msg');
        if (err) err.style.display = 'none';
    });
}

// --- PROJECT DETAIL DRAWER ---
let currentDetailProjectId = null;

function setupDetailDrawerHandlers() {
    const closeBtn = document.getElementById('btn-close-detail-drawer');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectDetailDrawer);
    }

    const deleteBtn = document.getElementById('btn-delete-project');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (!currentDetailProjectId) return;
            if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                let projects = getProjects();
                projects = projects.filter(p => p.id !== currentDetailProjectId);
                saveProjects(projects);

                closeProjectDetailDrawer();
                renderPublishedTab();
                updateStatsAndSummary();
                showToast('Project deleted successfully.', 'success');
            }
        });
    }

    const viewMarketplaceBtn = document.getElementById('btn-view-marketplace');
    if (viewMarketplaceBtn) {
        viewMarketplaceBtn.addEventListener('click', () => {
            window.location.href = 'marketplace.html';
        });
    }
}

function openProjectDetailDrawer(id) {
    const project = getProjects().find(p => p.id === id);
    if (!project) return;

    currentDetailProjectId = id;

    document.getElementById('drawer-project-title').textContent = project.title;
    document.getElementById('drawer-project-img').src = project.thumbnail || 'assets/project1.webp';
    document.getElementById('drawer-project-category').textContent = project.category || 'Dashboard';
    document.getElementById('drawer-project-price').textContent = `₹${(project.price || 0).toFixed(2)}`;
    document.getElementById('drawer-project-desc').textContent = project.description || 'No description provided.';

    const demoLink = document.getElementById('drawer-project-demo-link');
    if (demoLink) {
        if (project.demoUrl) {
            demoLink.href = project.demoUrl;
            demoLink.style.display = 'inline-flex';
        } else {
            demoLink.style.display = 'none';
        }
    }

    // Toggle Drawer and backdrop
    const drawer = document.getElementById('project-detail-drawer');
    let backdrop = document.getElementById('drawer-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'drawer-backdrop';
        backdrop.className = 'drawer-backdrop';
        document.body.appendChild(backdrop);
    }

    drawer.classList.add('show');
    backdrop.classList.add('show');

    backdrop.onclick = closeProjectDetailDrawer;

    if (window.lucide) window.lucide.createIcons();
}

function closeProjectDetailDrawer() {
    const drawer = document.getElementById('project-detail-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    currentDetailProjectId = null;
}

// --- PROFILE EDIT MODAL ---
function setupEditProfileModal() {
    const editBtn = document.getElementById('prof-edit-bio-btn');
    const saveBtn = document.getElementById('prof-save-bio-btn');
    const modal = document.getElementById('profileEditModal');
    const closeBtn = document.getElementById('btn-close-profile-modal');
    const cancelBtn = document.getElementById('btn-cancel-profile');

    const nameInput = document.getElementById('prof-name-input');
    const usernameInput = document.getElementById('prof-username-input');
    const bioInput = document.getElementById('prof-bio-input');
    const skillsInput = document.getElementById('prof-skills-input');
    const availabilitySelect = document.getElementById('prof-availability-select');

    const uploadZone = document.getElementById('prof-upload-zone');
    const fileInput = document.getElementById('prof-avatar-file-input');
    const filenameSpan = document.getElementById('prof-upload-filename');

    let tempAvatarBase64 = null;

    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            const user = getUser();
            if (nameInput) nameInput.value = user.name || '';
            if (usernameInput) usernameInput.value = user.username || '';
            if (bioInput) bioInput.value = user.bio || '';
            if (skillsInput) skillsInput.value = (user.skills || []).join(', ');
            if (availabilitySelect) availabilitySelect.value = user.availability || 'Available for Work';
            if (filenameSpan) filenameSpan.textContent = '';
            tempAvatarBase64 = null;
            modal.classList.add('show');
        });

        const closeModal = () => {
            modal.classList.remove('show');
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', () => fileInput.click());

            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = 'var(--text-primary)';
                uploadZone.style.background = 'rgba(128, 128, 128, 0.08)';
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.style.borderColor = 'var(--border-color)';
                uploadZone.style.background = 'rgba(128, 128, 128, 0.02)';
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = 'var(--border-color)';
                uploadZone.style.background = 'rgba(128, 128, 128, 0.02)';

                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleAvatarFile(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleAvatarFile(e.target.files[0]);
                }
            });
        }

        function handleAvatarFile(file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }

            if (filenameSpan) {
                filenameSpan.textContent = `Selected: ${file.name}`;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                tempAvatarBase64 = e.target.result;
                showToast('Profile photo prepared!', 'success');
            };
            reader.readAsDataURL(file);
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const user = getUser();
                const newName = nameInput ? nameInput.value.trim() : '';
                const newUsername = usernameInput ? usernameInput.value.trim() : '';
                const newBio = bioInput ? bioInput.value.trim() : '';
                const newSkills = skillsInput ? skillsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
                const newAvailability = availabilitySelect ? availabilitySelect.value : 'Available for Work';

                if (!newName) {
                    showToast('Full name is required.', 'error');
                    return;
                }
                if (!newUsername) {
                    showToast('Username is required.', 'error');
                    return;
                }

                user.name = newName;
                user.username = newUsername;
                user.bio = newBio;
                user.skills = newSkills;
                user.availability = newAvailability;

                if (tempAvatarBase64) {
                    user.avatar = storeImage(tempAvatarBase64);
                }

                saveUser(user);

                // Sync view elements immediately
                const inlineName = document.getElementById('prof-name-inline');
                if (inlineName) inlineName.textContent = newName;
                updateDisplayNameUI(newName);

                const handleEl = document.getElementById('prof-handle');
                if (handleEl) handleEl.textContent = '@' + newUsername;

                const bioText = document.getElementById('prof-bio-text');
                if (bioText) {
                    bioText.textContent = newBio || 'Enter a short professional biography here.';
                }

                const skillsContainer = document.getElementById('prof-skills-container');
                if (skillsContainer) {
                    skillsContainer.innerHTML = newSkills.map(s => `<span class="skill-badge">${s}</span>`).join('');
                }

                const marqueeEl = document.getElementById('prof-marquee-content');
                if (marqueeEl) {
                    if (newSkills.length > 0) {
                        const marqueeList = [...newSkills, ...newSkills, ...newSkills, ...newSkills];
                        marqueeEl.innerHTML = marqueeList.map(s => `<span class="skills-marquee-item">${s}</span>`).join('');
                    } else {
                        marqueeEl.innerHTML = '';
                    }
                }

                updateAvatarUI(user);
                updateAvailabilityUI(user);
                updateStatsAndSummary();

                // Re-render tabs list if seller changed
                renderPublishedTab();

                closeModal();
                showToast('Profile updated successfully!', 'success');
            });
        }
    }
}

// --- LIGHTWEIGHT INLINE TOAST SYSTEM ---
export function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}