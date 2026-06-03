/*
   APEX SKILLSPACE - PORTFOLIO BUILDER
   Core portfolio builder logic and state management
*/

import { initParticles } from './particles.js';
import { createActivityHeatmap } from './heatmap.js';
import { loadTemplates, applyTemplate, getAllTemplates, getTemplate } from './templates.js';
import { initDB, getCreators } from './modules/db.js';

// Portfolio Data Structure
const portfolioState = {
    name: 'Your Name',
    role: 'Your Professional Role',
    tagline: 'Crafting beautiful and functional digital experiences.',
    location: 'San Francisco, CA',
    email: 'hello@yourdomain.com',
    phone: '+1 (555) 000-0000',
    websiteUrl: 'https://yourwebsite.com',
    about: 'Tell your professional story...',
    photo: null,
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    testimonials: [],
    socialLinks: {},
    selectedTemplate: 'minimal',
    theme: 'dark',
    customTheme: {
        backgroundType: 'solid', // 'solid' or 'gradient'
        backgroundSolid: '#ffffff',
        backgroundGradientStart: '#0f1220',
        backgroundGradientEnd: '#060814',
        text: '#111111',
        accent: '#000000',
        font: 'Inter',
        cardStyle: 'flat', // 'flat', 'glassmorphism', 'shadow', 'glow'
        blurIntensity: '15px',
        borderOpacity: '0.08'
    },
    sectionVisibility: {
        photo: true,
        about: true,
        skills: true,
        experience: true,
        education: true,
        projects: true,
        certifications: true,
        testimonials: true,
        contact: true
    }
};

// Initialize the Portfolio Builder
export async function initPortfolioBuilder() {
    console.log('Initializing Portfolio Builder...');
    
    // Initialize Database
    initDB();
    
    // Load portfolio data from localStorage
    loadPortfolioData();
    
    // Initialize particles
    initParticles();
    
    // Load templates
    await loadTemplates();
    
    // Setup tabs
    setupEditorTabs();
    
    // Setup event listeners
    setupEditorListeners();
    setupTemplateGallery();
    
    // Initial preview render
    updatePreview();
    
    // Update stats dashboard
    updateDashboard();
    
    console.log('Portfolio Builder Ready');
}

// Setup horizontal editor tab switching
function setupEditorTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const activePane = document.getElementById(tabId);
            if (activePane) {
                activePane.classList.add('active');
            }
        });
    });
}

