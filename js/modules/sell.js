/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - CREATOR SELL INTERACTION
   Monages drag-and-drop thumbnail conversions, tag collectors,
   and immediate visual preview card rendering. Writes uploads to DB.
   ==========================================================================
*/

import { saveProject } from './db.js';
import { showToast } from '../core/global.js';

export function initSellPage() {
    const form = document.getElementById('sell-upload-form');
    const titleInput = document.getElementById('sell-title');
    const descInput = document.getElementById('sell-desc');
    const priceInput = document.getElementById('sell-price');
    const statusSelect = document.getElementById('sell-status');
    
    // Tag system nodes
    const tagInput = document.getElementById('sell-tag-input');
    const tagsBox = document.getElementById('sell-tags-container');
    
    // Dropzone nodes
    const dropzone = document.getElementById('sell-dropzone');
    const fileInput = document.getElementById('sell-file');
    
    // Live Preview elements
    const prevTitle = document.getElementById('prev-title');
    const prevDesc = document.getElementById('prev-desc');
    const prevPrice = document.getElementById('prev-price');
    const prevStatus = document.getElementById('prev-status');
    const prevTags = document.getElementById('prev-tags');
    const prevImg = document.getElementById('prev-img');

    if (!form || !titleInput || !descInput || !priceInput || !prevTitle) return;

    let state = {
        title: '',
        desc: '',
        price: 39.00,
        status: 'Active',
        tags: ['Vanilla JS'],
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    };

    // --- 1. Dynamic WYSIWYG Preview Render ---
    const updatePreview = () => {
        prevTitle.textContent = state.title || 'Untitled Space Asset';
        prevDesc.textContent = state.desc || 'Short description summarizing WebGL components, layout matrices, and motion effects.';
        prevPrice.textContent = `$${parseFloat(state.price || 0).toFixed(2)}`;
        
        prevStatus.textContent = state.status;
        prevStatus.className = `badge ${state.status === 'Featured' ? 'badge-primary' : 'badge-outline'}`;
        
        prevTags.innerHTML = state.tags.map(t => `<span class="badge badge-outline" style="font-size:0.6rem;">${t}</span>`).join('');
        prevImg.src = state.image;
    };

    // Form typings change listeners
    titleInput.addEventListener('input', (e) => {
        state.title = e.target.value;
        updatePreview();
    });

    descInput.addEventListener('input', (e) => {
        state.desc = e.target.value;
        updatePreview();
    });

    priceInput.addEventListener('input', (e) => {
        state.price = e.target.value ? parseFloat(e.target.value) : 0;
        updatePreview();
    });

    statusSelect.addEventListener('change', (e) => {
        state.status = e.target.value;
        updatePreview();
    });

    // --- 2. Interactive Tag Aggregator Logic ---
    const renderTags = () => {
        // Render inside uploader form tagsBox
        tagsBox.innerHTML = state.tags.map((t, idx) => `
            <span class="tag-pill">
                ${t}
                <span class="tag-pill-remove clickable" data-idx="${idx}">✕</span>
            </span>
        `).join('') + `<input type="text" class="tag-adder-input" id="sell-tag-input" placeholder="Type tag + Enter">`;
        
        // Re-focus tag input
        const newTagInput = document.getElementById('sell-tag-input');
        newTagInput.focus();
        
        // Listen to additions
        newTagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tagVal = newTagInput.value.trim().replace(/,/g, '');
                if (tagVal && !state.tags.includes(tagVal)) {
                    state.tags.push(tagVal);
                    renderTags();
                    updatePreview();
                }
                newTagInput.value = '';
            }
        });
        
        // Listen to removals
        tagsBox.querySelectorAll('.tag-pill-remove').forEach(rm => {
            rm.addEventListener('click', () => {
                const idx = parseInt(rm.dataset.idx);
                state.tags.splice(idx, 1);
                renderTags();
                updatePreview();
            });
        });
    };
    
    // Bind initial keydown to static tag input
    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tagVal = tagInput.value.trim().replace(/,/g, '');
                if (tagVal && !state.tags.includes(tagVal)) {
                    state.tags.push(tagVal);
                    renderTags();
                    updatePreview();
                }
                tagInput.value = '';
            }
        });
    }

    // --- 3. Drag and Drop Image Base64 Converter ---
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                processImageFile(file);
            } else {
                showToast('Please upload a valid image file thumbnail.', 'danger');
            }
        });
        
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) processImageFile(file);
        });
    }
    
    const processImageFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.image = e.target.result;
            updatePreview();
            
            // Render small preview within dropzone
            dropzone.innerHTML = `
                <img src="${state.image}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;">
                <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Image Loaded Successfully. Click to replace.</p>
            `;
            showToast('Thumbnail thumbnail loaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    };

    // --- 4. Submit listing payload to Database ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!state.title.trim()) {
            showToast('Please specify a project showcase title.', 'warning');
            return;
        }
        if (!state.desc.trim()) {
            showToast('Please describe the capabilities of your project.', 'warning');
            return;
        }
        
        const payload = {
            title: state.title,
            description: state.desc,
            price: state.price,
            status: state.status,
            tags: state.tags,
            image: state.image,
            seller: 'nexus_user' // Active session user
        };
        
        saveProject(payload);
        showToast('Premium project asset published to Nexus successfully!', 'success');
        
        // Direct back to shop to view listed project shortly
        setTimeout(() => {
            const overlay = document.querySelector('.page-transition-overlay');
            if (overlay) {
                overlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 300);
            } else {
                window.location.href = 'shop.html';
            }
        }, 1500);
    });

    // Initial setup
    updatePreview();
}
