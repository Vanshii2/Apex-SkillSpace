/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - NAVIGATION & OVERLAYS INTERACTION
   Manages navbar states, floating actions dock, cmd palette, and notifications.
   ==========================================================================
*/

import { getProjects, getNotifications, markNotificationsRead, addNotification } from '../modules/db.js';
import { setTheme } from './theme.js';
import { showToast } from './global.js';

// --- 1. Dynamic Navbar scroll state handler ---
export function initNavbarScroll() {

    const navbar =
        document.querySelector('.navbar');

    if (!navbar) return;

    function handleScroll() {

        const currentPath =
            window.location.pathname
                .split('/')
                .pop();

        const forceScrolled =

            currentPath === 'portfolio.html' ||

            currentPath === 'profile.html';

        if (forceScrolled) {

            navbar.classList.add('scrolled');

            return;
        }

        navbar.classList.toggle(
            'scrolled',
            window.scrollY > 20
        );
    }

    window.addEventListener(
        'scroll',
        handleScroll
    );

    handleScroll();
}

// --- 2. Floating Dock Visibility & Active states ---
export function initFloatingDock() {
    const dockContainer = document.querySelector('.floating-dock-container');
    if (!dockContainer) return;

    // Smooth fade-in shortly after load
    setTimeout(() => {
        dockContainer.classList.add('visible');
    }, 800);

    // Highlight active dock item matching current URL
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- 3. Notification Dropdown Toggle ---
export function initNotifications() {
    const bellBtn = document.getElementById('nav-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (!bellBtn || !dropdown) return;

    const bellDot = bellBtn.querySelector('.notification-dot');

    // Dynamic bell dot toggler based on unread counts
    const updateBellState = () => {
        const notifs = getNotifications();
        const unreadCount = notifs.filter(n => n.unread).length;
        if (unreadCount > 0) {
            if (!bellDot) {
                const dot = document.createElement('span');
                dot.className = 'notification-dot';
                bellBtn.appendChild(dot);
            }
        } else if (bellDot) {
            bellDot.remove();
        }
    };

    const renderNotificationsList = () => {
        const notifs = getNotifications();
        const listContainer = dropdown.querySelector('.notification-list');
        if (!listContainer) return;

        if (notifs.length === 0) {
            listContainer.innerHTML = `<li class="notification-item" style="text-align:center;color:var(--text-muted);">No notifications</li>`;
            return;
        }

        listContainer.innerHTML = notifs.map(notif => `
            <li class="notification-item ${notif.unread ? 'unread' : ''}">
                <p style="font-size:0.85rem;color:var(--text-primary);">${notif.text}</p>
                <span class="notification-time">${notif.time}</span>
            </li>
        `).join('');
    };

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('show');

        // Close other dropdowns
        document.querySelectorAll('.notification-dropdown').forEach(d => d.classList.remove('show'));

        if (!isOpen) {
            renderNotificationsList();
            dropdown.classList.add('show');
            // Mark all read on opening
            markNotificationsRead();
            updateBellState();
        } else {
            dropdown.classList.remove('show');
        }
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    updateBellState();
}

// --- 4. High-Fidelity Command Palette overlay & searching logic ---
export function initCommandPalette() {
    const cmdOverlay = document.getElementById('cmd-palette');
    const searchBtn = document.getElementById('nav-search');
    const cmdInput = document.getElementById('cmd-input');
    const resultsList = document.getElementById('cmd-results');

    if (!cmdOverlay || !cmdInput || !resultsList) return;

    const openPalette = () => {
        cmdOverlay.classList.add('show');
        cmdInput.value = '';
        renderCommandPaletteDefaults();
        setTimeout(() => cmdInput.focus(), 150);
    };

    const closePalette = () => {
        cmdOverlay.classList.remove('show');
    };

    // Toggle via button click
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openPalette();
        });
    }

    // Close overlay triggers
    cmdOverlay.addEventListener('click', (e) => {
        if (e.target === cmdOverlay) closePalette();
    });

    // Global Keyboard Shortcuts (Cmd+K or Ctrl+K)
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const isOpen = cmdOverlay.classList.contains('show');
            if (isOpen) closePalette(); else openPalette();
        }
        if (e.key === 'Escape') {
            closePalette();
        }
    });

    // Live typing query filter
    cmdInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length === 0) {
            renderCommandPaletteDefaults();
            return;
        }

        performGlobalSearch(query);
    });

    // Default commands rendering
    const renderCommandPaletteDefaults = () => {
        resultsList.innerHTML = `
            <div class="cmd-group-title">Navigation Quick Commands</div>
            <li class="cmd-item" data-action="nav" data-href="index.html">
                <span>Go to Home Page</span>
                <span class="cmd-shortcut">⏎</span>
            </li>
            <li class="cmd-item" data-action="nav" data-href="marketplace.html">
                <span>Go to Shop Marketplace</span>
                <span class="cmd-shortcut">⏎</span>
            </li>
            <li class="cmd-item" data-action="nav" data-href="sell.html">
                <span>Go to Sell Dashboard</span>
                <span class="cmd-shortcut">⏎</span>
            </li>
            <li class="cmd-item" data-action="nav" data-href="portfolio.html">
                <span>Go to Portfolio Builder</span>
                <span class="cmd-shortcut">⏎</span>
            </li>
            <li class="cmd-item" data-action="nav" data-href="profile.html">
                <span>Go to Profile Page</span>
                <span class="cmd-shortcut">⏎</span>
            </li>
            
            <div class="cmd-group-title">Theme Controls</div>
            <li class="cmd-item" data-action="theme" data-theme="dark">
                <span>Set Theme to Cinematic Dark</span>
                <span class="cmd-shortcut">☾</span>
            </li>
            <li class="cmd-item" data-action="theme" data-theme="light">
                <span>Set Theme to Apple Minimal Light</span>
                <span class="cmd-shortcut">☀</span>
            </li>

            <div class="cmd-group-title">System Actions</div>
            <li class="cmd-item" data-action="clear-db">
                <span style="color:var(--danger)">Reset Local Storage State</span>
                <span class="cmd-shortcut">✕</span>
            </li>
        `;

        bindResultItemListeners();
    };

    // Global Search indexing project titles and tags
    const performGlobalSearch = (query) => {
        const projects = getProjects();
        const matches = projects.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.tags.some(t => t.toLowerCase().includes(query)) ||
            p.seller.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            resultsList.innerHTML = `<div class="cmd-group-title" style="text-align:center;padding:24px 0;text-transform:none;">No matching projects found</div>`;
            return;
        }

        resultsList.innerHTML = `
            <div class="cmd-group-title">Matching Digital Products (${matches.length})</div>
            ${matches.map(m => `
                <li class="cmd-item" data-action="nav" data-href="marketplace.html?search=${encodeURIComponent(m.title)}">
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <span style="color:var(--text-primary);font-weight:500;">${m.title}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">by @${m.seller} • $${m.price.toFixed(2)}</span>
                    </div>
                    <span class="badge badge-primary">${m.tags[0] || 'Asset'}</span>
                </li>
            `).join('')}
        `;

        bindResultItemListeners();
    };

    // Bind click handlers to search outputs
    const bindResultItemListeners = () => {
        const items = resultsList.querySelectorAll('.cmd-item');
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;

                if (action === 'nav') {
                    const href = item.dataset.href;
                    closePalette();
                    // Optional smooth transition support
                    const transitionOverlay = document.querySelector('.page-transition-overlay');
                    if (transitionOverlay) {
                        transitionOverlay.classList.add('active');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 300);
                    } else {
                        window.location.href = href;
                    }
                } else if (action === 'theme') {
                    const theme = item.dataset.theme;
                    setTheme(theme);
                    showToast(`Interface set to ${theme} mode`, 'success');
                    closePalette();
                } else if (action === 'clear-db') {
                    if (confirm('Clear all local projects and state resets? This will reload the page.')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }
            });

            // Mouse track highlight
            item.addEventListener('mouseenter', () => {
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    };
}