// Load data from localStorage
function loadPortfolioData() {
    const saved = localStorage.getItem('apex-portfolio');
    if (saved) {
        const parsed = JSON.parse(saved);
        
        // Handle migration fields gracefully
        if (!parsed.customTheme) {
            parsed.customTheme = { ...portfolioState.customTheme };
        }
        if (!parsed.sectionVisibility) {
            parsed.sectionVisibility = { ...portfolioState.sectionVisibility };
        }
        if (!parsed.education) parsed.education = [];
        if (!parsed.certifications) parsed.certifications = [];
        if (!parsed.testimonials) parsed.testimonials = [];
        if (!parsed.tagline) parsed.tagline = portfolioState.tagline;
        if (!parsed.location) parsed.location = portfolioState.location;
        if (!parsed.email) parsed.email = '';
        if (!parsed.phone) parsed.phone = '';
        if (!parsed.websiteUrl) parsed.websiteUrl = '';
        
        Object.assign(portfolioState, parsed);
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
    const tagline = document.getElementById('tagline');
    const location = document.getElementById('location');
    const about = document.getElementById('about');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const websiteUrl = document.getElementById('websiteUrl');
    
    const github = document.getElementById('githubLink');
    const linkedin = document.getElementById('linkedinLink');
    const twitter = document.getElementById('twitterLink');
    
    if (fullName) fullName.value = portfolioState.name || '';
    if (role) role.value = portfolioState.role || '';
    if (tagline) tagline.value = portfolioState.tagline || '';
    if (location) location.value = portfolioState.location || '';
    if (about) about.value = portfolioState.about || '';
    if (email) email.value = portfolioState.email || '';
    if (phone) phone.value = portfolioState.phone || '';
    if (websiteUrl) websiteUrl.value = portfolioState.websiteUrl || '';
    
    if (github) github.value = portfolioState.socialLinks.github || '';
    if (linkedin) linkedin.value = portfolioState.socialLinks.linkedin || '';
    if (twitter) twitter.value = portfolioState.socialLinks.twitter || '';
    
    // Theme inputs populate
    const themeBgType = document.getElementById('themeBgType');
    const themeBgSolid = document.getElementById('themeBgSolid');
    const themeBgSolidHex = document.getElementById('themeBgSolidHex');
    const themeBgGradStart = document.getElementById('themeBgGradStart');
    const themeBgGradStartHex = document.getElementById('themeBgGradStartHex');
    const themeBgGradEnd = document.getElementById('themeBgGradEnd');
    const themeBgGradEndHex = document.getElementById('themeBgGradEndHex');
    const themeAccent = document.getElementById('themeAccent');
    const themeAccentHex = document.getElementById('themeAccentHex');
    const themeText = document.getElementById('themeText');
    const themeTextHex = document.getElementById('themeTextHex');
    const themeFont = document.getElementById('themeFont');
    const themeCardStyle = document.getElementById('themeCardStyle');
    const themeBlur = document.getElementById('themeBlur');
    const themeBorderOpacity = document.getElementById('themeBorderOpacity');
    
    const ct = portfolioState.customTheme;
    if (themeBgType) {
        themeBgType.value = ct.backgroundType;
        toggleBgInputs(ct.backgroundType);
    }
    if (themeBgSolid) themeBgSolid.value = ct.backgroundSolid;
    if (themeBgSolidHex) themeBgSolidHex.value = ct.backgroundSolid;
    if (themeBgGradStart) themeBgGradStart.value = ct.backgroundGradientStart;
    if (themeBgGradStartHex) themeBgGradStartHex.value = ct.backgroundGradientStart;
    if (themeBgGradEnd) themeBgGradEnd.value = ct.backgroundGradientEnd;
    if (themeBgGradEndHex) themeBgGradEndHex.value = ct.backgroundGradientEnd;
    if (themeAccent) themeAccent.value = ct.accent;
    if (themeAccentHex) themeAccentHex.value = ct.accent;
    if (themeText) themeText.value = ct.text;
    if (themeTextHex) themeTextHex.value = ct.text;
    if (themeFont) themeFont.value = ct.font;
    if (themeCardStyle) {
        themeCardStyle.value = ct.cardStyle;
        toggleCardInputs(ct.cardStyle);
    }
    if (themeBlur) {
        themeBlur.value = parseInt(ct.blurIntensity) || 15;
        const lbl = document.getElementById('blurVal');
        if (lbl) lbl.textContent = ct.blurIntensity;
    }
    if (themeBorderOpacity) {
        themeBorderOpacity.value = Math.round(parseFloat(ct.borderOpacity) * 100) || 8;
        const lbl = document.getElementById('borderVal');
        if (lbl) lbl.textContent = ct.borderOpacity;
    }

    // Set visibility checkboxes
    const vis = portfolioState.sectionVisibility;
    Object.keys(vis).forEach(key => {
        const cb = document.getElementById('visible-' + key);
        if (cb) cb.checked = vis[key];
    });

    // Sync avatar upload view
    const photoArea = document.getElementById('photoUploadArea');
    if (photoArea) {
        if (portfolioState.photo) {
            photoArea.innerHTML = `<img src="${portfolioState.photo}" class="photo-upload-preview">`;
            photoArea.classList.add('has-image');
        } else {
            photoArea.innerHTML = `<div class="photo-upload-placeholder"><i data-lucide="camera" style="width: 24px; height: 24px; color: rgba(0, 255, 170, 0.7); margin-bottom: 8px;"></i><div>Click or drag avatar</div></div>`;
            photoArea.classList.remove('has-image');
        }
    }
    
    // Render lists
    renderSkills();
    renderExperience();
    renderEducation();
    renderProjects();
    renderCertifications();
    renderTestimonials();
}

function toggleBgInputs(type) {
    const solidGroup = document.getElementById('solidBgGroup');
    const gradGroup = document.getElementById('gradientBgGroup');
    if (type === 'gradient') {
        if (solidGroup) solidGroup.style.display = 'none';
        if (gradGroup) gradGroup.style.display = 'block';
    } else {
        if (solidGroup) solidGroup.style.display = 'block';
        if (gradGroup) gradGroup.style.display = 'none';
    }
}

function toggleCardInputs(style) {
    const controls = document.getElementById('glassmorphismControls');
    if (controls) {
        controls.style.display = style === 'glassmorphism' ? 'block' : 'none';
    }
}

// Bind color pickers inputs
function bindColorSync(pickerId, textId, stateKey) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    
    if (picker && text) {
        picker.addEventListener('input', (e) => {
            const val = e.target.value;
            text.value = val;
            portfolioState.customTheme[stateKey] = val;
            savePortfolioData();
            updatePreview();
        });
        text.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                picker.value = val;
                portfolioState.customTheme[stateKey] = val;
                savePortfolioData();
                updatePreview();
            }
        });
    }
}

