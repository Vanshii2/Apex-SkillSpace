/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - CLIENT DATA STORAGE ENGINE
   Initial seeds and state management utilizing client LocalStorage.
   ==========================================================================
*/

const DB_KEY_PREFIX = 'fpm_';
const DB_SEED_VERSION = 'apex-skillspace-demo-v4';

// --- MOCK INITIAL DATA ---
const MOCK_CREATORS = [
    {
        id: 'creator_1',
        username: 'hyper_arch',
        name: 'Aron Thorne',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        role: 'Creative Frontend Engineer',
        bio: 'Cinematic 3D web experiences and motion architecture. Developing interactive micro-spaces for forward-thinking brands like Lusion and Nike.',
        skills: ['WebGL', 'Three.js', 'Creative Direction', 'GSAP', 'CSS Grid'],
        experience: [
            { title: 'Creative Developer', company: 'Aether Studio', startDate: '2024', endDate: 'Present' },
            { title: 'Frontend Motion Engineer', company: 'Pixel Foundry', startDate: '2022', endDate: '2024' }
        ],
        projects: [
            {
                id: 'hyper_arch_case',
                title: 'Aether Portfolio Experience',
                description: 'A cinematic WebGL portfolio concept with interactive sections, motion-led project storytelling, and recruiter-ready case studies.',
                tags: ['WebGL', 'Three.js', 'GSAP'],
                status: 'Featured',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'hyper-arch', linkedin: 'aron-thorne', twitter: 'hyper_arch' },
        selectedTemplate: 'glass',
        followers: 1240,
        following: 184,
        stats: { projects: 8, likes: 3410, sales: 142 }
    },
    {
        id: 'creator_2',
        username: 'linear_flow',
        name: 'Sarah K.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
        role: 'Design Systems Engineer',
        bio: 'Design systems engineer crafting minimalist UI structures and modular frontend architectures. Obsessed with micro-interactions and typographic grids.',
        skills: ['Sass', 'CSS Variables', 'Vanilla JS', 'SVG Anim', 'Figma'],
        experience: [
            { title: 'Design Systems Engineer', company: 'Linear Labs', startDate: '2023', endDate: 'Present' },
            { title: 'UI Developer', company: 'Gridline Co.', startDate: '2021', endDate: '2023' }
        ],
        projects: [
            {
                id: 'linear_flow_case',
                title: 'MonoGrid Portfolio System',
                description: 'A clean portfolio layout for students and junior developers, focused on readable projects, skill badges, and simple contact links.',
                tags: ['CSS Variables', 'Vanilla JS', 'Figma'],
                status: 'Demo Project',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'linear-flow', linkedin: 'sarah-k-design', twitter: 'linear_flow' },
        selectedTemplate: 'minimal',
        followers: 920,
        following: 245,
        stats: { projects: 5, likes: 2180, sales: 89 }
    },
    {
        id: 'creator_3',
        username: 'nothing_core',
        name: 'Marcus V.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        banner: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80',
        role: 'Hardware UI Specialist',
        bio: 'Developing visual design components resembling raw physical product hardware. Minimalist, transparent aesthetics, high contrast dot-matrix setups.',
        skills: ['Custom Elements', 'SVG Filters', 'CSS Houdini', 'Accessibility'],
        experience: [
            { title: 'Interface Engineer', company: 'Nothing Core Lab', startDate: '2022', endDate: 'Present' },
            { title: 'Accessibility Developer', company: 'Open Interface', startDate: '2020', endDate: '2022' }
        ],
        projects: [
            {
                id: 'nothing_core_case',
                title: 'Accessible Hardware-Inspired Portfolio',
                description: 'A portfolio demo with stark contrast, clear typography, accessible sections, and product-style project cards.',
                tags: ['Accessibility', 'SVG Filters', 'Custom Elements'],
                status: 'Case Study',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'nothing-core', linkedin: 'marcus-v-interface', twitter: 'nothing_core' },
        selectedTemplate: 'developer',
        followers: 1850,
        following: 92,
        stats: { projects: 12, likes: 5890, sales: 312 }
    }
];
const MOCK_PROJECTS = [
    {
        id: 'proj_1',
        title: 'AI Face Recognition Project',
        description: 'This sophisticated software uses artificial intelligence algorithms to quickly and accurately detect and identify faces within photos or live video feeds.',
        seller: 'hyper_arch',
        price: 349.00,
        tags: ['AI', 'Python', 'Security'],
        status: 'Featured',
        likes: 550,
        bookmarks: 200,
        views: 3200,
        image: 'assets/project1.png',
        demoUrl: 'https://designx-ai-project.vercel.app',
        liveDemo: 'https://designx-ai-project.vercel.app',
        github: '#'
    },
    {
        id: 'proj_2',
        title: 'Heart Disease Tracking',
        description: 'A helpful digital tool designed to let users easily log and track important heart health indicators like blood pressure and heart rate over time.',
        seller: 'nothing_core',
        price: 149.00,
        tags: ['Health', 'Dashboard'],
        status: 'Trending',
        likes: 489,
        bookmarks: 128,
        views: 2310,
        image: 'assets/project2.png',
        demoUrl: 'https://designx-demo-dashboard.vercel.app',
        liveDemo: 'https://designx-demo-dashboard.vercel.app',
        github: '#'
    },
    {
        id: 'proj_3',
        title: 'Expense Tracker',
        description: 'This user-friendly application makes it simple to keep a close watch on your spending habits by easily logging every single purchase you make.',
        seller: 'linear_flow',
        price: 49.00,
        tags: ['Finance', 'Web App'],
        status: 'Active',
        likes: 245,
        bookmarks: 72,
        views: 980,
        image: 'assets/project6.png',
        demoUrl: 'https://designx-analytics.vercel.app',
        liveDemo: 'https://designx-analytics.vercel.app',
        github: '#'
    },
    {
        id: 'proj_4',
        title: 'Nutrition Website',
        description: 'An informative website created to assist you in planning healthy meals and learning important facts about nutrition and maintaining a balanced, well-rounded diet.',
        seller: 'hyper_arch',
        price: 79.00,
        tags: ['Wellness', 'Website'],
        status: 'Active',
        likes: 198,
        bookmarks: 41,
        views: 740,
        image: 'assets/project4.png',
        demoUrl: 'https://designx-minimalist.vercel.app',
        liveDemo: 'https://designx-minimalist.vercel.app',
        github: '#'
    },
    {
        id: 'proj_5',
        title: 'Entertainment Website',
        description: 'A fun online destination that allows you to easily search for and discover a vast array of movies and TV shows to enjoy watching.',
        seller: 'linear_flow',
        price: 129.00,
        tags: ['Cinematic', 'Movies'],
        status: 'Featured',
        likes: 310,
        bookmarks: 92,
        views: 1450,
        image: 'assets/project5.png',
        demoUrl: 'https://designx-editorial.framer.website',
        liveDemo: 'https://designx-editorial.framer.website',
        github: '#'
    },
    {
        id: 'proj_6',
        title: 'Live Streaming Website',
        description: 'This platform enables users to effortlessly create and host their own live video broadcasts or explore and watch live streams from other creators in real-time.',
        seller: 'hyper_arch',
        price: 249.00,
        tags: ['Video', 'Streaming'],
        status: 'Active',
        likes: 120,
        bookmarks: 45,
        views: 890,
        image: 'assets/project1.jpeg',
        demoUrl: 'https://designx-premium-landing.webflow.io',
        liveDemo: 'https://designx-premium-landing.webflow.io',
        github: '#'
    },
    {
        id: 'proj_7',
        title: 'Resume Building Website',
        description: 'A professional website offering multiple intuitive templates that guide you through the process of creating a high-quality resume to impress potential employers.',
        seller: 'linear_flow',
        price: 29.00,
        tags: ['Career', 'Design'],
        status: 'Trending',
        likes: 340,
        bookmarks: 110,
        views: 1560,
        image: 'assets/project8.png',
        demoUrl: 'https://designx-uikit-preview.vercel.app',
        liveDemo: 'https://designx-uikit-preview.vercel.app',
        github: '#'
    },
    {
        id: 'proj_8',
        title: 'Shoe Mark Recognition',
        description: 'This innovative tool leverages advanced artificial intelligence technology to quickly analyze and identify specific patterns from shoe print marks in an efficient manner.',
        seller: 'nothing_core',
        price: 199.00,
        tags: ['AI', 'Python'],
        status: 'Featured',
        likes: 420,
        bookmarks: 180,
        views: 2800,
        image: 'assets/project3.png',
        demoUrl: 'https://designx-motion-kit.framer.website',
        liveDemo: 'https://designx-motion-kit.framer.website',
        github: '#'
    },
    {
        id: 'proj_9',
        title: 'Make Presentation AI Tool',
        description: 'An intelligent presentation tool that automatically generates complete slide shows and content, significantly reducing the time and effort needed to create professional presentations.',
        seller: 'hyper_arch',
        price: 99.00,
        tags: ['AI', 'Presentations'],
        status: 'Featured',
        likes: 312,
        bookmarks: 84,
        views: 1240,
        image: 'assets/project9.png',
        demoUrl: 'https://designx-ai-project.vercel.app',
        liveDemo: 'https://designx-ai-project.vercel.app',
        github: '#'
    },
    {
        id: 'proj_10',
        title: 'Analytics Dashboard Pro',
        description: 'A sleek, data-rich analytics dashboard template with real-time chart components, KPI cards, and dark/light mode support. Perfect for SaaS and enterprise apps.',
        seller: 'nothing_core',
        price: 299.00,
        tags: ['Dashboard', 'Analytics'],
        status: 'Featured',
        likes: 620,
        bookmarks: 240,
        views: 4100,
        image: 'assets/project2.png',
        demoUrl: 'https://designx-demo-dashboard.vercel.app',
        liveDemo: 'https://designx-demo-dashboard.vercel.app',
        github: '#'
    },
    {
        id: 'proj_11',
        title: 'UI Component Kit',
        description: 'A comprehensive set of 60+ hand-crafted UI components — buttons, modals, cards, inputs — delivered as pure HTML/CSS/JS, ready to drop into any project.',
        seller: 'linear_flow',
        price: 19.00,
        tags: ['UI Kit', 'Components'],
        status: 'Active',
        likes: 180,
        bookmarks: 55,
        views: 760,
        image: 'assets/project4.png',
        demoUrl: 'https://designx-uikit-preview.vercel.app',
        liveDemo: 'https://designx-uikit-preview.vercel.app',
        github: '#'
    },
    {
        id: 'proj_12',
        title: 'Premium Landing Page System',
        description: 'A full landing page design system with hero sections, testimonials, pricing grids, and CTAs. Optimized for conversion and built with clean semantic HTML.',
        seller: 'hyper_arch',
        price: 399.00,
        tags: ['Landing Page', 'Premium'],
        status: 'Featured',
        likes: 710,
        bookmarks: 310,
        views: 5200,
        image: 'assets/project5.png',
        demoUrl: 'https://designx-premium-landing.webflow.io',
        liveDemo: 'https://designx-premium-landing.webflow.io',
        github: '#'
    }
];



const MOCK_NOTIFICATIONS = [
    { id: 'notif_1', text: 'Welcome to your futuristic dashboard. Get started by exploring the Shop.', time: 'Just now', unread: true },
    { id: 'notif_2', text: 'Your project Chronos has been added to Marcus\'s wishlist.', time: '2 hours ago', unread: true },
    { id: 'notif_3', text: 'Your streak is currently active! Visit daily to build your contribution heatmap.', time: '1 day ago', unread: false }
];

// --- SEED ENGINE ---
export function initDB() {
    if (!localStorage.getItem(DB_KEY_PREFIX + 'initialized') || localStorage.getItem(DB_KEY_PREFIX + 'seed_version') !== DB_SEED_VERSION) {
        localStorage.setItem(DB_KEY_PREFIX + 'creators', JSON.stringify(MOCK_CREATORS));
        localStorage.setItem(DB_KEY_PREFIX + 'projects', JSON.stringify(MOCK_PROJECTS));
        localStorage.setItem(DB_KEY_PREFIX + 'notifications', JSON.stringify(MOCK_NOTIFICATIONS));
        localStorage.setItem(DB_KEY_PREFIX + 'cart', JSON.stringify([]));
        localStorage.setItem(DB_KEY_PREFIX + 'wishlist', JSON.stringify([]));
        localStorage.setItem(DB_KEY_PREFIX + 'bookmarked', JSON.stringify([]));
        localStorage.setItem(DB_KEY_PREFIX + 'liked', JSON.stringify([]));
        localStorage.setItem(DB_KEY_PREFIX + 'following', JSON.stringify([]));

        // Seed active user session
        const activeUser = {
            username: 'apex_user',
            name: 'Nova Stark',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            bio: 'Creative design engineer, assembling future-proof digital spaces and experimental UI templates using HTML, CSS, and clean JS logic.',
            skills: ['Vanilla JS', 'Sleek CSS', 'SVG Graphics', 'Aesthetics'],
            followers: 48,
            following: 12,
            stats: { projects: 1, likes: 142, sales: 8 },
            streak: 5,
            profileProgress: 85
        };
        localStorage.setItem(DB_KEY_PREFIX + 'user_session', JSON.stringify(activeUser));
        localStorage.setItem('apex_user_data', JSON.stringify({
            name: 'Nova Stark',
            email: 'nova@stark.com',
            password: 'password123'
        }));

        // Seed 365-day activity records (past year visit logs to fill heatmap immediately!)
        const activityLog = [];
        const today = new Date();
        // Seed around 120 active entries over the past 365 days
        for (let i = 0; i < 365; i++) {
            const tempDate = new Date(today);
            tempDate.setDate(today.getDate() - i);

            // Randomly seed visits based on date spacing (more visits recently)
            const probability = i < 30 ? 0.75 : (i < 90 ? 0.45 : 0.2);
            if (Math.random() < probability) {
                const contributions = Math.floor(Math.random() * 8) + 1; // 1 to 8 actions
                const dateString = tempDate.toISOString().split('T')[0];
                activityLog.push({ date: dateString, count: contributions });
            }
        }
        localStorage.setItem(DB_KEY_PREFIX + 'activity_log', JSON.stringify(activityLog));

        localStorage.setItem(DB_KEY_PREFIX + 'initialized', 'true');
        localStorage.setItem(DB_KEY_PREFIX + 'seed_version', DB_SEED_VERSION);
        console.log('Futuristic Data Engine Initialized successfully.');
    }
}

// --- DATABASE HELPER FUNCTIONS ---
function getData(key) {
    return JSON.parse(localStorage.getItem(DB_KEY_PREFIX + key)) || [];
}

function setData(key, val) {
    localStorage.setItem(DB_KEY_PREFIX + key, JSON.stringify(val));
}

/* Projects Table */
export function getProjects() {
    return getData('projects');
}

export function saveProject(project) {
    const projects = getProjects();
    // Inject defaults
    const newProj = {
        id: 'proj_' + Date.now(),
        likes: 0,
        bookmarks: 0,
        views: 1,
        liveDemo: '#',
        github: '#',
        status: 'New',
        ...project
    };
    projects.unshift(newProj);
    setData('projects', projects);

    // Log user upload activity
    logActivity(3); // Upload yields 3 contributions

    // Increment active user projects counter
    const user = getCurrentUser();
    user.stats.projects += 1;
    updateCurrentUser(user);

    return newProj;
}

export function getProjectById(id) {
    return getProjects().find(p => p.id === id);
}

/* Liked / Starred States */
export function getLiked() {
    return getData('liked');
}

export function likeProject(id) {
    const liked = getLiked();
    const idx = liked.indexOf(id);
    const projects = getProjects();
    const p = projects.find(item => item.id === id);

    let isLikedNow = false;
    if (idx === -1) {
        liked.push(id);
        if (p) p.likes += 1;
        logActivity(1); // Liking yields 1 contribution
        isLikedNow = true;
    } else {
        liked.splice(idx, 1);
        if (p) p.likes = Math.max(0, p.likes - 1);
    }

    setData('liked', liked);
    setData('projects', projects);
    return { isLiked: isLikedNow, count: p ? p.likes : 0 };
}

/* Bookmark States */
export function getBookmarked() {
    return getData('bookmarked');
}

export function bookmarkProject(id) {
    const bookmarked = getBookmarked();
    const idx = bookmarked.indexOf(id);
    const projects = getProjects();
    const p = projects.find(item => item.id === id);

    let isBookmarked = false;
    if (idx === -1) {
        bookmarked.push(id);
        if (p) p.bookmarks += 1;
        logActivity(1);
        isBookmarked = true;
    } else {
        bookmarked.splice(idx, 1);
        if (p) p.bookmarks = Math.max(0, p.bookmarks - 1);
    }

    setData('bookmarked', bookmarked);
    setData('projects', projects);
    return { isBookmarked, count: p ? p.bookmarks : 0 };
}

/* Creators Table */
export function getCreators() {
    return getData('creators');
}

export function getCreatorByUsername(username) {
    return getCreators().find(c => c.username === username);
}

export function getFollowing() {
    return getData('following');
}

export function toggleFollowCreator(id) {
    const following = getFollowing();
    const idx = following.indexOf(id);
    const creators = getCreators();
    const c = creators.find(item => item.id === id);

    let isFollowing = false;
    if (idx === -1) {
        following.push(id);
        if (c) c.followers += 1;
        logActivity(2); // Follow is 2 points
        isFollowing = true;
    } else {
        following.splice(idx, 1);
        if (c) c.followers = Math.max(0, c.followers - 1);
    }

    setData('following', following);
    setData('creators', creators);

    // Update user session following count
    const session = getCurrentUser();
    session.following = following.length;
    updateCurrentUser(session);

    return { isFollowing, count: c ? c.followers : 0 };
}

/* User Session */
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_KEY_PREFIX + 'user_session'));
}

