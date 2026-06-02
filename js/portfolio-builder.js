/*
   APEX SKILLSPACE - PORTFOLIO BUILDER
   Core portfolio builder logic and state management
*/

import { initParticles } from './particles.js';
import { createActivityHeatmap } from './heatmap.js';
import { loadTemplates, applyTemplate, getAllTemplates } from './templates.js';

// Portfolio Data Structure
const portfolioState = {
    name: 'Your Name',
    role: 'Your Professional Role',
    about: 'Tell your professional story...',
    photo: null,
    skills: [],
    experience: [],
    projects: [],
    socialLinks: {},
    selectedTemplate: 'minimal',
    theme: 'dark'
};

// Initialize the Portfolio Builder
export async function initPortfolioBuilder() {
    console.log('Initializing Portfolio Builder...');
    
    // Load portfolio data from localStorage
    loadPortfolioData();
    
    // Initialize particles
    initParticles();
    
    // Load templates
    await loadTemplates();
    
    // Setup event listeners
    setupEditorListeners();
    setupTemplateGallery();
    
    // Initial preview render
    updatePreview();
    
    console.log('Portfolio Builder Ready');
}

// Load data from localStorage
function loadPortfolioData() {
    const saved = localStorage.getItem('apex-portfolio');
    if (saved) {
        Object.assign(portfolioState, JSON.parse(saved));
    }
    
    // Populate form fields with saved data
    populateEditorForm();
}

// Save data to localStorage
function savePortfolioData() {
    localStorage.setItem('apex-portfolio', JSON.stringify(portfolioState));
}

// Populate editor form with current data
function populateEditorForm() {
    const fullName = document.getElementById('fullName');
    const role = document.getElementById('role');
    const about = document.getElementById('about');
    
    if (fullName) fullName.value = portfolioState.name;
    if (role) role.value = portfolioState.role;
    if (about) about.value = portfolioState.about;
    
    // Render skills
    renderSkills();
    
    // Render experience
    renderExperience();
}

// Setup editor event listeners
function setupEditorListeners() {
    // Name, Role, About
    const fullName = document.getElementById('fullName');
    const role = document.getElementById('role');
    const about = document.getElementById('about');
    
    if (fullName) {
        fullName.addEventListener('input', (e) => {
            portfolioState.name = e.target.value;
            savePortfolioData();
            updatePreview();
        });
    }
    
    if (role) {
        role.addEventListener('input', (e) => {
            portfolioState.role = e.target.value;
            savePortfolioData();
            updatePreview();
        });
    }
    
    if (about) {
        about.addEventListener('input', (e) => {
            portfolioState.about = e.target.value;
            savePortfolioData();
            updatePreview();
        });
    }
    
    // Photo upload
    const photoInput = document.getElementById('profilePhotoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    
    if (photoUploadArea) {
        photoUploadArea.addEventListener('click', () => {
            photoInput?.click();
        });
        
        photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadArea.style.borderColor = 'rgba(0, 255, 170, 0.8)';
        });
        
        photoUploadArea.addEventListener('dragleave', () => {
            photoUploadArea.style.borderColor = 'rgba(0, 255, 170, 0.3)';
        });
        
        photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handlePhotoUpload(file);
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handlePhotoUpload(file);
        });
    }
    
    // Skill input
    const addSkillBtn = document.getElementById('addSkillBtn');
    const skillInput = document.getElementById('skillInput');
    
    if (addSkillBtn && skillInput) {
        addSkillBtn.addEventListener('click', () => {
            const skill = skillInput.value.trim();
            if (skill && !portfolioState.skills.includes(skill)) {
                portfolioState.skills.push(skill);
                skillInput.value = '';
                savePortfolioData();
                renderSkills();
                updatePreview();
            }
        });
        
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addSkillBtn.click();
            }
        });
    }
    
    // Experience
    const addExpBtn = document.getElementById('addExpBtn');
    if (addExpBtn) {
        addExpBtn.addEventListener('click', openExperienceModal);
    }
}

// Handle photo upload
function handlePhotoUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        portfolioState.photo = e.target.result;
        savePortfolioData();
        
        // Update preview
        const photoArea = document.getElementById('photoUploadArea');
        if (photoArea) {
            photoArea.innerHTML = `<img src="${e.target.result}" class="photo-upload-preview">`;
            photoArea.classList.add('has-image');
        }
        
        updatePreview();
    };
    reader.readAsDataURL(file);
}

// Render skills list
function renderSkills() {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return;
    
    skillsList.innerHTML = portfolioState.skills.map(skill => `
        <div class="skill-badge">
            ${skill}
            <span class="skill-badge-remove" onclick="window.portfolioBuilder.removeSkill('${skill}')">×</span>
        </div>
    `).join('');
}