// Setup editor event listeners
function setupEditorListeners() {
    // Publish & View Live Button
    const btnPublish = document.getElementById('btnPublishPortfolio');
    if (btnPublish) {
        btnPublish.addEventListener('click', () => {
            savePortfolioData();
            window.location.href = 'view-portfolio.html?user=current';
        });
    }

    // Name, Role, Tagline, Location, About, Email, Phone, Website
    const bindInputToState = (id, stateKey) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                portfolioState[stateKey] = e.target.value;
                savePortfolioData();
                updatePreview();
            });
        }
    };
    
    bindInputToState('fullName', 'name');
    bindInputToState('role', 'role');
    bindInputToState('tagline', 'tagline');
    bindInputToState('location', 'location');
    bindInputToState('about', 'about');
    bindInputToState('email', 'email');
    bindInputToState('phone', 'phone');
    bindInputToState('websiteUrl', 'websiteUrl');

    // Social links
    bindSocialInput('githubLink', 'github');
    bindSocialInput('linkedinLink', 'linkedin');
    bindSocialInput('twitterLink', 'twitter');
    
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
            photoUploadArea.style.borderColor = 'rgba(0, 255, 170, 0.25)';
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
                updateDashboard();
            }
        });
        
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addSkillBtn.click();
            }
        });
    }
    
    // Experience triggers
    const addExpBtn = document.getElementById('addExpBtn');
    if (addExpBtn) addExpBtn.addEventListener('click', openExperienceModal);
    
    const btnSaveExp = document.getElementById('btnSaveExperience');
    if (btnSaveExp) btnSaveExp.addEventListener('click', saveExperience);

    // Education triggers
    const addEduBtn = document.getElementById('addEduBtn');
    if (addEduBtn) addEduBtn.addEventListener('click', openEducationModal);
    
    const btnSaveEdu = document.getElementById('btnSaveEducation');
    if (btnSaveEdu) btnSaveEdu.addEventListener('click', saveEducation);

    // Project triggers
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) addProjectBtn.addEventListener('click', openProjectModal);
    
    const btnSaveProj = document.getElementById('btnSaveProject');
    if (btnSaveProj) btnSaveProj.addEventListener('click', saveProjectItem);

    // Certification triggers
    const addCertBtn = document.getElementById('addCertBtn');
    if (addCertBtn) addCertBtn.addEventListener('click', openCertificationModal);
    
    const btnSaveCert = document.getElementById('btnSaveCertification');
    if (btnSaveCert) btnSaveCert.addEventListener('click', saveCertification);

    // Testimonial triggers
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    if (addTestimonialBtn) addTestimonialBtn.addEventListener('click', openTestimonialModal);
    
    const btnSaveTest = document.getElementById('btnSaveTestimonial');
    if (btnSaveTest) btnSaveTest.addEventListener('click', saveTestimonial);

    // Theme Customizer event bindings
    const themeBgType = document.getElementById('themeBgType');
    if (themeBgType) {
        themeBgType.addEventListener('change', (e) => {
            const val = e.target.value;
            portfolioState.customTheme.backgroundType = val;
            toggleBgInputs(val);
            savePortfolioData();
            updatePreview();
        });
    }

    bindColorSync('themeBgSolid', 'themeBgSolidHex', 'backgroundSolid');
    bindColorSync('themeBgGradStart', 'themeBgGradStartHex', 'backgroundGradientStart');
    bindColorSync('themeBgGradEnd', 'themeBgGradEndHex', 'backgroundGradientEnd');
    bindColorSync('themeAccent', 'themeAccentHex', 'accent');
    bindColorSync('themeText', 'themeTextHex', 'text');

    const themeFont = document.getElementById('themeFont');
    if (themeFont) {
        themeFont.addEventListener('change', (e) => {
            portfolioState.customTheme.font = e.target.value;
            savePortfolioData();
            updatePreview();
        });
    }

    const themeCardStyle = document.getElementById('themeCardStyle');
    if (themeCardStyle) {
        themeCardStyle.addEventListener('change', (e) => {
            const val = e.target.value;
            portfolioState.customTheme.cardStyle = val;
            toggleCardInputs(val);
            savePortfolioData();
            updatePreview();
        });
    }

    const themeBlur = document.getElementById('themeBlur');
    if (themeBlur) {
        themeBlur.addEventListener('input', (e) => {
            const val = e.target.value + 'px';
            const lbl = document.getElementById('blurVal');
            if (lbl) lbl.textContent = val;
            portfolioState.customTheme.blurIntensity = val;
            savePortfolioData();
            updatePreview();
        });
    }

    const themeBorderOpacity = document.getElementById('themeBorderOpacity');
    if (themeBorderOpacity) {
        themeBorderOpacity.addEventListener('input', (e) => {
            const val = (e.target.value / 100).toFixed(2);
            const lbl = document.getElementById('borderVal');
            if (lbl) lbl.textContent = val;
            portfolioState.customTheme.borderOpacity = val;
            savePortfolioData();
            updatePreview();
        });
    }

    // Visibility toggles
    const visFields = ['photo', 'about', 'skills', 'experience', 'education', 'projects', 'certifications', 'testimonials', 'contact'];
    visFields.forEach(field => {
        const cb = document.getElementById('visible-' + field);
        if (cb) {
            cb.addEventListener('change', (e) => {
                portfolioState.sectionVisibility[field] = e.target.checked;
                savePortfolioData();
                updatePreview();
            });
        }
    });
}

function bindSocialInput(inputId, key) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value) {
            portfolioState.socialLinks[key] = value.replace(/^@/, '');
        } else {
            delete portfolioState.socialLinks[key];
        }
        savePortfolioData();
        updatePreview();
    });
}

// Handle photo upload
function handlePhotoUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        portfolioState.photo = e.target.result;
        savePortfolioData();
        
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
        updateDashboard();
    }
}

