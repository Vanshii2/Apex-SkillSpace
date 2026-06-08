/*
   APEX SKILLSPACE - PORTFOLIO BUILDER
   Core portfolio builder logic and state management
*/

import { initParticles } from './particles.js';
import { loadTemplates, applyTemplate, getAllTemplates, getTemplate } from './templates.js';
import { initDB, getCreators } from './modules/db.js';
import { showToast } from './core/global.js';

// Portfolio Data Structure
const portfolioState = {
    name: '',
    role: '',
    tagline: '',
    location: '',
    email: '',
    phone: '',
    websiteUrl: '',
    about: '',
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
        accent: '#111111',
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

    // Load templates
    await loadTemplates();

    // Setup collapsible accordions
    setupAccordions();

    // Setup resizable left panel
    setupPanelResize();

    // Setup device toggle view
    setupDeviceToggle();

    // Setup event listeners
    setupEditorListeners();
    setupTemplateGallery();

    // Setup Switcher listeners
    setupPortfolioSwitcher();

    // Initialize state
    const list = getPortfoliosList();
    if (list.length === 0) {
        const defaultPort = createPlaceholderPortfolio('port_default');
        savePortfoliosList([defaultPort]);
        localStorage.setItem('apex-current-portfolio-id', 'port_default');
    }

    let activeId = localStorage.getItem('apex-current-portfolio-id');
    if (!activeId || !list.some(p => p.id === activeId)) {
        const currentList = getPortfoliosList();
        if (currentList.length > 0) {
            activeId = currentList[0].id;
            localStorage.setItem('apex-current-portfolio-id', activeId);
        }
    }

    loadPortfolioData();
    populatePortfolioSelect();
    updatePreview();
    setupValidationListeners();

    console.log('Portfolio Builder Ready');
}

// Setup collapsible accordions
function setupAccordions() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const isOpen = section.classList.contains('open');

            // Collapse all others
            document.querySelectorAll('.accordion-section').forEach(s => {
                s.classList.remove('open');
            });

            if (!isOpen) {
                section.classList.add('open');
            }
        });
    });
}

// Setup resizable sidebar panel width
function setupPanelResize() {
    const handle = document.getElementById('panelResizeHandle');
    const panel = document.getElementById('builderPanel');
    if (!handle || !panel) return;

    let isResizing = false;

    handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        handle.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = e.clientX;
        if (newWidth >= 280 && newWidth <= 520) {
            panel.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            handle.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Setup device preview mode toggles
function setupDeviceToggle() {
    const desktopBtn = document.getElementById('deviceDesktop');
    const mobileBtn = document.getElementById('deviceMobile');
    const frame = document.getElementById('canvasPreviewFrame');

    if (desktopBtn && mobileBtn && frame) {
        desktopBtn.addEventListener('click', () => {
            desktopBtn.classList.add('active');
            mobileBtn.classList.remove('active');
            frame.classList.remove('mobile-view');
        });

        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.add('active');
            desktopBtn.classList.remove('active');
            frame.classList.add('mobile-view');
        });
    }
}

// Helper to get list of portfolios from local storage
function getPortfoliosList() {
    const saved = localStorage.getItem('apex-portfolios-list');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse portfolios list, resetting...', e);
        }
    }

    // Fallback/Migration: seed default list with the current single portfolio if it exists
    const single = localStorage.getItem('apex-portfolio');
    if (single) {
        try {
            const parsed = JSON.parse(single);
            parsed.id = parsed.id || 'port_default';
            parsed.updatedAt = parsed.updatedAt || Date.now();
            const defaultList = [parsed];
            localStorage.setItem('apex-portfolios-list', JSON.stringify(defaultList));
            return defaultList;
        } catch (e) { }
    }

    return [];
}

// Helper to save list of portfolios
function savePortfoliosList(list) {
    localStorage.setItem('apex-portfolios-list', JSON.stringify(list));
}

// Create new blank portfolio object with placeholder values
const createPlaceholderPortfolio = (id) => {
    // Try to seed real user name from auth
    let realName = '';
    let realEmail = '';
    try {
        const authData = localStorage.getItem('apex_user_data');
        if (authData) {
            const authUser = JSON.parse(authData);
            realName = authUser.name || '';
            realEmail = authUser.email || '';
        }
    } catch(_) {}

    return {
        id: id || 'port_' + Date.now(),
        name: realName,
        role: '',
        tagline: '',
        location: '',
        email: realEmail,
        phone: '',
        websiteUrl: '',
        about: '',
        photo: '',
        skills: ['JavaScript', 'React', 'CSS'],
        experience: [
            {
                id: 'exp_' + Date.now(),
                title: 'Software Engineer',
                company: 'Tech Corp',
                startDate: '2023-01-01',
                endDate: ''
            }
        ],
        education: [
            {
                id: 'edu_' + Date.now(),
                degree: 'B.S. Computer Science',
                school: 'University of Technology',
                startDate: '2019-09-01',
                endDate: '2023-05-01'
            }
        ],
        projects: [
            {
                id: 'proj_' + Date.now(),
                title: 'E-commerce Platform',
                description: 'A full-stack e-commerce application built with React and Node.js.',
                tags: 'React, Node, MongoDB',
                link: '#',
                status: 'Featured'
            }
        ],
        certifications: [],
        testimonials: [],
        socialLinks: {},
        selectedTemplate: 'minimal',
        theme: 'dark',
        customTheme: {
            backgroundType: 'solid',
            backgroundSolid: '#ffffff',
            backgroundGradientStart: '#0f1220',
            backgroundGradientEnd: '#060814',
            text: '#111111',
            accent: '#111111',
            font: 'Inter',
            cardStyle: 'flat',
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
        },
        updatedAt: Date.now()
    };
};

