/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - CLIENT DATA STORAGE ENGINE
   Initial seeds and state management utilizing client LocalStorage.
   ==========================================================================
*/

import { PROJECTS, CREATORS, NOTIFICATIONS } from './data.js';
const DB_KEY_PREFIX = 'fpm_';
const DB_SEED_VERSION = 'apex-skillspace-demo-v7';








// --- SEED ENGINE ---
export function initDB() {
    if (localStorage.getItem(DB_KEY_PREFIX + 'seed_version') !== DB_SEED_VERSION) {
        localStorage.setItem(DB_KEY_PREFIX + 'projects', JSON.stringify(PROJECTS));
        localStorage.setItem(DB_KEY_PREFIX + 'creators', JSON.stringify(CREATORS));
        localStorage.setItem(DB_KEY_PREFIX + 'notifications', JSON.stringify(NOTIFICATIONS));
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