// Render experience
function renderExperience() {
    const expList = document.getElementById('experienceList');
    if (!expList) return;
    
    expList.innerHTML = portfolioState.experience.map((exp, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${exp.title}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${exp.company}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4);">${exp.startDate} – ${exp.endDate}</div>
                </div>
                <button onclick="window.portfolioBuilder.removeExperience(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">&times;</button>
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
    updateDashboard();
}

// Render education
function renderEducation() {
    const eduList = document.getElementById('educationList');
    if (!eduList) return;
    
    eduList.innerHTML = portfolioState.education.map((edu, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${edu.degree}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${edu.school}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4);">${edu.startDate} – ${edu.endDate}</div>
                </div>
                <button onclick="window.portfolioBuilder.removeEducation(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">&times;</button>
            </div>
        </div>
    `).join('');
}

// Remove education
export function removeEducation(idx) {
    portfolioState.education.splice(idx, 1);
    savePortfolioData();
    renderEducation();
    updatePreview();
}

// Render projects
function renderProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    projectsList.innerHTML = portfolioState.projects.map((project, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${project.title}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">${project.description.substring(0, 45)}...</div>
                    <div style="font-size: 10px; color: rgba(0, 255, 170, 0.6); font-family: var(--font-mono);">${(project.tags || []).join(', ')}</div>
                </div>
                <button onclick="window.portfolioBuilder.removeProject(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">&times;</button>
            </div>
        </div>
    `).join('');
}

// Remove project
export function removeProject(idx) {
    portfolioState.projects.splice(idx, 1);
    savePortfolioData();
    renderProjects();
    updatePreview();
    updateDashboard();
}

// Render Certifications
function renderCertifications() {
    const certsList = document.getElementById('certificationsList');
    if (!certsList) return;

    certsList.innerHTML = portfolioState.certifications.map((cert, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${cert.title}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${cert.issuer} (${cert.date})</div>
                </div>
                <button onclick="window.portfolioBuilder.removeCertification(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">&times;</button>
            </div>
        </div>
    `).join('');
}

// Remove certification
export function removeCertification(idx) {
    portfolioState.certifications.splice(idx, 1);
    savePortfolioData();
    renderCertifications();
    updatePreview();
}

// Render Testimonials
function renderTestimonials() {
    const testList = document.getElementById('testimonialsList');
    if (!testList) return;

    testList.innerHTML = portfolioState.testimonials.map((test, idx) => `
        <div class="exp-item">
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px;">
                <div>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">${test.name}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">${test.quote.substring(0, 45)}...</div>
                </div>
                <button onclick="window.portfolioBuilder.removeTestimonial(${idx})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px;">&times;</button>
            </div>
        </div>
    `).join('');
}

// Remove testimonial
export function removeTestimonial(idx) {
    portfolioState.testimonials.splice(idx, 1);
    savePortfolioData();
    renderTestimonials();
    updatePreview();
}

// Modals controller functions
function toggleModal(modalId, action) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (action === 'open') {
            modal.classList.add('show');
        } else {
            modal.classList.remove('show');
        }
    }
}

// Experience Modal actions
export function openExperienceModal() { toggleModal('experienceModal', 'open'); }
export function closeExperienceModal() {
    toggleModal('experienceModal', 'close');
    document.getElementById('expTitle').value = '';
    document.getElementById('expCompany').value = '';
    document.getElementById('expStartDate').value = '';
    document.getElementById('expEndDate').value = '';
}
export function saveExperience() {
    const title = document.getElementById('expTitle').value.trim();
    const company = document.getElementById('expCompany').value.trim();
    const startDate = document.getElementById('expStartDate').value.trim();
    const endDate = document.getElementById('expEndDate').value.trim() || 'Present';

    if (!title || !company || !startDate) {
        alert('Title, Company, and Start Date are required.');
        return;
    }

    portfolioState.experience.push({ title, company, startDate, endDate });
    savePortfolioData();
    renderExperience();
    updatePreview();
    updateDashboard();
    closeExperienceModal();
}

// Education Modal actions
export function openEducationModal() { toggleModal('educationModal', 'open'); }
export function closeEducationModal() {
    toggleModal('educationModal', 'close');
    document.getElementById('eduSchool').value = '';
    document.getElementById('eduDegree').value = '';
    document.getElementById('eduStartDate').value = '';
    document.getElementById('eduEndDate').value = '';
}
export function saveEducation() {
    const school = document.getElementById('eduSchool').value.trim();
    const degree = document.getElementById('eduDegree').value.trim();
    const startDate = document.getElementById('eduStartDate').value.trim();
    const endDate = document.getElementById('eduEndDate').value.trim() || 'Present';

    if (!school || !degree || !startDate) {
        alert('School, Degree, and Start Date are required.');
        return;
    }

    portfolioState.education.push({ school, degree, startDate, endDate });
    savePortfolioData();
    renderEducation();
    updatePreview();
    closeEducationModal();
}

// Project Modal actions
export function openProjectModal() { toggleModal('projectModal', 'open'); }
export function closeProjectModal() {
    toggleModal('projectModal', 'close');
    document.getElementById('projTitle').value = '';
    document.getElementById('projDesc').value = '';
    document.getElementById('projTags').value = '';
    document.getElementById('projLink').value = '';
    document.getElementById('projStatus').value = 'Featured';
}
export function saveProjectItem() {
    const title = document.getElementById('projTitle').value.trim();
    const description = document.getElementById('projDesc').value.trim();
    const tagsVal = document.getElementById('projTags').value.trim();
    const link = document.getElementById('projLink').value.trim();
    const status = document.getElementById('projStatus').value;

    if (!title || !description) {
        alert('Project Title and Description are required.');
        return;
    }

    const tags = tagsVal
        ? tagsVal.split(',').map(t => t.trim()).filter(Boolean)
        : ['Portfolio', 'Project'];

    portfolioState.projects.push({
        id: 'proj_' + Date.now(),
        title,
        description,
        tags,
        status,
        link,
        image: 'assets/right2.jpg'
    });

    savePortfolioData();
    renderProjects();
    updatePreview();
    updateDashboard();
    closeProjectModal();
}

// Certification Modal actions
export function openCertificationModal() { toggleModal('certificationModal', 'open'); }
export function closeCertificationModal() {
    toggleModal('certificationModal', 'close');
    document.getElementById('certTitle').value = '';
    document.getElementById('certIssuer').value = '';
    document.getElementById('certDate').value = '';
    document.getElementById('certLink').value = '';
}
export function saveCertification() {
    const title = document.getElementById('certTitle').value.trim();
    const issuer = document.getElementById('certIssuer').value.trim();
    const date = document.getElementById('certDate').value.trim();
    const link = document.getElementById('certLink').value.trim();

    if (!title || !issuer || !date) {
        alert('Title, Issuer, and Date are required.');
        return;
    }

    portfolioState.certifications.push({ title, issuer, date, link });
    savePortfolioData();
    renderCertifications();
    updatePreview();
    closeCertificationModal();
}

// Testimonial Modal actions
export function openTestimonialModal() { toggleModal('testimonialModal', 'open'); }
export function closeTestimonialModal() {
    toggleModal('testimonialModal', 'close');
    document.getElementById('testName').value = '';
    document.getElementById('testRole').value = '';
    document.getElementById('testQuote').value = '';
}
export function saveTestimonial() {
    const name = document.getElementById('testName').value.trim();
    const role = document.getElementById('testRole').value.trim();
    const quote = document.getElementById('testQuote').value.trim();

    if (!name || !role || !quote) {
        alert('Name, Title/Company, and Quote are required.');
        return;
    }

    portfolioState.testimonials.push({ name, role, quote });
    savePortfolioData();
    renderTestimonials();
    updatePreview();
    closeTestimonialModal();
}

// Helper to calculate relative luminance of a hex color
function isColorLight(hex) {
    if (!hex) return false;
    let cleanHex = hex.trim().replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    if (cleanHex.length !== 6) return false;
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    // Relative luminance formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 140;
}

// Scoped preview CSS generator to match view-portfolio.html dynamic styles
function injectPreviewStyles(t, isCustom = false) {
    let styleTag = document.getElementById('preview-dynamic-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'preview-dynamic-styles';
        document.head.appendChild(styleTag);
    }
    
    // Fallback/Custom check variables
    const font = isCustom ? portfolioState.customTheme.font : t.font;
    const accent = isCustom ? portfolioState.customTheme.accent : t.colors.accent;
    const text = isCustom ? portfolioState.customTheme.text : t.colors.text;
    const cardStyle = isCustom ? portfolioState.customTheme.cardStyle : t.cardStyle;
    
    // Background style resolution
    let bgStyle = '';
    if (isCustom) {
        if (portfolioState.customTheme.backgroundType === 'gradient') {
            bgStyle = `linear-gradient(135deg, ${portfolioState.customTheme.backgroundGradientStart} 0%, ${portfolioState.customTheme.backgroundGradientEnd} 100%)`;
        } else {
            bgStyle = portfolioState.customTheme.backgroundSolid;
        }
    } else {
        bgStyle = `radial-gradient(circle at top right, ${t.colors.accent}22, transparent 34rem), ${t.colors.background}`;
    }
    
    const isGlass = cardStyle === 'glassmorphism';
    const isGlow = cardStyle === 'glow';
    
    const bgSolid = isCustom ? portfolioState.customTheme.backgroundSolid : t.colors.background;
    const bgGradStart = isCustom ? portfolioState.customTheme.backgroundGradientStart : t.colors.background;
    const bgType = isCustom ? portfolioState.customTheme.backgroundType : 'solid';
    const currentBg = bgType === 'solid' ? bgSolid : bgGradStart;
    const isLight = isColorLight(currentBg);
    
    const blur = isCustom ? portfolioState.customTheme.blurIntensity : '15px';
    const borderOp = isCustom ? portfolioState.customTheme.borderOpacity : '0.08';
    
    let cardBg = '';
    let cardBorder = '';
    let cardShadow = '';
    
    if (isGlass) {
        cardBg = isLight ? `rgba(0, 0, 0, 0.03)` : `rgba(255, 255, 255, 0.045)`;
        cardBorder = `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, ' + borderOp + ')'}`;
        cardShadow = 'none';
    } else if (isGlow) {
        cardBg = isLight ? '#ffffff' : '#0f1220';
        cardBorder = `1px solid ${accent}33`;
        cardShadow = `0 8px 30px ${accent}0e, 0 0 16px ${accent}04`;
    } else if (cardStyle === 'shadow') {
        cardBg = isLight ? '#ffffff' : '#111322';
        cardBorder = isLight ? '1px solid #e5e7eb' : '1px solid #1e293b';
        cardShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.06)';
    } else {
        cardBg = isLight ? '#f9fafb' : '#0f1220';
        cardBorder = isLight ? '1px solid #e5e7eb' : '1px solid #1e293b';
        cardShadow = 'none';
    }
    
    styleTag.innerHTML = `
        .portfolio-preview {
            font-family: "${font}", var(--font-sans) !important;
            background: ${bgStyle} !important;
            color: ${text} !important;
            transition: background 0.3s ease, color 0.3s ease;
            border-radius: 12px;
            padding: 48px;
        }

        .portfolio-preview .preview-name {
            color: ${text} !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-role {
            color: ${accent} !important;
            font-family: var(--font-mono) !important;
        }

        .portfolio-preview .preview-tagline {
            color: ${text}bb !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-location-badge {
            color: ${accent}dd !important;
            border: 1px solid ${accent}25 !important;
            background: ${accent}0a !important;
        }

        .portfolio-preview .preview-about {
            color: ${text}cc !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-section-title {
            color: ${text} !important;
            border-bottom: 2px dashed ${accent}33 !important;
            font-family: "${font}", var(--font-sans) !important;
            margin-bottom: 20px;
        }

        .portfolio-preview .preview-section-container {
            background: ${cardBg} !important;
            border: ${cardBorder} !important;
            box-shadow: ${cardShadow} !important;
            backdrop-filter: blur(${blur}) !important;
            -webkit-backdrop-filter: blur(${blur}) !important;
            padding: 24px;
            border-radius: 14px;
            margin-bottom: 24px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .portfolio-preview .preview-skill {
            background: ${isGlass ? 'rgba(255, 255, 255, 0.05)' : accent + '10'} !important;
            color: ${isLight ? '#111111' : '#ffffff'} !important;
            border: 1px solid ${isGlass ? 'rgba(255, 255, 255, 0.08)' : accent + '20'} !important;
            font-family: var(--font-mono) !important;
        }

        .portfolio-preview .preview-experience-item {
            background: ${isGlass ? 'rgba(255, 255, 255, 0.02)' : (isLight ? '#f3f4f6' : '#070912')} !important;
            border: 1px solid ${isGlass ? 'rgba(255, 255, 255, 0.04)' : (isLight ? '#e5e7eb' : '#1e293b')} !important;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 12px;
            border-left: 3px solid ${accent} !important;
        }

        .portfolio-preview .preview-exp-title {
            color: ${text} !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-exp-company {
            color: ${accent} !important;
            font-family: var(--font-sans) !important;
        }

        .portfolio-preview .preview-exp-period {
            color: ${text}77 !important;
            font-family: var(--font-mono) !important;
        }

        .portfolio-preview .preview-photo {
            border: 3px solid ${accent} !important;
        }

        .portfolio-preview .social-anchor {
            color: ${text}88 !important;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }

        .portfolio-preview .social-anchor:hover {
            color: ${accent} !important;
        }
    `;
}