// Load data from localStorage
function loadPortfolioData() {
    const activeId = localStorage.getItem('apex-current-portfolio-id');
    if (!activeId) return;

    const list = getPortfoliosList();
    const activePort = list.find(p => p.id === activeId);

    if (activePort) {
        // Handle migration fields gracefully
        if (!activePort.customTheme) {
            activePort.customTheme = {
                backgroundType: 'solid',
                backgroundSolid: '#ffffff',
                backgroundGradientStart: '#0f1220',
                backgroundGradientEnd: '#060814',
                text: '#111111',
                accent: '#111111',
                font: 'Inter',
                cardStyle: 'flat',
                blurIntensity: '15px',
                borderOpacity: '0.08'
            };
        }
        if (activePort.customTheme.accent === '#00ffaa' || activePort.customTheme.accent === '#00FFAA' || activePort.customTheme.accent === '#dc2626') {
            activePort.customTheme.accent = '#111111';
        }
        if (!activePort.sectionVisibility) {
            activePort.sectionVisibility = {
                photo: true,
                about: true,
                skills: true,
                experience: true,
                education: true,
                projects: true,
                certifications: true,
                testimonials: true,
                contact: true
            };
        }
        if (!activePort.education) activePort.education = [];
        if (!activePort.certifications) activePort.certifications = [];
        if (!activePort.testimonials) activePort.testimonials = [];
        if (!activePort.tagline) activePort.tagline = 'Crafting beautiful and functional digital experiences.';
        if (!activePort.location) activePort.location = 'San Francisco, CA';
        if (!activePort.email) activePort.email = '';
        if (!activePort.phone) activePort.phone = '';
        if (!activePort.websiteUrl) activePort.websiteUrl = '';
        if (!activePort.socialLinks) activePort.socialLinks = {};

        Object.assign(portfolioState, activePort);
    } else {
        const placeholder = createPlaceholderPortfolio(activeId);
        list.push(placeholder);
        savePortfoliosList(list);
        Object.assign(portfolioState, placeholder);
    }

    // Populate form fields with saved data
    populateEditorForm();
}

// Save data to localStorage
function savePortfolioData() {
    const activeId = localStorage.getItem('apex-current-portfolio-id');
    if (!activeId) return;

    portfolioState.id = activeId;
    portfolioState.updatedAt = Date.now();

    const list = getPortfoliosList();
    const idx = list.findIndex(p => p.id === activeId);

    if (idx !== -1) {
        list[idx] = { ...portfolioState };
    } else {
        list.push({ ...portfolioState });
    }

    savePortfoliosList(list);

    // Sync active state back for index.html/marketplace compatibility
    localStorage.setItem('apex-portfolio', JSON.stringify(portfolioState));

    // Refresh dropdown name/role display text
    populatePortfolioSelect();
}

// Setup Portfolio Switcher and Dropdown Event Listeners
function setupPortfolioSwitcher() {
    const btnCreate = document.getElementById('btnCreateNewSidebar');
    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            createNewPortfolio();
        });
    }

    const selectEl = document.getElementById('portfolioSelect');
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const id = e.target.value;
            if (id) {
                editPortfolio(id);
            }
        });
    }

    const btnDelete = document.getElementById('btnDeleteCurrentPortfolio');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const activeId = localStorage.getItem('apex-current-portfolio-id');
            if (activeId) {
                deletePortfolio(activeId);
            }
        });
    }
}

// Populate the Switcher Dropdown in the Sidebar
function populatePortfolioSelect() {
    const selectEl = document.getElementById('portfolioSelect');
    if (!selectEl) return;

    const list = getPortfoliosList();
    const activeId = localStorage.getItem('apex-current-portfolio-id');

    selectEl.innerHTML = list.map(port => `
        <option value="${port.id}" ${port.id === activeId ? 'selected' : ''}>
            ${port.name || 'Untitled Portfolio'} (${port.role || 'No Role'})
        </option>
    `).join('');
}

// Create New Portfolio from Sidebar
export function createNewPortfolio() {
    const list = getPortfoliosList();
    const newId = 'port_' + Date.now();
    const newPort = createPlaceholderPortfolio(newId);

    list.push(newPort);
    savePortfoliosList(list);

    localStorage.setItem('apex-current-portfolio-id', newId);

    loadPortfolioData();
    populatePortfolioSelect();
    populateEditorForm();
    renderSkills();
    renderExperience();
    renderEducation();
    renderProjects();
    updatePreview();
}

// Edit/Switch Portfolio
export function editPortfolio(id) {
    localStorage.setItem('apex-current-portfolio-id', id);
    loadPortfolioData();
    populatePortfolioSelect();
    populateEditorForm();
    renderSkills();
    renderExperience();
    renderEducation();
    renderProjects();
    updatePreview();
}

// Delete Portfolio
export function deletePortfolio(id) {
    const list = getPortfoliosList();
    const item = list.find(p => p.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name || 'Untitled Portfolio'}"?`)) {
        const updated = list.filter(p => p.id !== id);
        savePortfoliosList(updated);

        const activeId = localStorage.getItem('apex-current-portfolio-id');
        if (activeId === id) {
            if (updated.length > 0) {
                localStorage.setItem('apex-current-portfolio-id', updated[0].id);
            } else {
                const newId = 'port_' + Date.now();
                const newPort = createPlaceholderPortfolio(newId);
                savePortfoliosList([newPort]);
                localStorage.setItem('apex-current-portfolio-id', newId);
            }
        }
        loadPortfolioData();
        populatePortfolioSelect();
        populateEditorForm();
        renderSkills();
        renderExperience();
        renderEducation();
        renderProjects();
        updatePreview();
    }
}

