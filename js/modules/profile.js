/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - PROFILE PAGE INTERACTIONS
   Manages follow triggers, cover adjustments, bio revisions, and filterings.
   ==========================================================================
*/

import { getCurrentUser, updateCurrentUser, getProjects, addNotification, logActivity } from './db.js';
import { showToast } from '../core/global.js';
import { openGlobalPreviewDrawer } from './portfolio.js';
import { createActivityHeatmap } from '../heatmap.js';

export function initProfilePage() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Wire visual profile headers
    document.getElementById('prof-avatar').src = user.avatar;
    document.getElementById('prof-banner').src = user.banner;
    document.getElementById('prof-name').textContent = user.name;
    document.getElementById('prof-handle').textContent = '@' + user.username;
    
    // Stats count
    document.getElementById('prof-followers-count').textContent = user.followers;
    document.getElementById('prof-following-count').textContent = user.following;
    document.getElementById('prof-likes-count').textContent = user.stats.likes;
    
    // Render creator dashboard stats
    const statsContainer = document.getElementById('profile-dashboard-grid');
    if (statsContainer) {
        const savedPortfolio = localStorage.getItem('apex-portfolio');
        let portfolioData = { projects: [], skills: [], experience: [] };
        if (savedPortfolio) {
            try {
                portfolioData = JSON.parse(savedPortfolio);
            } catch (e) {
                console.error(e);
            }
        }
        const stats = {
            'Views': Math.floor(Math.random() * 500) + 120,
            'Projects': portfolioData.projects ? portfolioData.projects.length : 0,
            'Skills Listed': portfolioData.skills ? portfolioData.skills.length : 0,
            'Experience': portfolioData.experience ? portfolioData.experience.length : 0
        };
        statsContainer.innerHTML = Object.entries(stats).map(([label, value]) => `
            <div class="dashboard-widget" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; text-align:center; backdrop-filter:blur(10px);">
                <div class="widget-value" style="font-size:20px; font-weight:700; color:#00ffaa; margin-bottom:4px;">${value}</div>
                <div class="widget-label" style="font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.5px;">${label}</div>
            </div>
        `).join('');
    }

    // Initialize activity heatmap
    createActivityHeatmap('heatmap-widget');

    // Make sure Lucide icons are updated
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Bio
    const bioText = document.getElementById('prof-bio-text');
    bioText.textContent = user.bio || 'Enter a short professional biography.';
    
    // Skills matrix
    const skillsMatrix = document.getElementById('prof-skills-container');
    skillsMatrix.innerHTML = user.skills.map(s => `<span class="badge badge-outline">${s}</span>`).join('');
    
    // Render uploaded projects
    renderCreatorOwnedProjects(user.username);
    
    // Wire edit button actions
    const editBtn = document.getElementById('prof-edit-bio-btn');
    const saveBtn = document.getElementById('prof-save-bio-btn');
    const bioBox = document.getElementById('prof-bio-editor-box');
    const bioInput = document.getElementById('prof-bio-input');
    
    if (editBtn && saveBtn && bioBox && bioInput) {
        editBtn.addEventListener('click', () => {
            bioInput.value = user.bio || '';
            bioBox.classList.add('active');
            bioText.style.display = 'none';
            editBtn.style.display = 'none';
        });
        
        saveBtn.addEventListener('click', () => {
            const newVal = bioInput.value.trim();
            if (newVal) {
                user.bio = newVal;
                
                // If progress was lower, increase profile completion metric
                if (user.profileProgress < 100) {
                    user.profileProgress = Math.min(100, user.profileProgress + 15);
                }
                
                updateCurrentUser(user);
                
                bioText.textContent = newVal;
                bioBox.classList.remove('active');
                bioText.style.display = 'block';
                editBtn.style.display = 'inline-flex';
                
                addNotification('You updated your public biography details.');
                logActivity(2); // Bio update logs activity
                showToast('Biography updated successfully!', 'success');
            }
        });
    }
    
    // Wire Follow Simulation
    const followBtn = document.getElementById('prof-follow-btn');
    if (followBtn) {
        let isFollowing = false;
        followBtn.addEventListener('click', () => {
            isFollowing = !isFollowing;
            const countNode = document.getElementById('prof-followers-count');
            
            if (isFollowing) {
                user.followers += 1;
                countNode.textContent = user.followers;
                followBtn.textContent = 'Following ✓';
                followBtn.style.background = 'rgba(0, 230, 118, 0.15)';
                followBtn.style.color = 'var(--success)';
                followBtn.style.borderColor = 'var(--success)';
                showToast(`You started following @${user.username}!`, 'success');
            } else {
                user.followers = Math.max(0, user.followers - 1);
                countNode.textContent = user.followers;
                followBtn.textContent = 'Follow Creator';
                followBtn.style.background = '';
                followBtn.style.color = '';
                followBtn.style.borderColor = '';
                showToast(`You unfollowed @${user.username}.`, 'info');
            }
            updateCurrentUser(user);
        });
    }
}

// Render only projects authored by this user session
function renderCreatorOwnedProjects(username) {
    const grid = document.getElementById('prof-uploaded-projects-grid');
    if (!grid) return;
    
    const projects = getProjects();
    const owned = projects.filter(p => p.seller === username || p.seller === 'apex_user');
    
    if (owned.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:48px 0;border:1px dashed var(--border-color);border-radius:12px;">
                <p style="color:var(--text-muted);">You have not published any projects yet.</p>
                <a href="portfolio.html" class="btn btn-secondary clickable" style="margin-top:16px;font-size:0.8rem;padding:8px 16px;">Open Portfolio Builder</a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = owned.map(p => `
        <div class="glass-card spotlight-card owned-product-card" data-id="${p.id}" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;">
            <div>
                <img src="${p.image}" alt="${p.title}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:12px;">
                <h3 style="font-size:0.95rem;margin-bottom:4px;max-height:2.6em;overflow:hidden;">${p.title}</h3>
                <span style="font-weight:bold;color:var(--primary);font-size:0.85rem;float:right;">$${p.price.toFixed(2)}</span>
                <span class="badge badge-outline" style="font-size:0.6rem;">${p.status}</span>
            </div>
            
            <button class="btn btn-secondary clickable owned-preview-trigger" style="width:100%;padding:8px;font-size:0.75rem;margin-top:16px;">View Listing Details</button>
        </div>
    `).join('');
    
    // Bind click trigger
    grid.querySelectorAll('.owned-preview-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.owned-product-card');
            const id = card.dataset.id;
            openGlobalPreviewDrawer(id);
        });
    });
}