// Update live preview panel
function updatePreview() {
    const preview = document.querySelector('.portfolio-preview');
    if (!preview) return;
    
    // Inject dynamic styling scoped to the preview container
    const isCustom = portfolioState.selectedTemplate === 'custom' || portfolioState.customTheme.backgroundSolid !== '';
    const template = getTemplate(portfolioState.selectedTemplate);
    injectPreviewStyles(template || { font: 'Inter', colors: { background: '#ffffff', text: '#111111', accent: '#000000' }, cardStyle: 'flat' }, isCustom);
    
    // Apply template structural layout class
    if (template && template.layout) {
        preview.className = `portfolio-preview layout-${template.layout}`;
    } else {
        preview.className = 'portfolio-preview layout-centered';
    }

    // Update section visibilities
    const vis = portfolioState.sectionVisibility || {};
    Object.keys(vis).forEach(section => {
        const container = preview.querySelector(`[data-section="${section}"]`);
        const photoSection = document.getElementById('previewPhotoSection');
        
        if (section === 'photo') {
            if (photoSection) {
                photoSection.style.display = vis.photo ? 'block' : 'none';
            }
        } else if (container) {
            container.style.display = vis[section] ? 'block' : 'none';
        }
    });

    // Update hero section text
    const previewName = preview.querySelector('.preview-name');
    const previewRole = preview.querySelector('.preview-role');
    const previewTagline = preview.querySelector('.preview-tagline');
    const previewLocation = preview.querySelector('.preview-location-text');
    const previewPhoto = preview.querySelector('.preview-photo');
    
    if (previewName) previewName.textContent = portfolioState.name;
    if (previewRole) previewRole.textContent = portfolioState.role;
    if (previewTagline) previewTagline.textContent = portfolioState.tagline;
    if (previewLocation) previewLocation.textContent = portfolioState.location;
    
    if (previewPhoto) {
        if (portfolioState.photo) {
            previewPhoto.src = portfolioState.photo;
            previewPhoto.style.display = 'block';
        } else {
            previewPhoto.style.display = 'none';
        }
    }
    
    // Update quick connect socials row
    updatePreviewConnectRow();
    
    // Update skills
    updatePreviewSkills();
    
    // Update experience
    updatePreviewExperience();

    // Update education
    updatePreviewEducation();
    
    // Update projects
    updatePreviewProjects();

    // Update certifications
    updatePreviewCertifications();

    // Update testimonials
    updatePreviewTestimonials();
}

