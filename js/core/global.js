/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - GLOBAL HIGHER-FIDELITY INTERACTIONS
   Manages custom cursors, spotlight trackers, lazy loading, toasts, 
   gravitational particle physics, and instant preloaded SPA page routing.
   ==========================================================================
 */

// --- 1. Custom Cursor Coordinator ---
export function initCustomCursor() {
    // Disabled cleanly to restore standard browser mouse pointer as requested
}

// --- 2. Spotlight Mouse Glow Tracking ---
export function initSpotlightCards() {
    const applySpotlightListeners = () => {
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            if (card.dataset.spotlightBound) return;
            card.dataset.spotlightBound = 'true';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    };

    applySpotlightListeners();
    const observer = new MutationObserver(applySpotlightListeners);
    observer.observe(document.body, { childList: true, subtree: true });
}

// --- 3. Scroll Progress Indicator ---
export function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = scrolled + '%';
    });
}

// --- 4. Centralized Toast Notification System ---
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Choose nice minimal symbols based on type
    let iconChar = '✦';
    if (type === 'success') iconChar = '✓';
    if (type === 'warning') iconChar = '!';
    if (type === 'danger') iconChar = '✕';

    toast.innerHTML = `
        <span class="toast-icon">${iconChar}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Animation triggers
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Autoclose after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// --- 5. Lazy Loaded Interactive Sections (Intersection Observer) ---
export function initLazyLoadSections() {
    const sections = document.querySelectorAll('.lazy-section, .spotlight-card, .featured-creators, .trending-projects');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                // Optional: remove observer to keep states loaded
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(16px)';
        sec.style.transition = 'opacity var(--transition-slow), transform var(--transition-slow)';

        // Custom dynamic stylesheet injector for loaded items
        const sheet = document.styleSheets[0] || document.head.appendChild(document.createElement('style')).sheet;
        try {
            sheet.insertRule('.section-visible { opacity: 1 !important; transform: translateY(0) !important; }', 0);
        } catch (e) { }

        observer.observe(sec);
    });
}

// --- Helper to update layout active highlights globally ---
export function updateLayoutActiveStates() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Update Navbar Scrolled Class State immediately to prevent FOUC / flashes
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const forceScrolled = currentPath === 'portfolio.html' || currentPath === 'profile.html' || document.querySelector('.portfolio-builder-container') || document.querySelector('.profile-banner-container');
        if (forceScrolled) {
            navbar.classList.add('scrolled');
        } else if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Update Navbar Links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Floating Dock Items
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
        const href = item.getAttribute('href') || '';
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- 6. HTML5 Canvas Antigravity Particle Simulation (Specks Mouse Physics) ---
export function initAntigravityParticles() {
    const canvas = document.getElementById('hero-particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    // Clear previous simulation run if any exists (helps in hot hydration / SPA swap)
    if (window.antigravityCleanup) {
        window.antigravityCleanup();
    }

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const numParticles = 120;
    let mouse = { x: null, y: null, active: false };

    // Initialize particle states
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * (canvas.width / window.devicePixelRatio),
            y: Math.random() * (canvas.height / window.devicePixelRatio),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.6, // cinematic tiny specks
            colorType: Math.random() < 0.4 ? 'primary' : (Math.random() < 0.75 ? 'accent' : 'white'),
            alpha: Math.random() * 0.4 + 0.3,
            baseAlpha: Math.random() * 0.4 + 0.3
        });
    }

    // Dynamic HSL/RGB mappings mapping to luxury neon gradients vs dark slate specks
    function getParticleColors() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        if (isDark) {
            return {
                primary: '192, 132, 252',  // glowing violet #c084fc
                accent: '244, 114, 182',   // glowing rose #f472b6
                white: '255, 255, 255'
            };
        } else {
            return {
                primary: '99, 102, 241',   // indigo
                accent: '236, 72, 153',    // pink
                white: '15, 23, 42'        // pure black/slate
            };
        }
    }

    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    };

    const handleMouseLeave = () => {
        mouse.active = false;
    };

    const heroSection = canvas.closest('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mousemove', handleMouseMove);
        heroSection.addEventListener('mouseleave', handleMouseLeave);
    }

    function animate() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

        // Slightly transparent erase creates stunning premium movement trails!
        ctx.fillStyle = isDark ? 'rgba(6, 6, 8, 0.2)' : 'rgba(250, 250, 250, 0.2)';
        ctx.fillRect(0, 0, width, height);

        const colors = getParticleColors();

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 350) {
                    const force = (350 - dist) / 350;
                    const gravityStrength = 0.08 * force;

                    // Pull towards mouse coordinates (gravitational pull)
                    p.vx += (dx / dist) * gravityStrength;
                    p.vy += (dy / dist) * gravityStrength;

                    // Add Perpendicular orbital swirl velocity vectors
                    const orbitDir = p.colorType === 'primary' ? 1 : -1;
                    const orbitStrength = 0.05 * force * orbitDir;
                    p.vx += (-dy / dist) * orbitStrength;
                    p.vy += (dx / dist) * orbitStrength;

                    // Enliven alpha values on mouse proximity
                    p.alpha = Math.min(1, p.baseAlpha + (1 - dist / 350) * 0.45);
                } else {
                    p.alpha = p.alpha * 0.96 + p.baseAlpha * 0.04;
                }
            } else {
                p.alpha = p.alpha * 0.96 + p.baseAlpha * 0.04;
            }

            // Apply friction/drag limit to terminal velocities
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Apply subtle drift forces so particles feel alive without mouse input
            p.vx += (Math.random() - 0.5) * 0.015;
            p.vy += (Math.random() - 0.5) * 0.015;

            p.x += p.vx;
            p.y += p.vy;

            // Boundary wrapping
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Render
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

            const rgbStr = colors[p.colorType] || colors.white;
            ctx.fillStyle = `rgba(${rgbStr}, ${p.alpha})`;

            // Add custom neon shadows for primary/accent elements in dark mode
            if (isDark && p.colorType !== 'white') {
                ctx.shadowBlur = 4;
                ctx.shadowColor = `rgba(${rgbStr}, ${p.alpha})`;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Attach teardown hook onto the window to cleanly unbind on SPA dynamic loads
    const cleanup = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('resize', resizeCanvas);
        if (heroSection) {
            heroSection.removeEventListener('mousemove', handleMouseMove);
            heroSection.removeEventListener('mouseleave', handleMouseLeave);
        }
    };
    window.antigravityCleanup = cleanup;
}

// --- 7. Smooth Page Transition System (Instant In-Memory Preloaded SPA Router) ---
export function initPageTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) overlay.style.display = 'none'; // Completely bypassed for zero flashes!

    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    // Cache to hold preloaded page shells in-memory
    const pageCache = {};
    const pagesToPreload = [
        'index.html',
        'login.html',
        'signup.html',
        'portfolio.html',
        '404.html'
    ];

    // Normalize paths to look up shells consistently (e.g. "/" or "/shop.html?cat=3" -> "shop.html")
    const getNormalizedPath = (url) => {
        try {
            const absoluteUrl = new URL(url, window.location.origin);
            let path = absoluteUrl.pathname.split('/').pop() || 'index.html';
            if (path === '') path = 'index.html';
            return path;
        } catch (e) {
            return url;
        }
    };

    // Preload internal pages at startup to ensure 0ms network latency on swaps
    pagesToPreload.forEach(page => {
        fetch(page + '?_t=' + Date.now())
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const content = doc.getElementById('app-content');
                if (content) {
                    const key = getNormalizedPath(page);
                    // Extract link stylesheets from parsed page head
                    const stylesheets = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]')).map(link => link.getAttribute('href')).filter(Boolean);

                    pageCache[key] = {
                        title: doc.title,
                        contentHtml: content.innerHTML,
                        stylesheets: stylesheets
                    };

                    // Pre-inject page stylesheets in background so they are fully loaded and parsed before swap!
                    const currentLinks = document.querySelectorAll('head link[rel="stylesheet"]');
                    const currentHrefs = Array.from(currentLinks).map(link => link.getAttribute('href'));
                    stylesheets.forEach(href => {
                        if (!currentHrefs.includes(href)) {
                            const newLink = document.createElement('link');
                            newLink.rel = 'stylesheet';
                            newLink.href = href;
                            document.head.appendChild(newLink);
                        }
                    });
                }
            })
            .catch(err => {
                console.warn(`[SPA] Preload shell cache failed for ${page}:`, err);
            });
    });

    // Central dynamic navigator swap controller
    const navigateTo = (url, pushToHistory = true) => {
        const key = getNormalizedPath(url);
        
        // Gate profile.html and portfolio.html for unlogged-in users
        if (key === 'profile.html' || key === 'portfolio.html') {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
        }

        const cachedPage = pageCache[key];

        // 1. Fade out current content smoothly
        appContent.classList.add('spa-fade-out');

        setTimeout(() => {
            if (cachedPage) {
                // INSTANT IN-MEMORY SWAP: Zero network latency!
                document.title = cachedPage.title;
                appContent.innerHTML = cachedPage.contentHtml;

                // Dynamically inject stylesheets from cache
                if (cachedPage.stylesheets) {
                    const currentLinks = document.querySelectorAll('head link[rel="stylesheet"]');
                    const currentHrefs = Array.from(currentLinks).map(link => link.getAttribute('href'));

                    cachedPage.stylesheets.forEach(href => {
                        if (!currentHrefs.includes(href)) {
                            const newLink = document.createElement('link');
                            newLink.rel = 'stylesheet';
                            newLink.href = href;
                            document.head.appendChild(newLink);
                        }
                    });
                }

                // Reset scroll coordinates immediately
                window.scrollTo({ top: 0, behavior: 'instant' });

                // Fade in new content smoothly
                requestAnimationFrame(() => {
                    appContent.classList.remove('spa-fade-out');
                });

                // Push dynamic history state
                if (pushToHistory) {
                    window.history.pushState({}, '', url);
                }

                // Update layout indicators and run hydrating controllers
                updateLayoutActiveStates();
                if (window.detectPageAndLoadModule) {
                    window.detectPageAndLoadModule();
                }
            } else {
                // FALLBACK: If page not preloaded, fetch dynamically or hard load
                fetch(url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now())
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to load dynamic shell');
                        return res.text();
                    })
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const content = doc.getElementById('app-content');

                        if (!content) {
                            window.location.href = url;
                            return;
                        }

                        // Extract link stylesheets
                        const stylesheets = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]')).map(link => link.getAttribute('href')).filter(Boolean);

                        // Store dynamically retrieved shell
                        pageCache[key] = {
                            title: doc.title,
                            contentHtml: content.innerHTML,
                            stylesheets: stylesheets
                        };

                        // Dynamically inject stylesheets
                        const currentLinks = document.querySelectorAll('head link[rel="stylesheet"]');
                        const currentHrefs = Array.from(currentLinks).map(link => link.getAttribute('href'));

                        stylesheets.forEach(href => {
                            if (!currentHrefs.includes(href)) {
                                const newLink = document.createElement('link');
                                newLink.rel = 'stylesheet';
                                newLink.href = href;
                                document.head.appendChild(newLink);
                            }
                        });

                        document.title = doc.title;
                        appContent.innerHTML = content.innerHTML;

                        window.scrollTo({ top: 0, behavior: 'instant' });

                        requestAnimationFrame(() => {
                            appContent.classList.remove('spa-fade-out');
                        });

                        if (pushToHistory) {
                            window.history.pushState({}, '', url);
                        }

                        updateLayoutActiveStates();
                        if (window.detectPageAndLoadModule) {
                            window.detectPageAndLoadModule();
                        }
                    })
                    .catch(err => {
                        console.error('[SPA] Network dynamic swap failure, falling back:', err);
                        window.location.href = url;
                    });
            }
        }, 220); // Syncs with 0.22s CSS swap animation
    };

    // Intercept clicks to route them locally via History SPA
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Route bypass checks: external links, anchors, void actions, email/tel, target="_blank", or explicitly excluded classes
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href === 'javascript:void(0)' || link.getAttribute('target') === '_blank' || link.classList.contains('no-transition')) {
            return;
        }

        // Auth gate check for profile.html and portfolio.html
        const normalizedHref = href.split('?')[0].split('/').pop();
        if (normalizedHref === 'profile.html' || normalizedHref === 'portfolio.html') {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                e.preventDefault();
                window.location.href = 'login.html';
                return;
            }
        }

        e.preventDefault();
        navigateTo(href);
    });

    // Handle back/forward events seamlessly
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname + window.location.search, false);
    });
}

// --- 8. Dynamic High-Performance Typewriter Effect ---
export function initTypewriter() {
    const container = document.querySelector('#typewriter-hero .typewriter-text');
    const cursor = document.querySelector('.hero-cursor-line');
    if (!container || !cursor) return;

    // Use <br> for the line break requested
    const textHtml = "Build a Portfolio That Helps You<br>Get Hired and Grow";
    
    // Convert to nodes. Wrap text characters in hidden spans. Keep <br> as is.
    container.innerHTML = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textHtml;
    
    const chars = [];
    
    // We will build the content inside container
    Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.style.opacity = '0';
                span.innerHTML = char === ' ' ? '&nbsp;' : char;
                container.appendChild(span);
                chars.push(span);
            }
        } else if (node.nodeName === 'BR') {
            const br = document.createElement('br');
            container.appendChild(br);
            // We can treat BR as an instant char, or just skip it
            chars.push(br);
        }
    });

    // Move cursor to start of container
    if (chars.length > 0) {
        container.insertBefore(cursor, chars[0]);
    } else {
        container.appendChild(cursor);
    }

    let index = 0;

    // Reset hidden state on launch
    const elementsToReveal = document.querySelectorAll('.fade-in-up-delay, .fade-in-up-delay-2, .fade-in-up-delay-3');
    elementsToReveal.forEach(el => el.classList.remove('revealed'));

    if (window.typewriterInterval) {
        clearInterval(window.typewriterInterval);
    }

    window.typewriterInterval = setInterval(() => {
        if (index < chars.length) {
            const el = chars[index];
            if (el.nodeName === 'SPAN') {
                el.style.opacity = '1';
            }
            // Move cursor to AFTER the current element
            if (el.nextSibling) {
                container.insertBefore(cursor, el.nextSibling);
            } else {
                container.appendChild(cursor);
            }
            index++;
        } else {
            clearInterval(window.typewriterInterval);
            elementsToReveal.forEach(el => el.classList.add('revealed'));
        }
    }, 40);
}