export function updateCurrentUser(userData) {
    localStorage.setItem(DB_KEY_PREFIX + 'user_session', JSON.stringify(userData));
}

/* Shopping Cart Matrix */
export function getCart() {
    return getData('cart');
}

export function addToCart(id) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'login.html';
        return null;
    }
    const cart = getCart();
    if (!cart.includes(id)) {
        cart.push(id);
        setData('cart', cart);
        logActivity(1);
        return true;
    }
    return false;
}

export function removeFromCart(id) {
    const cart = getCart();
    const idx = cart.indexOf(id);
    if (idx !== -1) {
        cart.splice(idx, 1);
        setData('cart', cart);
        return true;
    }
    return false;
}

export function clearCart() {
    setData('cart', []);
}

/* Wishlist Matrix */
export function getWishlist() {
    return getData('wishlist');
}

export function addToWishlist(id) {
    const wishlist = getWishlist();
    if (!wishlist.includes(id)) {
        wishlist.push(id);
        setData('wishlist', wishlist);
        logActivity(1);
        return true;
    }
    return false;
}

export function removeFromWishlist(id) {
    const wishlist = getWishlist();
    const idx = wishlist.indexOf(id);
    if (idx !== -1) {
        wishlist.splice(idx, 1);
        setData('wishlist', wishlist);
        return true;
    }
    return false;
}

/* Notifications Drawer */
export function getNotifications() {
    return getData('notifications');
}

export function addNotification(text) {
    const notifications = getNotifications();
    notifications.unshift({
        id: 'notif_' + Date.now(),
        text,
        time: 'Just now',
        unread: true
    });
    setData('notifications', notifications);
    return notifications;
}

export function markNotificationsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.unread = false);
    setData('notifications', notifications);
}

/* LeetCode Contribution Log */
export function getActivityLog() {
    return getData('activity_log');
}

export function logActivity(weight = 1) {
    const log = getActivityLog();
    const todayStr = new Date().toISOString().split('T')[0];

    const idx = log.findIndex(item => item.date === todayStr);
    if (idx !== -1) {
        log[idx].count += weight;
    } else {
        log.push({ date: todayStr, count: weight });

        // Check / Update daily streak!
        const user = getCurrentUser();
        if (user) {
            user.streak = (user.streak || 0) + 1;
            updateCurrentUser(user);
        }
    }
    setData('activity_log', log);
}