function updatePreviewConnectRow() {
    const container = document.querySelector('.preview-quick-connect');
    if (!container) return;

    let html = '';
    const links = portfolioState.socialLinks || {};
    
    if (portfolioState.email) {
        html += `<a href="mailto:${portfolioState.email}" class="social-anchor" target="_blank">Email</a>`;
    }
    if (portfolioState.phone) {
        html += `<span style="opacity:0.3;">|</span> <span class="social-anchor">${portfolioState.phone}</span>`;
    }
    if (portfolioState.websiteUrl) {
        html += `<span style="opacity:0.3;">|</span> <a href="${portfolioState.websiteUrl}" class="social-anchor" target="_blank">Website</a>`;
    }
    if (links.github) {
        html += `<span style="opacity:0.3;">|</span> <a href="https://github.com/${links.github}" class="social-anchor" target="_blank">GitHub</a>`;
    }
    if (links.linkedin) {
        html += `<span style="opacity:0.3;">|</span> <a href="https://linkedin.com/in/${links.linkedin}" class="social-anchor" target="_blank">LinkedIn</a>`;
    }
    if (links.twitter) {
        html += `<span style="opacity:0.3;">|</span> <a href="https://twitter.com/${links.twitter}" class="social-anchor" target="_blank">Twitter</a>`;
    }
    
    container.innerHTML = html;
}

// Update preview skills
function updatePreviewSkills() {
    const skillsContainer = document.querySelector('[data-section="skills"] .preview-skills');
    if (!skillsContainer) return;
    
    if (!portfolioState.skills.length) {
        skillsContainer.innerHTML = `<p style="font-size:0.85rem; opacity:0.65; margin:0;">Add skills in the editor sidebar.</p>`;
        return;
    }
    
    skillsContainer.innerHTML = portfolioState.skills.map(skill => `
        <div class="preview-skill">${skill}</div>
    `).join('');
}

// Update preview experience
function updatePreviewExperience() {
    const expContainer = document.getElementById('experiencePreview');
    if (!expContainer) return;
    
    if (!portfolioState.experience.length) {
        expContainer.innerHTML = `
            <p style="font-size: 0.85rem; opacity: 0.65; margin: 0;">
                Add experiences in the editor sidebar.
            </p>
        `;
        return;
    }
    
    expContainer.innerHTML = portfolioState.experience.map(exp => `
        <div class="preview-experience-item">
            <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${exp.title}</div>
            <div class="preview-exp-company" style="font-weight:500; font-size:0.85rem; margin-top: 2px;">${exp.company}</div>
            <div class="preview-exp-period" style="font-size:0.75rem; margin-top: 4px;">${exp.startDate} – ${exp.endDate}</div>
        </div>
    `).join('');
}

// Update preview education
function updatePreviewEducation() {
    const eduContainer = document.getElementById('educationPreview');
    if (!eduContainer) return;

    if (!portfolioState.education.length) {
        eduContainer.innerHTML = `
            <p style="font-size: 0.85rem; opacity: 0.65; margin: 0;">
                Add education details in the editor sidebar.
            </p>
        `;
        return;
    }

    eduContainer.innerHTML = portfolioState.education.map(edu => `
        <div class="preview-experience-item">
            <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${edu.degree}</div>
            <div class="preview-exp-company" style="font-weight:500; font-size:0.85rem; margin-top: 2px;">${edu.school}</div>
            <div class="preview-exp-period" style="font-size:0.75rem; margin-top: 4px;">${edu.startDate} – ${edu.endDate}</div>
        </div>
    `).join('');
}