// Remove skill
export function removeSkill(skill) {
    const index = portfolioState.skills.indexOf(skill);
    if (index > -1) {
        portfolioState.skills.splice(index, 1);
        savePortfolioData();
        renderSkills();
        updatePreview();
    }
}

// Render experience
function renderExperience() {
    const expList = document.getElementById('experienceList');
    if (!expList) return;
    
    expList.innerHTML = portfolioState.experience.map((exp, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${exp.title}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${exp.company}</div>
                </div>
                <button onclick="window.portfolioBuilder.removeExperience(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">×</button>
            </div>
        </div>
    `).join('');
}

// Remove experience
export function removeExperience(idx) {
    portfolioState.experience.splice(idx, 1);
    savePortfolioData();
    renderExperience();
    updatePreview();
}

// Open experience modal
function openExperienceModal() {
    const title = prompt('Job Title:');
    if (!title) return;
    
    const company = prompt('Company Name:');
    if (!company) return;
    
    const startDate = prompt('Start Date (YYYY-MM):');
    const endDate = prompt('End Date (YYYY-MM) or "Present":');
    
    portfolioState.experience.push({
        title,
        company,
        startDate,
        endDate
    });
    
    savePortfolioData();
    renderExperience();
    updatePreview();
}

// Update live preview
function updatePreview() {
    const preview = document.querySelector('.portfolio-preview');
    if (!preview) return;
    
    // Update hero section
    const previewName = preview.querySelector('.preview-name');
    const previewRole = preview.querySelector('.preview-role');
    const previewAbout = preview.querySelector('.preview-about');
    const previewPhoto = preview.querySelector('.preview-photo');
    
    if (previewName) previewName.textContent = portfolioState.name;
    if (previewRole) previewRole.textContent = portfolioState.role;
    if (previewAbout) previewAbout.textContent = portfolioState.about;
    
    if (previewPhoto && portfolioState.photo) {
        previewPhoto.src = portfolioState.photo;
    }
    
    // Update skills
    updatePreviewSkills();
    
    // Update experience
    updatePreviewExperience();
}

// Update preview skills
function updatePreviewSkills() {
    const skillsContainer = document.querySelector('[data-section="skills"] .preview-skills');
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = portfolioState.skills.map(skill => `
        <div class="preview-skill">${skill}</div>
    `).join('');
}

// Update preview experience
function updatePreviewExperience() {
    const expContainer = document.querySelector('[data-section="experience"]');
    if (!expContainer) return;
    
    const itemsHtml = portfolioState.experience.map(exp => `
        <div class="preview-experience-item">
            <div class="preview-exp-title">${exp.title}</div>
            <div class="preview-exp-company">${exp.company}</div>
            <div class="preview-exp-period">${exp.startDate} – ${exp.endDate}</div>
        </div>
    `).join('');
    
    expContainer.innerHTML = `
        <h2 class="preview-section-title">Experience</h2>
        ${itemsHtml}
    `;
}

// Setup template gallery
async function setupTemplateGallery() {
    const templatesContainer = document.getElementById('templatesGallery');
    if (!templatesContainer) return;
    
    const allTemplates = getAllTemplates();
    
    templatesContainer.innerHTML = allTemplates.map(template => `
        <div class="template-card ${template.id === portfolioState.selectedTemplate ? 'selected' : ''}">
            <div class="template-thumbnail">${template.name}</div>
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <button class="template-btn ${template.id === portfolioState.selectedTemplate ? 'active' : ''}" onclick="window.portfolioBuilder.selectTemplate('${template.id}')">
                    ${template.id === portfolioState.selectedTemplate ? 'Active' : 'Switch'}
                </button>
            </div>
        </div>
    `).join('');
}

// Select template
export function selectTemplate(templateId) {
    portfolioState.selectedTemplate = templateId;
    savePortfolioData();
    applyTemplate(templateId, portfolioState);
    setupTemplateGallery();
    updatePreview();
}

// Dashboard stats
export function updateDashboard() {
    const statsContainer = document.querySelector('.dashboard-grid');
    if (!statsContainer) return;
    
    const stats = {
        'Portfolio Views': Math.floor(Math.random() * 5000),
        'Total Projects': portfolioState.projects.length,
        'Skills': portfolioState.skills.length,
        'Experience': portfolioState.experience.length
    };
    
    statsContainer.innerHTML = Object.entries(stats).map(([label, value]) => `
        <div class="dashboard-widget">
            <div class="widget-value">${value}</div>
            <div class="widget-label">${label}</div>
        </div>
    `).join('');
}

// Export portfolio builder API
export const portfolioBuilder = {
    removeSkill,
    removeExperience,
    selectTemplate,
    updateDashboard,
    getState: () => portfolioState,
    saveData: savePortfolioData,
    loadData: loadPortfolioData
};

// Make available globally
window.portfolioBuilder = portfolioBuilder;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioBuilder);
} else {
    initPortfolioBuilder();
}
