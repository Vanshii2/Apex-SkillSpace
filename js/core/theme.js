/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - LIGHT/DARK THEME CONTROLLER
   ==========================================================================
*/

const THEME_STORAGE_KEY = 'fpm_theme';

export function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    setTheme(savedTheme);
    
    // Wire up events across pages
    const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(targetTheme);
            if (window.portfolioBuilder && typeof window.portfolioBuilder.updatePreview === 'function') {
                window.portfolioBuilder.updatePreview();
            }
        });
    });
}

export function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    
    // Update theme toggle icons (supporting dual icons for visual premium touch)
    const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
    toggleButtons.forEach(btn => {
        const icon = btn.querySelector('i') || btn;
        if (themeName === 'light') {
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
            btn.setAttribute('aria-label', 'Switch to Dark Mode');
        } else {
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
            btn.setAttribute('aria-label', 'Switch to Light Mode');
        }
    });
}
