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
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

export function loginUser(email, password) {
    const storedData = localStorage.getItem(USER_DATA_KEY);
    
    if (!storedData) {
        return { success: false, message: 'No account found. Please sign up.' };
    }
    
    try {
        const user = JSON.parse(storedData);
        if (user.email === email && user.password === password) {
            localStorage.setItem(IS_LOGGED_IN_KEY, 'true');
            window.location.href = 'dashboard.html';
            return { success: true };
        } else {
            return { success: false, message: 'Invalid email or password.' };
        }
    } catch (e) {
        return { success: false, message: 'Error reading account data.' };
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
        window.location.href = 'dashboard.html';
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