// Helper to set current active portfolio id and view it
export function setCurrentAndNavigate(id, event) {
    localStorage.setItem('apex-current-portfolio-id', id);
    const list = getPortfoliosList();
    const port = list.find(p => p.id === id);
    if (port) {
        localStorage.setItem('apex-portfolio', JSON.stringify(port));
    }
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
    const themeFontSize = document.getElementById('themeFontSize');
    const themeCardStyle = document.getElementById('themeCardStyle');
    const themeBlur = document.getElementById('themeBlur');
    const themeBorderOpacity = document.getElementById('themeBorderOpacity');

    const ct = portfolioState.customTheme;

    // Set background type radios
    const bgTypeSolid = document.querySelector('input[name="bgType"][value="solid"]');
    const bgTypeGradient = document.querySelector('input[name="bgType"][value="gradient"]');
    if (ct.backgroundType === 'gradient') {
        if (bgTypeGradient) bgTypeGradient.checked = true;
        toggleBgInputs('gradient');
    } else {
        if (bgTypeSolid) bgTypeSolid.checked = true;
        toggleBgInputs('solid');
    }

    if (themeBgSolid) themeBgSolid.value = ct.backgroundSolid || '#ffffff';
    if (themeBgSolidHex) themeBgSolidHex.value = ct.backgroundSolid || '#ffffff';
    if (themeBgGradStart) themeBgGradStart.value = ct.backgroundGradientStart || '#0f1220';
    if (themeBgGradStartHex) themeBgGradStartHex.value = ct.backgroundGradientStart || '#0f1220';
    if (themeBgGradEnd) themeBgGradEnd.value = ct.backgroundGradientEnd || '#060814';
    if (themeBgGradEndHex) themeBgGradEndHex.value = ct.backgroundGradientEnd || '#060814';
    if (themeAccent) themeAccent.value = ct.accent || '#111111';
    if (themeAccentHex) themeAccentHex.value = ct.accent || '#111111';
    if (themeText) themeText.value = ct.text || '#111111';
    if (themeTextHex) themeTextHex.value = ct.text || '#111111';
    if (themeFont) themeFont.value = ct.font || 'Inter';
    if (themeFontSize) themeFontSize.value = ct.fontSize || '16px';
    if (themeCardStyle) {
        themeCardStyle.value = ct.cardStyle || 'flat';
        toggleCardInputs(ct.cardStyle || 'flat');
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

    // Populate profile photo URL
    const profilePhotoUrl = document.getElementById('profilePhotoUrl');
    if (profilePhotoUrl) profilePhotoUrl.value = portfolioState.photo || '';

    // Sync avatar upload view
    const photoArea = document.getElementById('photoUploadArea');
    if (photoArea) {
        if (portfolioState.photo) {
            photoArea.innerHTML = `<img src="${portfolioState.photo}" class="photo-upload-preview">`;
            photoArea.classList.add('has-image');
        } else {
            photoArea.innerHTML = `<div class="photo-upload-placeholder"><i data-lucide="camera" style="width: 24px; height: 24px; color: rgba(255, 255, 255, 0.4); margin-bottom: 8px;"></i><div>Click or drag image here</div></div>`;
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
    // Publish & View Live Button — cinematic loading state
    const btnPublish = document.getElementById('btnPublishPortfolio');
    if (btnPublish) {
        btnPublish.addEventListener('click', () => {
            if (!validateSidebarForm()) {
                showToast('Please fix validation errors before publishing.', 'danger');
                return;
            }

            btnPublish.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite"></i> Publishing...';
            btnPublish.disabled = true;
            btnPublish.style.opacity = '0.7';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                publishToShowcase();
                window.location.href = 'showcase.html';
            }, 900);
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

    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
        fullNameInput.addEventListener('focus', function() {
            // If the name is exactly the seeded user's name or a default placeholder, clear it once on first focus
            let authName = '';
            try {
                const authData = localStorage.getItem('apex_user_data');
                if (authData) authName = JSON.parse(authData).name || '';
            } catch(e){}
            
            if (this.value === authName || this.value === 'Your Name' || this.value === 'Nova Stark') {
                this.value = '';
                portfolioState.name = '';
                savePortfolioData();
                updatePreview();
            }
        });
    }

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

    // Photo upload and profile URL
    const photoInput = document.getElementById('profilePhotoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoUrlInput = document.getElementById('profilePhotoUrl');

    if (photoUrlInput) {
        photoUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            portfolioState.photo = url;
            savePortfolioData();

            // Sync drag-and-drop zone thumbnail
            if (photoUploadArea) {
                if (url) {
                    photoUploadArea.innerHTML = `<img src="${url}" class="photo-upload-preview">`;
                    photoUploadArea.classList.add('has-image');
                } else {
                    photoUploadArea.innerHTML = `<div class="photo-upload-placeholder"><i data-lucide="camera" style="width: 24px; height: 24px; color: rgba(255, 255, 255, 0.4); margin-bottom: 8px;"></i><div>Click or drag image here</div></div>`;
                    photoUploadArea.classList.remove('has-image');
                    if (window.lucide) window.lucide.createIcons();
                }
            }
            updatePreview();
        });
    }

    if (photoUploadArea) {
        photoUploadArea.addEventListener('click', () => {
            photoInput?.click();
        });

        photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        });

        photoUploadArea.addEventListener('dragleave', () => {
            photoUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.15)';
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
    // const addCertBtn = document.getElementById('addCertBtn');
    // if (addCertBtn) addCertBtn.addEventListener('click', openCertificationModal);

    // const btnSaveCert = document.getElementById('btnSaveCertification');
    // if (btnSaveCert) btnSaveCert.addEventListener('click', saveCertification);

    // Testimonial triggers
    // const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    // if (addTestimonialBtn) addTestimonialBtn.addEventListener('click', openTestimonialModal);

    // const btnSaveTest = document.getElementById('btnSaveTestimonial');
    // if (btnSaveTest) btnSaveTest.addEventListener('click', saveTestimonial);

    // Theme Customizer event bindings
    const bgTypeRadios = document.querySelectorAll('input[name="bgType"]');
    bgTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            portfolioState.customTheme.backgroundType = val;
            toggleBgInputs(val);
            savePortfolioData();
            updatePreview();
        });
    });

    const themeFontSize = document.getElementById('themeFontSize');
    if (themeFontSize) {
        themeFontSize.addEventListener('change', (e) => {
            portfolioState.customTheme.fontSize = e.target.value;
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

// Handle photo upload with compression to make it fast and smooth
function handlePhotoUpload(file) {
    if (!file.type.match(/image.*/)) {
        showToast('Please select a valid image file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Compress the image using canvas
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

            portfolioState.photo = compressedDataUrl;
            savePortfolioData();

            const photoArea = document.getElementById('photoUploadArea');
            if (photoArea) {
                photoArea.innerHTML = `<img src="${compressedDataUrl}" class="photo-upload-preview">`;
                photoArea.classList.add('has-image');
            }

            const photoUrlInput = document.getElementById('profilePhotoUrl');
            if (photoUrlInput) {
                photoUrlInput.value = compressedDataUrl;
            }

            updatePreview();
        };
        img.src = e.target.result;
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
                    <div class="exp-item-title" style="font-size: 13px;">${exp.title}</div>
                    <div class="exp-item-sub" style="font-size: 12px; margin-top: 2px;">${exp.company}</div>
                    <div class="exp-item-date" style="font-size: 11px; margin-top: 2px;">${formatDateString(exp.startDate)} – ${formatDateString(exp.endDate)}</div>
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
                    <div class="exp-item-title" style="font-size: 13px;">${edu.degree}</div>
                    <div class="exp-item-sub" style="font-size: 12px; margin-top: 2px;">${edu.school}</div>
                    <div class="exp-item-date" style="font-size: 11px; margin-top: 2px;">${formatDateString(edu.startDate)} – ${formatDateString(edu.endDate)}</div>
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
                    <div class="exp-item-title" style="font-size: 13px;">${project.title}</div>
                    <div class="exp-item-sub" style="font-size: 11px; margin-top: 2px;">${project.description.substring(0, 45)}...</div>
                    <div class="exp-item-date" style="font-size: 10px; font-family: var(--font-mono); margin-top: 2px;">${(project.tags || []).join(', ')}</div>
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
                    <div class="exp-item-title" style="font-size: 13px;">${cert.title}</div>
                    <div class="exp-item-sub" style="font-size: 12px; margin-top: 2px;">${cert.issuer} (${cert.date})</div>
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
                    <div class="exp-item-title" style="font-size: 13px;">${test.name}</div>
                    <div class="exp-item-sub" style="font-size: 11px; margin-top: 2px;">${test.quote.substring(0, 45)}...</div>
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
    const ids = ['expTitle', 'expCompany', 'expStartDate', 'expEndDate'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.closest('.form-group')?.classList.remove('invalid');
        }
    });
}
export function saveExperience() {
    const titleEl = document.getElementById('expTitle');
    const companyEl = document.getElementById('expCompany');
    const startDateEl = document.getElementById('expStartDate');
    const endDateEl = document.getElementById('expEndDate');

    const title = titleEl.value.trim();
    const company = companyEl.value.trim();
    const startDate = startDateEl.value.trim();
    const endDate = endDateEl.value.trim();

    let modalValid = true;

    // Validate Job Title
    if (!title) {
        titleEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        titleEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate Company Name
    if (!company) {
        companyEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        companyEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate Start Date
    if (!startDate) {
        startDateEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        startDateEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate End Date > Start Date
    if (startDate && endDate) {
        if (new Date(startDate) >= new Date(endDate)) {
            endDateEl.closest('.form-group').classList.add('invalid');
            const errorEl = endDateEl.closest('.form-group').querySelector('.error-msg');
            if (errorEl) errorEl.textContent = 'Must be after Start Date.';
            modalValid = false;
        } else {
            endDateEl.closest('.form-group').classList.remove('invalid');
        }
    } else {
        endDateEl.closest('.form-group').classList.remove('invalid');
    }

    if (!modalValid) {
        return;
    }

    portfolioState.experience.push({ title, company, startDate, endDate: endDate || 'Present' });
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
    const ids = ['eduSchool', 'eduDegree', 'eduStartDate', 'eduEndDate'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.closest('.form-group')?.classList.remove('invalid');
        }
    });
}
export function saveEducation() {
    const schoolEl = document.getElementById('eduSchool');
    const degreeEl = document.getElementById('eduDegree');
    const startDateEl = document.getElementById('eduStartDate');
    const endDateEl = document.getElementById('eduEndDate');

    const school = schoolEl.value.trim();
    const degree = degreeEl.value.trim();
    const startDate = startDateEl.value.trim();
    const endDate = endDateEl.value.trim();

    let modalValid = true;

    // Validate School
    if (!school) {
        schoolEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        schoolEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate Degree
    if (!degree) {
        degreeEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        degreeEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate Start Date
    if (!startDate) {
        startDateEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        startDateEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate End Date > Start Date
    if (startDate && endDate) {
        if (new Date(startDate) >= new Date(endDate)) {
            endDateEl.closest('.form-group').classList.add('invalid');
            const errorEl = endDateEl.closest('.form-group').querySelector('.error-msg');
            if (errorEl) errorEl.textContent = 'Must be after Start Date.';
            modalValid = false;
        } else {
            endDateEl.closest('.form-group').classList.remove('invalid');
        }
    } else {
        endDateEl.closest('.form-group').classList.remove('invalid');
    }

    if (!modalValid) {
        return;
    }

    portfolioState.education.push({ school, degree, startDate, endDate: endDate || 'Present' });
    savePortfolioData();
    renderEducation();
    updatePreview();
    closeEducationModal();
}

// Project Modal actions
export function openProjectModal() { toggleModal('projectModal', 'open'); }
export function closeProjectModal() {
    toggleModal('projectModal', 'close');
    const ids = ['projTitle', 'projDesc', 'projTags', 'projLink'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.closest('.form-group')?.classList.remove('invalid');
        }
    });
    document.getElementById('projStatus').value = 'Featured';
}
export function saveProjectItem() {
    const titleEl = document.getElementById('projTitle');
    const descEl = document.getElementById('projDesc');
    const tagsEl = document.getElementById('projTags');
    const linkEl = document.getElementById('projLink');
    const statusEl = document.getElementById('projStatus');

    const title = titleEl.value.trim();
    const description = descEl.value.trim();
    const tagsVal = tagsEl.value.trim();
    let link = linkEl.value.trim();
    const status = statusEl.value;

    let modalValid = true;

    // Validate Title
    if (!title) {
        titleEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        titleEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate Description
    if (!description) {
        descEl.closest('.form-group').classList.add('invalid');
        modalValid = false;
    } else {
        descEl.closest('.form-group').classList.remove('invalid');
    }

    // Validate URL (if provided)
    if (link) {
        const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-._~:\/?#\[\]@!$&'()*+,;=]*)?$/i;
        if (!urlPattern.test(link)) {
            linkEl.closest('.form-group').classList.add('invalid');
            modalValid = false;
        } else {
            linkEl.closest('.form-group').classList.remove('invalid');
            if (!/^https?:\/\//i.test(link)) {
                link = 'https://' + link;
            }
        }
    } else {
        linkEl.closest('.form-group').classList.remove('invalid');
    }

    if (!modalValid) {
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
// export function openCertificationModal() { toggleModal('certificationModal', 'open'); }
// export function closeCertificationModal() {
//     toggleModal('certificationModal', 'close');
//     document.getElementById('certTitle').value = '';
//     document.getElementById('certIssuer').value = '';
//     document.getElementById('certDate').value = '';
//     document.getElementById('certLink').value = '';
// }
// export function saveCertification() {
//     const title = document.getElementById('certTitle').value.trim();
//     const issuer = document.getElementById('certIssuer').value.trim();
//     const date = document.getElementById('certDate').value.trim();
//     const link = document.getElementById('certLink').value.trim();

//     if (!title || !issuer || !date) {
//         alert('Title, Issuer, and Date are required.');
//         return;
//     }

//     portfolioState.certifications.push({ title, issuer, date, link });
//     savePortfolioData();
//     renderCertifications();
//     updatePreview();
//     closeCertificationModal();
// }

// Testimonial Modal actions
// export function openTestimonialModal() { toggleModal('testimonialModal', 'open'); }
// export function closeTestimonialModal() {
//     toggleModal('testimonialModal', 'close');
//     document.getElementById('testName').value = '';
//     document.getElementById('testRole').value = '';
//     document.getElementById('testQuote').value = '';
// }
// export function saveTestimonial() {
//     const name = document.getElementById('testName').value.trim();
//     const role = document.getElementById('testRole').value.trim();
//     const quote = document.getElementById('testQuote').value.trim();

//     if (!name || !role || !quote) {
//         alert('Name, Title/Company, and Quote are required.');
//         return;
//     }

//     portfolioState.testimonials.push({ name, role, quote });
//     savePortfolioData();
//     renderTestimonials();
//     updatePreview();
//     closeTestimonialModal();
// }

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
    const fontSize = isCustom ? (portfolioState.customTheme.fontSize || '16px') : '16px';
    let accent = isCustom ? portfolioState.customTheme.accent : t.colors.accent;
    let text = isCustom ? portfolioState.customTheme.text : t.colors.text;
    const cardStyle = isCustom ? portfolioState.customTheme.cardStyle : t.cardStyle;

    // Resolve background
    let bgStyle = '';
    const ct = portfolioState.customTheme;
    if (isCustom) {
        if (ct.backgroundType === 'gradient') {
            bgStyle = `linear-gradient(135deg, ${ct.backgroundGradientStart} 0%, ${ct.backgroundGradientEnd} 100%)`;
        } else {
            bgStyle = ct.backgroundSolid;
        }
    } else {
        bgStyle = t.colors.background || '#ffffff';
    }

    // Resolve if background color is light or dark to adapt classes
    const bgSolid = isCustom ? ct.backgroundSolid : t.colors.background;
    const bgGradStart = isCustom ? ct.backgroundGradientStart : t.colors.background;
    const bgType = isCustom ? ct.backgroundType : 'solid';
    const currentBg = bgType === 'solid' ? bgSolid : bgGradStart;
    const isLight = isColorLight(currentBg);

    // Apply data-theme attribute on preview container to sync styles
    const previewContainer = document.querySelector('.portfolio-preview');
    if (previewContainer) {
        previewContainer.setAttribute('data-theme', isLight ? 'light' : 'dark');
    }

    // Auto adapt text and accent color visibility based on theme for presets
    if (!isCustom) {
        if (!isLight) {
            text = '#ffffff';
            if (accent === '#000000' || accent === '#000' || accent === '#111111' || accent === '#111' || accent === '#dc2626') {
                accent = '#ffffff';
            }
        } else {
            text = '#111111';
            if (accent === '#ffffff' || accent === '#fff' || accent === '#eaeaea') {
                accent = '#000000';
            }
        }
    }

    const isGlass = cardStyle === 'glassmorphism';
    const isGlow = cardStyle === 'glow';

    const blur = isCustom ? ct.blurIntensity : '15px';
    const borderOp = isCustom ? ct.borderOpacity : '0.08';

    let cardBg = '';
    let cardBorder = '';
    let cardShadow = '';

    if (isGlass) {
        cardBg = isLight ? `rgba(0,0,0,0.025)` : `rgba(255,255,255,0.045)`;
        cardBorder = `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, ' + borderOp + ')'}`;
        cardShadow = 'none';
    } else if (isGlow) {
        cardBg = isLight ? '#ffffff' : '#0f1220';
        cardBorder = `1px solid ${accent}44`;
        cardShadow = `0 10px 30px ${accent}12, 0 0 20px ${accent}04`;
    } else if (cardStyle === 'shadow') {
        cardBg = isLight ? '#ffffff' : '#111322';
        cardBorder = isLight ? '1px solid #e5e7eb' : '1px solid #1e293b';
        cardShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)';
    } else {
        // Flat
        cardBg = isLight ? '#f9fafb' : '#0e101f';
        cardBorder = isLight ? '1px solid #e5e7eb' : '1px solid #1a1d35';
        cardShadow = 'none';
    }

    styleTag.innerHTML = `
        .portfolio-preview {
            font-family: "${font}", var(--font-sans) !important;
            font-size: ${fontSize} !important;
            background: ${bgStyle} !important;
            color: ${text} !important;
            transition: background 0.2s, color 0.2s;
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
            color: ${isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255, 255, 255, 0.75)'} !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-location-badge {
            color: ${accent}dd !important;
            border: 1px solid ${accent}25 !important;
            background: ${accent}0a !important;
        }

        .portfolio-preview .preview-about {
            color: ${isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.85)'} !important;
            font-family: "${font}", var(--font-sans) !important;
        }

        .portfolio-preview .preview-section-title {
            color: ${text} !important;
            border-bottom: 2.5px dashed ${accent}25 !important;
            font-family: "${font}", var(--font-sans) !important;
            margin-bottom: 20px;
        }

        .portfolio-preview .preview-section-container {
            background: ${cardBg} !important;
            border: ${cardBorder} !important;
            box-shadow: ${cardShadow} !important;
            backdrop-filter: blur(${blur}) !important;
            -webkit-backdrop-filter: blur(${blur}) !important;
            border-radius: 14px;
            margin-bottom: 24px;
            padding: 32px !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .portfolio-preview .preview-skill {
            background: ${isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)'} !important;
            color: ${text} !important;
            border: 1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'} !important;
            font-family: var(--font-mono) !important;
        }

        .portfolio-preview .preview-experience-item {
            background: ${isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.035)'} !important;
            border: 1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'} !important;
            box-shadow: ${isLight ? '0 8px 32px 0 rgba(31, 38, 135, 0.04)' : '0 8px 32px 0 rgba(0, 0, 0, 0.2)'} !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 14px;
            color: ${text} !important;
            display: flex;
            gap: 16px;
            align-items: center;
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
            color: ${isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)'} !important;
            font-family: var(--font-mono) !important;
        }

        .portfolio-preview .preview-photo {
            border: 3.5px solid ${accent} !important;
        }

        .portfolio-preview .social-anchor {
            color: ${isLight ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)'} !important;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }

        .portfolio-preview .social-anchor:hover {
            color: ${accent} !important;
        }

        .portfolio-preview .form-input,
        .portfolio-preview .form-textarea {
            background: ${isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'} !important;
            border: 1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'} !important;
            color: ${text} !important;
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
                const hasPhoto = !!portfolioState.photo;
                photoSection.style.display = (vis.photo && hasPhoto) ? 'block' : 'none';
            }
        } else if (container) {
            let hasContent = true;
            if (section === 'skills') {
                hasContent = portfolioState.skills && portfolioState.skills.length > 0;
            } else if (section === 'experience') {
                hasContent = portfolioState.experience && portfolioState.experience.length > 0;
            } else if (section === 'education') {
                hasContent = portfolioState.education && portfolioState.education.length > 0;
            } else if (section === 'projects') {
                hasContent = portfolioState.projects && portfolioState.projects.length > 0;
            } else if (section === 'certifications') {
                hasContent = portfolioState.certifications && portfolioState.certifications.length > 0;
            } else if (section === 'testimonials') {
                hasContent = portfolioState.testimonials && portfolioState.testimonials.length > 0;
            } else if (section === 'about') {
                hasContent = portfolioState.about && portfolioState.about.trim() !== '' &&
                    !portfolioState.about.trim().startsWith('Tell your') &&
                    !portfolioState.about.trim().startsWith('Describe your');
            }
            container.style.display = (vis[section] && hasContent) ? 'block' : 'none';
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

    // Sync the browser URL bar in the frame header
    const urlBar = document.getElementById('browserUrlText');
    if (urlBar && portfolioState.name && portfolioState.name !== 'Your Name') {
        const slug = portfolioState.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        urlBar.textContent = `apex.app/u/${slug}`;
    }


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

    if (window.lucide) {
        window.lucide.createIcons();
    }
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

    const isLight = document.querySelector('.portfolio-preview')?.getAttribute('data-theme') === 'light';
    const isCustom = portfolioState.selectedTemplate === 'custom' || portfolioState.customTheme.backgroundSolid !== '';
    const template = getTemplate(portfolioState.selectedTemplate);
    const fallbackAccent = isLight ? '#111111' : '#ffffff';
    const accent = (isCustom ? portfolioState.customTheme.accent : (template ? template.colors.accent : null)) || fallbackAccent;

    expContainer.innerHTML = portfolioState.experience.map(exp => `
        <div class="preview-experience-item">
            <div class="card-icon-container" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}; color: ${accent}; flex-shrink: 0;">
                <i data-lucide="briefcase" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${exp.title}</div>
                <div class="preview-exp-company" style="font-weight:500; font-size:0.85rem; margin-top: 2px;">${exp.company}</div>
                <div class="preview-exp-period" style="font-size:0.75rem; margin-top: 4px;">${formatDateString(exp.startDate)} – ${formatDateString(exp.endDate)}</div>
            </div>
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

    const isLight = document.querySelector('.portfolio-preview')?.getAttribute('data-theme') === 'light';
    const isCustom = portfolioState.selectedTemplate === 'custom' || portfolioState.customTheme.backgroundSolid !== '';
    const template = getTemplate(portfolioState.selectedTemplate);
    const fallbackAccent = isLight ? '#111111' : '#ffffff';
    const accent = (isCustom ? portfolioState.customTheme.accent : (template ? template.colors.accent : null)) || fallbackAccent;

    eduContainer.innerHTML = portfolioState.education.map(edu => `
        <div class="preview-experience-item">
            <div class="card-icon-container" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}; color: ${accent}; flex-shrink: 0;">
                <i data-lucide="graduation-cap" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${edu.degree}</div>
                <div class="preview-exp-company" style="font-weight:500; font-size:0.85rem; margin-top: 2px;">${edu.school}</div>
                <div class="preview-exp-period" style="font-size:0.75rem; margin-top: 4px;">${formatDateString(edu.startDate)} – ${formatDateString(edu.endDate)}</div>
            </div>
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
        <div class="preview-experience-item" style="align-items: flex-start; cursor: ${project.link ? 'pointer' : 'default'};" ${project.link ? `onclick="window.open('${project.link}', '_blank')"` : ''}>
            <img src="${project.image || 'assets/right2.jpg'}" alt="${project.title}" style="width: 72px; height: 72px; object-fit: cover; border-radius: 8px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.05);">
            <div style="flex: 1; min-width: 0;">
                <div class="preview-exp-title" style="font-weight:600; font-size:1rem;">${project.title}</div>
                <div class="preview-exp-company" style="font-size:0.85rem; margin: 4px 0 8px 0; line-height: 1.4; color: inherit; opacity: 0.85;">${project.description}</div>
                ${project.link ? `<a href="${project.link}" target="_blank" style="font-size:0.75rem; color:inherit; text-decoration:underline; display:inline-block; margin-bottom:8px;" onclick="event.stopPropagation();">View Link &rarr;</a>` : ''}
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                    ${(project.tags || []).map(tag => `<span class="preview-skill" style="font-size:0.7rem; padding:3px 8px;">${tag}</span>`).join('')}
                </div>
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

    const isLight = document.querySelector('.portfolio-preview')?.getAttribute('data-theme') === 'light';
    const isCustom = portfolioState.selectedTemplate === 'custom' || portfolioState.customTheme.backgroundSolid !== '';
    const template = getTemplate(portfolioState.selectedTemplate);
    const fallbackAccent = isLight ? '#111111' : '#ffffff';
    const accent = (isCustom ? portfolioState.customTheme.accent : (template ? template.colors.accent : null)) || fallbackAccent;

    certsContainer.innerHTML = portfolioState.certifications.map(cert => `
        <div class="preview-experience-item">
            <div class="card-icon-container" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}; color: ${accent}; flex-shrink: 0;">
                <i data-lucide="award" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div class="preview-exp-title" style="font-weight:600; font-size:0.95rem;">${cert.title}</div>
                <div class="preview-exp-company" style="font-size:0.85rem; margin-top:2px; color: inherit; opacity: 0.85;">
                    ${cert.issuer} &bull; <span style="font-size:0.75rem; opacity:0.6;">${cert.date}</span>
                </div>
                ${cert.link ? `<a href="${cert.link}" target="_blank" style="font-size:0.75rem; color:inherit; text-decoration:underline; display:inline-block; margin-top:4px;">Verify Credentials &rarr;</a>` : ''}
            </div>
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

    const isLight = document.querySelector('.portfolio-preview')?.getAttribute('data-theme') === 'light';
    const isCustom = portfolioState.selectedTemplate === 'custom' || portfolioState.customTheme.backgroundSolid !== '';
    const template = getTemplate(portfolioState.selectedTemplate);
    const fallbackAccent = isLight ? '#111111' : '#ffffff';
    const accent = (isCustom ? portfolioState.customTheme.accent : (template ? template.colors.accent : null)) || fallbackAccent;

    testimonialsContainer.innerHTML = portfolioState.testimonials.map(test => `
        <div class="preview-experience-item" style="align-items: flex-start;">
            <div class="card-icon-container" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}; color: ${accent}; flex-shrink: 0; margin-top: 2px;">
                <i data-lucide="quote" style="width: 16px; height: 16px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <p style="font-style: italic; font-size: 0.85rem; line-height: 1.5; margin: 0 0 10px 0; color: inherit;">"${test.quote}"</p>
                <div style="font-weight: 600; font-size: 0.85rem; color: inherit;">${test.name}</div>
                <div style="font-size: 0.75rem; opacity: 0.75; margin-top: 1px; color: inherit;">${test.role}</div>
            </div>
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
        <div class="theme-card ${portfolioState.selectedTemplate === 'custom' ? 'selected' : ''}" onclick="window.portfolioBuilder.selectTemplate('custom')">
            <div class="theme-card-preview" style="background: linear-gradient(135deg, #1f1f2e 0%, #111119 100%); color:#dc2626; font-family: monospace;">
                CUSTOM
            </div>
            <div class="theme-card-name">Custom Builder</div>
        </div>
    `;

    templatesContainer.innerHTML = allTemplates.map(template => {
        const isSelected = template.id === portfolioState.selectedTemplate;
        const bg = template.colors.background || '#ffffff';
        const text = template.colors.text || '#111111';
        const accent = template.colors.accent || '#dc2626';

        let cardBg = bg;
        if (template.id === 'glass') {
            cardBg = 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
        } else if (template.id === 'executive') {
            cardBg = 'linear-gradient(135deg, #1e1b4b 0%, #090514 100%)';
        }

        return `
            <div class="theme-card ${isSelected ? 'selected' : ''}" onclick="window.portfolioBuilder.selectTemplate('${template.id}')">
                <div class="theme-card-preview" style="background: ${cardBg}; color: ${text}; font-family: '${template.font}', sans-serif;">
                    <span style="border-bottom: 2px solid ${accent}; padding-bottom: 2px;">Aa</span>
                </div>
                <div class="theme-card-name">${template.name}</div>
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

export function publishToShowcase() {
    // 1. Get creator profile data
    const userData = JSON.parse(localStorage.getItem('apex_user_data') || '{}');
    const userSlug = portfolioState.name ? portfolioState.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'current_user';

    const entry = {
        id: 'creator_user_' + Date.now(),
        username: userSlug,
        name: portfolioState.name || 'Creative Developer',
        avatar: portfolioState.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        role: portfolioState.role || 'Creative Developer',
        bio: portfolioState.about || 'Crafting premium digital experiences.',
        skills: portfolioState.skills.length > 0 ? portfolioState.skills : ['UI Design', 'Frontend'],
        experience: portfolioState.experience,
        education: portfolioState.education,
        projects: portfolioState.projects,
        certifications: portfolioState.certifications,
        testimonials: portfolioState.testimonials,
        socialLinks: portfolioState.socialLinks,
        selectedTemplate: portfolioState.selectedTemplate,
        customTheme: portfolioState.customTheme,
        sectionVisibility: portfolioState.sectionVisibility,
        tagline: portfolioState.tagline,
        location: portfolioState.location,
        email: portfolioState.email,
        phone: portfolioState.phone,
        websiteUrl: portfolioState.websiteUrl,
        followers: 12,
        following: 5,
        stats: { projects: portfolioState.projects.length, likes: 24, sales: 2 }
    };

    // 2. Read existing published portfolios/creators database (fpm_creators)
    let creators = [];
    try {
        creators = JSON.parse(localStorage.getItem('fpm_creators') || '[]');
    } catch (e) {
        creators = [];
    }

    // Prepend user entry (filter out existing custom entries to prevent duplicates)
    creators = creators.filter(c => c.username !== userSlug);
    creators.unshift(entry);

    // Save back to client DB
    localStorage.setItem('fpm_creators', JSON.stringify(creators));

    // Also save apex-portfolio data to ensure persistent builder state
    savePortfolioData();
}

// Export portfolio builder API
export const portfolioBuilder = {
    createNewPortfolio,
    editPortfolio,
    deletePortfolio,
    setCurrentAndNavigate,

    removeSkill,
    removeExperience,
    removeEducation,
    removeProject,
    removeCertification,
    removeTestimonial,
    selectTemplate,
    updateDashboard,
    loadPreset,
    updatePreview,
    publishToShowcase,

    openExperienceModal,
    closeExperienceModal,
    saveExperience,

    openEducationModal,
    closeEducationModal,
    saveEducation,

    openProjectModal,
    closeProjectModal,
    saveProjectItem,

    // openCertificationModal,
    // closeCertificationModal,
    // saveCertification,

    // openTestimonialModal,
    // closeTestimonialModal,
    // saveTestimonial,

    getState: () => portfolioState,
    saveData: savePortfolioData,
    loadData: loadPortfolioData
};

// Make available globally
window.portfolioBuilder = portfolioBuilder;

// Validation helpers & Event setup
function setFieldError(input, message) {
    const group = input.closest('.form-group');
    if (group) {
        group.classList.add('invalid');
        const errorEl = group.querySelector('.error-msg');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }
}

function clearFieldError(input) {
    const group = input.closest('.form-group');
    if (group) {
        group.classList.remove('invalid');
    }
}

function validateField(input) {
    if (!input) return true;
    const value = input.value.trim();
    const id = input.id;
    let isValid = true;
    let errorMsg = '';

    const isValidUrl = (str) => {
        const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-._~:\/?#\[\]@!$&'()*+,;=]*)?$/i;
        return urlPattern.test(str);
    };

    if (id === 'fullName') {
        if (value === '') {
            isValid = false;
            errorMsg = 'Full Name is required.';
        }
    } else if (id === 'role') {
        if (value === '') {
            isValid = false;
            errorMsg = 'Professional Role is required.';
        }
    } else if (id === 'phone') {
        if (value === '') {
            isValid = false;
            errorMsg = 'Phone Number is required.';
        } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(value)) {
            isValid = false;
            errorMsg = 'Please enter a valid phone number.';
        }
    } else if (id === 'email') {
        if (value === '') {
            isValid = false;
            errorMsg = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMsg = 'Please enter a valid email address.';
        }
    } else if (id === 'websiteUrl') {
        if (value !== '' && !isValidUrl(value)) {
            isValid = false;
            errorMsg = 'Please enter a valid URL.';
        }
    } else if (id === 'githubLink') {
        if (value !== '') {
            if (value.includes('/') || value.includes('github.com')) {
                isValid = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9\-]+(\/)?$/i.test(value);
            } else {
                isValid = /^[a-zA-Z0-9\-]{1,39}$/.test(value);
            }
            if (!isValid) {
                errorMsg = 'Please enter a valid GitHub username or URL.';
            }
        }
    } else if (id === 'linkedinLink') {
        if (value !== '') {
            if (value.includes('/') || value.includes('linkedin.com')) {
                isValid = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9\-_]+(\/)?$/i.test(value);
            } else {
                isValid = /^[a-zA-Z0-9\-_]{3,100}$/.test(value);
            }
            if (!isValid) {
                errorMsg = 'Please enter a valid LinkedIn username or URL.';
            }
        }
    } else if (id === 'twitterLink') {
        if (value !== '') {
            if (value.includes('/') || value.includes('twitter.com') || value.includes('x.com')) {
                isValid = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]{1,15}(\/)?$/i.test(value);
            } else {
                isValid = /^[a-zA-Z0-9_]{1,15}$/.test(value);
            }
            if (!isValid) {
                errorMsg = 'Please enter a valid Twitter/X username or URL.';
            }
        }
    }

    if (isValid) {
        clearFieldError(input);
    } else {
        setFieldError(input, errorMsg);
    }

    return isValid;
}

function validateSidebarForm() {
    const fields = [
        'fullName',
        'role',
        'phone',
        'email',
        'websiteUrl',
        'githubLink',
        'linkedinLink',
        'twitterLink'
    ];
    let firstInvalid = null;
    let allValid = true;

    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const isValid = validateField(input);
            if (!isValid) {
                allValid = false;
                if (!firstInvalid) {
                    firstInvalid = input;
                }
            }
        }
    });

    if (!allValid && firstInvalid) {
        const section = firstInvalid.closest('.accordion-section');
        if (section) {
            document.querySelectorAll('.accordion-section').forEach(s => {
                s.classList.remove('open');
            });
            section.classList.add('open');
        }
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            firstInvalid.focus();
        }, 300);
    }

    return allValid;
}

function setupValidationListeners() {
    const fields = [
        'fullName',
        'role',
        'phone',
        'email',
        'websiteUrl',
        'githubLink',
        'linkedinLink',
        'twitterLink'
    ];
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                validateField(input);
            });
            input.addEventListener('blur', () => {
                validateField(input);
            });
        }
    });
}

function formatDateString(dateStr) {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'present') return 'Present';
    
    const parts = dateStr.split('-');
    if (parts.length === 1) {
        return dateStr;
    }
    
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthName = monthNames[monthIndex];
    if (monthName) {
        return `${monthName} ${year}`;
    }
    return dateStr;
}
