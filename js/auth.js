/*
   ==========================================================================
   PREMIUM AUTHENTICATION MODULE (LocalStorage)
   ==========================================================================
*/

const USER_DATA_KEY = 'apex_user_data';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

export function registerUser(name, email, password) {
    const userData = {
        name: name,
        email: email,
        password: password
    };
    
    // Save to localStorage
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(IS_LOGGED_IN_KEY, 'true');

    // Derive username from name (lowercase, no spaces)
    const username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Build the profile user object and write it so profile.js reads the real name
    const profileUser = {
        name: name,
        username: username,
        bio: '',
        avatar: '',
        skills: [],
        followers: 0,
        availability: 'Available for Work'
    };
    localStorage.setItem('dx_user', JSON.stringify(profileUser));
    // Also keep fpm_user_session in sync (used by db.js session)
    localStorage.setItem('fpm_user_session', JSON.stringify({
        username: username,
        name: name,
        avatar: '',
        bio: '',
        skills: [],
        followers: 0,
        following: 0,
        stats: { projects: 0, likes: 0, sales: 0 },
        streak: 0,
        profileProgress: 20
    }));

    // Redirect to showcase page
    window.location.href = 'showcase.html';
}

export function loginUser(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    const storedData = localStorage.getItem(USER_DATA_KEY);
    
    if (!storedData) {
        return { success: false, message: 'No account found. Please sign up first.' };
    }
    
    try {
        const user = JSON.parse(storedData);
        const storedEmail = (user.email || '').trim().toLowerCase();
        const storedPassword = (user.password || '').trim();

        if (storedEmail === trimmedEmail && storedPassword === trimmedPassword) {
            localStorage.setItem(IS_LOGGED_IN_KEY, 'true');

            // Sync dx_user with the stored name on every login (ensures profile shows real name)
            const existingDxUser = localStorage.getItem('dx_user');
            if (!existingDxUser || existingDxUser === 'null') {
                const username = user.name
                    ? user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                    : 'user';
                const profileUser = {
                    name: user.name || 'User',
                    username: username,
                    bio: '',
                    avatar: '',
                    skills: [],
                    followers: 0,
                    availability: 'Available for Work'
                };
                localStorage.setItem('dx_user', JSON.stringify(profileUser));
            } else {
                // Update name if it changed
                try {
                    const dxUser = JSON.parse(existingDxUser);
                    if (dxUser.name !== user.name && user.name) {
                        dxUser.name = user.name;
                        localStorage.setItem('dx_user', JSON.stringify(dxUser));
                    }
                } catch (_) { /* ignore parse errors */ }
            }

            window.location.href = 'showcase.html';
            return { success: true };
        } else {
            // Give specific hints
            if (storedEmail !== trimmedEmail) {
                return { success: false, message: 'No account found with that email address.' };
            }
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
    } catch (e) {
        return { success: false, message: 'Error reading account data. Please try signing up again.' };
    }
}

export function logoutUser() {
    localStorage.removeItem(IS_LOGGED_IN_KEY);
    window.location.href = 'login.html';
}

export function requireAuth() {
    const isLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

export function redirectIfLoggedIn() {
    const isLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
    if (isLoggedIn) {
        window.location.href = 'showcase.html';
    }
}

export function getCurrentUser() {
    const storedData = localStorage.getItem(USER_DATA_KEY);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Ensure these are globally accessible if needed for inline handlers
window.apexAuth = {
    logout: logoutUser,
    requireAuth,
    redirectIfLoggedIn,
    getCurrentUser
};
