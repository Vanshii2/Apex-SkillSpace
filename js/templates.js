/*
   APEX SKILLSPACE - TEMPLATES MANAGER
   Template loading and switching system
*/

export const templates = {};

export async function loadTemplates() {
    const templateIds = ['minimal', 'business', 'executive', 'developer', 'glass', 'founder', 'beige_combo', 'floral_elegance'];
    
    for (const templateId of templateIds) {
        try {
            const response = await fetch(`templates/${templateId}.json`);
            templates[templateId] = await response.json();
        } catch (error) {
            console.error(`Failed to load template: ${templateId}`, error);
        }
    }
    
    return templates;
}

export function getTemplate(templateId) {
    return templates[templateId] || null;
}

export function getAllTemplates() {
    return Object.values(templates);
}

export function applyTemplate(templateId, portfolioData) {
    const template = getTemplate(templateId);
    if (!template) return;

    // Update preview with template styling
    const preview = document.querySelector('.portfolio-preview');
    if (preview) {
        preview.style.fontFamily = `${template.font}, sans-serif`;
        preview.style.backgroundColor = template.colors.background;
        preview.style.color = template.colors.text;
    }

    // Update visible sections based on template
    updateVisibleSections(template.sections);
    
    return template;
}

function updateVisibleSections(sections) {
    const previewContainer = document.querySelector('.preview-section');
    
    for (const [section, visible] of Object.entries(sections)) {
        const element = previewContainer?.querySelector(`[data-section="${section}"]`);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    }
}