// Update preview projects
function updatePreviewProjects() {
    const projectsContainer = document.getElementById('projectsPreview');
    if (!projectsContainer) return;

    if (!portfolioState.projects.length) {
        projectsContainer.innerHTML = `
            <p style="font-size: 0.85rem; opacity: 0.65; margin: 0;">
                Add projects in the editor sidebar to show them here.
            </p>
        `;
        return;
    }

    projectsContainer.innerHTML = portfolioState.projects.map(project => `
        <div class="preview-experience-item">
            <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${project.title}</div>
            <div class="preview-exp-company" style="font-size:0.85rem; margin: 4px 0 8px 0; line-height: 1.4;">${project.description}</div>
            ${project.link ? `<a href="${project.link}" target="_blank" style="font-size:0.75rem; color:inherit; text-decoration:underline; display:inline-block; margin-bottom:8px;">View Link &rarr;</a>` : ''}
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                ${(project.tags || []).map(tag => `<span class="preview-skill" style="font-size:0.7rem; padding:3px 8px;">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Update preview certifications
function updatePreviewCertifications() {
    const certsContainer = document.getElementById('certificationsPreview');
    if (!certsContainer) return;

    if (!portfolioState.certifications.length) {
        certsContainer.innerHTML = `
            <p style="font-size: 0.85rem; opacity: 0.65; margin: 0;">
                Add certifications in the editor sidebar.
            </p>
        `;
        return;
    }

    certsContainer.innerHTML = portfolioState.certifications.map(cert => `
        <div class="preview-experience-item" style="border-left-width: 2px;">
            <div class="preview-exp-title" style="font-weight:600; font-size:0.95rem;">${cert.title}</div>
            <div class="preview-exp-company" style="font-size:0.85rem; margin-top:2px;">
                ${cert.issuer} &bull; <span style="font-size:0.75rem; opacity:0.6;">${cert.date}</span>
            </div>
            ${cert.link ? `<a href="${cert.link}" target="_blank" style="font-size:0.75rem; color:inherit; text-decoration:underline; display:inline-block; margin-top:4px;">Verify Credentials &rarr;</a>` : ''}
        </div>
    `).join('');
}

// Update preview testimonials
function updatePreviewTestimonials() {
    const testimonialsContainer = document.getElementById('testimonialsPreview');
    if (!testimonialsContainer) return;

    if (!portfolioState.testimonials.length) {
        testimonialsContainer.innerHTML = `
            <p style="font-size: 0.85rem; opacity: 0.65; margin: 0;">
                Add testimonials in the editor sidebar.
            </p>
        `;
        return;
    }

    testimonialsContainer.innerHTML = portfolioState.testimonials.map(test => `
        <div class="preview-experience-item" style="border-left: 2px solid rgba(0,0,0,0.15); background:rgba(0,0,0,0.015); padding:16px;">
            <p style="font-style:italic; font-size:0.85rem; line-height:1.5; margin:0 0 10px 0;">"${test.quote}"</p>
            <div style="font-weight:600; font-size:0.85rem;">${test.name}</div>
            <div style="font-size:0.75rem; opacity:0.7; margin-top:1px;">${test.role}</div>
        </div>
    `).join('');
}

// Setup template gallery
async function setupTemplateGallery() {
    const templatesContainer = document.getElementById('templatesGallery');
    if (!templatesContainer) return;
    
    const allTemplates = getAllTemplates();
    
    // Add custom template card at the end
    const customCardHtml = `
        <div class="template-card ${portfolioState.selectedTemplate === 'custom' ? 'selected' : ''}" onclick="window.portfolioBuilder.selectTemplate('custom')">
            <div class="template-thumbnail" style="background: linear-gradient(135deg, #1f1f2e 0%, #111119 100%);">
                <span style="color:#00ffaa; font-family: monospace;">CUSTOM</span>
            </div>
            <div class="template-info">
                <div class="template-name">Custom Theme Builder</div>
            </div>
        </div>
    `;
    
    templatesContainer.innerHTML = allTemplates.map(template => {
        // Build color indicators representing template palette
        const paletteHtml = `
            <div style="display:flex; gap:4px; margin-top: 4px;">
                <div style="width:10px; height:10px; border-radius:50%; background:${template.colors.background}; border:1px solid rgba(255,255,255,0.2);"></div>
                <div style="width:10px; height:10px; border-radius:50%; background:${template.colors.text}; border:1px solid rgba(255,255,255,0.2);"></div>
                <div style="width:10px; height:10px; border-radius:50%; background:${template.colors.accent}; border:1px solid rgba(255,255,255,0.2);"></div>
            </div>
        `;
        return `
            <div class="template-card ${template.id === portfolioState.selectedTemplate ? 'selected' : ''}" onclick="window.portfolioBuilder.selectTemplate('${template.id}')">
                <div class="template-thumbnail" style="background: linear-gradient(135deg, ${template.colors.background} 0%, rgba(20,20,20,0.85) 100%); border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="color:${template.colors.text}; font-size:10px; font-family:${template.font}, sans-serif;">${template.name}</span>
                </div>
                <div class="template-info">
                    <div class="template-name" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>${template.name}</span>
                        ${paletteHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('') + customCardHtml;
    
    if (window.lucide) window.lucide.createIcons();
}

// Select template
export function selectTemplate(templateId) {
    portfolioState.selectedTemplate = templateId;
    
    if (templateId !== 'custom') {
        const t = getTemplate(templateId);
        if (t) {
            // Re-apply template styles to the custom theme variables for easier override
            portfolioState.customTheme.backgroundType = (templateId === 'glass' || templateId === 'executive') ? 'gradient' : 'solid';
            portfolioState.customTheme.backgroundSolid = t.colors.background;
            portfolioState.customTheme.backgroundGradientStart = t.colors.background;
            portfolioState.customTheme.backgroundGradientEnd = '#020308';
            portfolioState.customTheme.text = t.colors.text;
            portfolioState.customTheme.accent = t.colors.accent;
            portfolioState.customTheme.font = t.font;
            portfolioState.customTheme.cardStyle = t.cardStyle || 'flat';
            
            // Sync controls visibilities to template preset default
            const vis = t.sections || {};
            Object.keys(portfolioState.sectionVisibility).forEach(k => {
                portfolioState.sectionVisibility[k] = vis[k] !== undefined ? vis[k] : true;
            });
        }
    }
    
    savePortfolioData();
    populateEditorForm();
    setupTemplateGallery();
    updatePreview();
}

// Dashboard stats
export function updateDashboard() {
    const statsContainer = document.querySelector('.dashboard-grid');
    if (!statsContainer) return;
    
    const stats = {
        'Views': Math.floor(Math.random() * 500) + 120,
        'Projects': portfolioState.projects.length,
        'Skills Listed': portfolioState.skills.length,
        'Experience': portfolioState.experience.length
    };
    
    statsContainer.innerHTML = Object.entries(stats).map(([label, value]) => `
        <div class="dashboard-widget">
            <div class="widget-value">${value}</div>
            <div class="widget-label">${label}</div>
        </div>
    `).join('');
}

// Load a preset portfolio from mock creators database
export function loadPreset(username) {
    const creators = getCreators();
    const creator = creators.find(c => c.username === username);
    if (!creator) return;

    portfolioState.name = creator.name;
    portfolioState.role = creator.role || 'Creative Developer';
    portfolioState.about = creator.bio;
    portfolioState.photo = creator.avatar;
    portfolioState.skills = [...creator.skills];
    portfolioState.experience = creator.experience ? JSON.parse(JSON.stringify(creator.experience)) : [];
    
    // Seed new arrays with nice mock details
    portfolioState.education = [
        { school: 'Apex Design Academy', degree: 'Advanced UI Design Certification', startDate: '2022', endDate: '2023' },
        { school: 'University of Digital Arts', degree: 'B.S. Interaction Science', startDate: '2018', endDate: '2022' }
    ];
    portfolioState.certifications = [
        { title: 'Certified Webflow Developer', issuer: 'Webflow Academy', date: '2024-05', link: '#' },
        { title: 'Human-Computer Interaction Expert', issuer: 'Interaction Design Foundation', date: '2023-11', link: '#' }
    ];
    portfolioState.testimonials = [
        { name: 'Elena Rostova', role: 'Design Lead at Stripe', quote: `${creator.name} is a brilliant UI engineer. Their eye for detail and animations brought our project to life.` },
        { name: 'Devon Keir', role: 'CTO at Vercel Labs', quote: `Incredibly clean HTML & Javascript structure. Delivery was flawless and ahead of schedule.` }
    ];

    portfolioState.tagline = `Designing premium interfaces and future-proof digital spaces.`;
    portfolioState.location = creator.username === 'hyper_arch' ? 'London, UK' : (creator.username === 'linear_flow' ? 'Berlin, DE' : 'San Francisco, CA');
    portfolioState.email = `${creator.username}@apex-creators.io`;
    portfolioState.phone = '+1 (555) 321-7654';
    portfolioState.websiteUrl = `https://apex-creators.io/${creator.username}`;

    portfolioState.projects = creator.projects ? JSON.parse(JSON.stringify(creator.projects)) : [{
        id: `${creator.username}_demo_project`,
        title: `${creator.name.split(' ')[0]}'s Signature Portfolio`,
        description: 'A polished demo project used to show how portfolio case studies appear after publishing.',
        tags: creator.skills.slice(0, 3),
        status: 'Featured',
        image: creator.banner
    }];
    portfolioState.selectedTemplate = creator.selectedTemplate || 'minimal';
    portfolioState.socialLinks = creator.socialLinks ? JSON.parse(JSON.stringify(creator.socialLinks)) : {};

    // Seed preset theme settings
    const t = getTemplate(portfolioState.selectedTemplate);
    if (t) {
        portfolioState.customTheme.backgroundType = (portfolioState.selectedTemplate === 'glass' || portfolioState.selectedTemplate === 'executive') ? 'gradient' : 'solid';
        portfolioState.customTheme.backgroundSolid = t.colors.background;
        portfolioState.customTheme.backgroundGradientStart = t.colors.background;
        portfolioState.customTheme.backgroundGradientEnd = '#04050d';
        portfolioState.customTheme.text = t.colors.text;
        portfolioState.customTheme.accent = t.colors.accent;
        portfolioState.customTheme.font = t.font;
        portfolioState.customTheme.cardStyle = t.cardStyle || 'flat';
    }

    savePortfolioData();
    populateEditorForm();
    setupTemplateGallery();
    updatePreview();
    updateDashboard();
}

// Export portfolio builder API
export const portfolioBuilder = {
    removeSkill,
    removeExperience,
    removeEducation,
    removeProject,
    removeCertification,
    removeTestimonial,
    selectTemplate,
    updateDashboard,
    loadPreset,
    
    openExperienceModal,
    closeExperienceModal,
    saveExperience,

    openEducationModal,
    closeEducationModal,
    saveEducation,
    
    openProjectModal,
    closeProjectModal,
    saveProjectItem,

    openCertificationModal,
    closeCertificationModal,
    saveCertification,

    openTestimonialModal,
    closeTestimonialModal,
    saveTestimonial,

    getState: () => portfolioState,
    saveData: savePortfolioData,
    loadData: loadPortfolioData
};

// Make available globally
window.portfolioBuilder = portfolioBuilder;
