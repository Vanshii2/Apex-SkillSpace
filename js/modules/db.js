/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - CLIENT DATA STORAGE ENGINE
   Initial seeds and state management utilizing client LocalStorage.
   ==========================================================================
*/

const DB_KEY_PREFIX = 'fpm_';

// --- MOCK INITIAL DATA ---
const MOCK_CREATORS = [
    {
        id: 'creator_1',
        username: 'hyper_arch',
        name: 'Aron Thorne',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        bio: 'Cinematic 3D web experiences and motion architecture. Developing interactive micro-spaces for forward-thinking brands like Lusion and Nike.',
        skills: ['WebGL', 'Three.js', 'Creative Direction', 'GSAP', 'CSS Grid'],
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
        bio: 'Design systems engineer crafting minimalist UI structures and modular frontend architectures. Obsessed with micro-interactions and typographic grids.',
        skills: ['Sass', 'CSS Variables', 'Vanilla JS', 'SVG Anim', 'Figma'],
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
        bio: 'Developing visual design components resembling raw physical product hardware. Minimalist, transparent aesthetics, high contrast dot-matrix setups.',
        skills: ['Custom Elements', 'SVG Filters', 'CSS Houdini', 'Accessibility'],
        followers: 1850,
        following: 92,
        stats: { projects: 12, likes: 5890, sales: 312 }
    }
];

const MOCK_PROJECTS = [
    {
        id: 'proj_1',
        title: 'Aether: Immersive 3D Space Showcase',
        description: 'An interactive 3D portfolio showcase built entirely in WebGL and native CSS Variables. Incorporates full mouse-spotlight effects, sound micro-interactions, responsive typography, and extremely clean modular HTML layouts. Designed for creators wanting a high-end personal portal.',
        seller: 'hyper_arch',
        price: 49.00,
        tags: ['Three.js', 'WebGL', 'Premium', 'Cinematic'],
        status: 'Active',
        likes: 312,
        bookmarks: 84,
        views: 1240,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        liveDemo: '#',
        github: '#'
    },
    {
        id: 'proj_2',
        title: 'MonoMatrix: Dot-Matrix UI Kit',
        description: 'A structural typographic UI kit inspired by Nothing Tech physical design aesthetics. Built with pure HTML, standard CSS variables, responsive spacing matrices, custom audio effects, custom range sliders, and dynamic light/dark grids. Clean, lightweight, and Adobe EDS friendly.',
        seller: 'nothing_core',
        price: 29.00,
        tags: ['UI Kit', 'Vanilla JS', 'Typography', 'Minimalist'],
        status: 'Trending',
        likes: 489,
        bookmarks: 128,
        views: 2310,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        liveDemo: '#',
        github: '#'
    },
    {
        id: 'proj_3',
        title: 'Chronos: Linear Dashboard Interface',
        description: 'A dark dashboard layout mimicking premium software tools like Linear and Vercel. Contains highly performant activity charts rendered directly as inline SVGs via JavaScript, streak trackers, customized table grids, achievements badge grids, and an functional command palette drawer.',
        seller: 'linear_flow',
        price: 79.00,
        tags: ['Dashboard', 'SVG Charts', 'Modular', 'System'],
        status: 'Active',
        likes: 245,
        bookmarks: 72,
        views: 980,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        liveDemo: '#',
        github: '#'
    },
    {
        id: 'proj_4',
        title: 'Lusion-Glow: Shader Hover Effects',
        description: 'A bundle of premium mouse cursor spotlight tracking and image hover animations. High performance, uses no canvas triggers, relies on CSS variables updating offset coordinates, and fits seamlessly onto ordinary image panels. Easy to customize and convert to standard blocks.',
        seller: 'hyper_arch',
        price: 19.00,
        tags: ['Hover FX', 'Spotlight', 'Interactive', 'CSS'],
        status: 'Active',
        likes: 198,
        bookmarks: 41,
        views: 740,
        image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
        liveDemo: '#',
        github: '#'
    },
    {
        id: 'proj_5',
        title: 'Aesop-Grid: Editorial Blog Grid',
        description: 'Minimalist editorial display grids with elegant asymmetric spacing. High-contrast typography matching Aesop layouts, beautiful Merriweather headings, lazy-loaded visual blocks, scroll-progress bars, custom sidebars, and premium responsive breakpoints. Fully optimized for text readabilities.',
        seller: 'linear_flow',
        price: 39.00,
        tags: ['Editorial', 'CSS Grid', 'Typography', 'Aesthetic'],
        status: 'Featured',
        likes: 310,
        bookmarks: 92,
        views: 1450,
        image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80',
        liveDemo: '#',
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
    if (!localStorage.getItem(DB_KEY_PREFIX + 'initialized')) {
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
            username: 'nexus_user',
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
