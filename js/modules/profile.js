/*
   ==========================================================================
   FUTURISTIC PORTFOLIO - PROFILE PAGE LOGIC (Heatmap Removed)
   ==========================================================================
*/

import { getCurrentUser, updateCurrentUser, getProjects, addNotification, logActivity } from './db.js';
import { showToast } from '../core/global.js';
import { openGlobalPreviewDrawer } from './portfolio.js';

export function initProfilePage() {
    const user = getCurrentUser();
    if (!user) return;

    // Initialize Lucide Icons for UI elements
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Wire visual profile elements to user data
    const avatarEl = document.getElementById('prof-avatar');
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;

    // Update inline names to match the modern greeting layout
    document.getElementById('prof-name-inline').textContent = user.name;
    document.getElementById('prof-handle').textContent = '@' + user.username;

    // Stats count
    document.getElementById('prof-followers-count').textContent = user.followers || 0;
    document.getElementById('prof-following-count').textContent = user.following || 0;
    document.getElementById('prof-likes-count').textContent = user.stats ? user.stats.likes : 0;

    // Bio
    const bioText = document.getElementById('prof-bio-text');
    bioText.textContent = user.bio || 'Enter a short professional biography to display here.';

    // Skills matrix formatting (Pill shaped)
    const skillsMatrix = document.getElementById('prof-skills-container');
    if (skillsMatrix && user.skills) {
        skillsMatrix.innerHTML = user.skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
    }

    // Render uploaded projects
    renderCreatorOwnedProjects(user.username);

    // Wire edit button actions (Biography, Name, and Profile Photo via Modal)
    const editBtn = document.getElementById('prof-edit-bio-btn');
    const saveBtn = document.getElementById('prof-save-bio-btn');
    const modal = document.getElementById('profileEditModal');
    const closeBtn = document.getElementById('btn-close-profile-modal');
    const cancelBtn = document.getElementById('btn-cancel-profile');
    
    const bioInput = document.getElementById('prof-bio-input');
    const nameInput = document.getElementById('prof-name-input');
    const uploadZone = document.getElementById('prof-upload-zone');
    const fileInput = document.getElementById('prof-avatar-file-input');
    const filenameSpan = document.getElementById('prof-upload-filename');
    
    let tempAvatarBase64 = null;

    if (editBtn && modal) {
        // Open modal
        editBtn.addEventListener('click', () => {
            if (nameInput) nameInput.value = user.name || '';
            if (bioInput) bioInput.value = user.bio || '';
            if (filenameSpan) filenameSpan.textContent = '';
            tempAvatarBase64 = null;
            modal.classList.add('show');
        });

        // Close modal helper
        const closeModal = () => {
            modal.classList.remove('show');
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        // Upload zone file triggers
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
                showToast('Image uploaded successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }

        // Save action
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newVal = bioInput ? bioInput.value.trim() : '';
                const newName = nameInput ? nameInput.value.trim() : '';

                if (!newName) {
                    showToast('Name cannot be empty', 'error');
                    return;
                }

                // Update User state
                user.name = newName;
                user.bio = newVal || 'Enter a short professional biography to display here.';

                if (tempAvatarBase64) {
                    user.avatar = tempAvatarBase64;
                    if (avatarEl) avatarEl.src = tempAvatarBase64;
                }

                if (user.profileProgress < 100) {
                    user.profileProgress = Math.min(100, user.profileProgress + 15);
                }

                // Update Database
                updateCurrentUser(user);

                // Sync view
                document.getElementById('prof-name-inline').textContent = newName;
                bioText.textContent = user.bio;

                closeModal();

                addNotification('You updated your public profile details.');
                logActivity(2);
                showToast('Profile updated successfully!', 'success');
            });
        }
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
                followBtn.classList.remove('solid');
                followBtn.classList.add('outline');
                showToast(`You started following @${user.username}!`, 'success');
            } else {
                user.followers = Math.max(0, user.followers - 1);
                countNode.textContent = user.followers;
                followBtn.textContent = 'Follow Creator';
                followBtn.classList.remove('outline');
                followBtn.classList.add('solid');
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
            <div style="grid-column:1/-1;text-align:center;padding:48px 0;border:1px dashed var(--border-color);border-radius:24px;">
                <p style="color:var(--text-secondary); margin-bottom: 16px;">You have not published any projects yet.</p>
                <a href="portfolio.html" class="pill-btn outline clickable">Open Portfolio Builder</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = owned.map(p => `
        <div class="project-card clickable" data-id="${p.id}">
            <img src="${p.image}" alt="${p.title}" class="project-img">
            <div class="project-info">
                <h3 class="project-title">${p.title}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">${p.status}</span>
                    <span style="font-weight:600;">$${p.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Bind click trigger for preview drawer
    grid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openGlobalPreviewDrawer(id);
        });
    });
}

// Auto-initialize if running directly
document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});