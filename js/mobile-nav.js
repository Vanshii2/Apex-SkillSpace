/* ==========================================================================
   MOBILE NAVBAR — HAMBURGER TOGGLE
   Add this script at the bottom of your <body>, or inside your index.js
   ========================================================================== */

(function initMobileNav() {
    const navbar = document.getElementById('app-nav');
    if (!navbar) return;

    const navMenu = navbar.querySelector('.nav-menu');
    if (!navMenu) return;

    // Create the hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    // Insert it into .navbar-container just before nav-actions
    const container = navbar.querySelector('.navbar-container');
    const navActions = navbar.querySelector('.nav-actions');
    container.insertBefore(hamburger, navActions);

    // Toggle open/close
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        }
    });
})();