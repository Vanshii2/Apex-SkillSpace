/*
   ==========================================================================
   FRONTEND AUTHENTICATION MVP
   Provides basic localStorage-based authentication for the Portfolio Builder.
   ==========================================================================
*/

// Mock Database in LocalStorage
const USERS_DB_KEY = 'apex_users';
const CURRENT_USER_KEY = 'apex_current_user';

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
}

function saveUsers(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

export function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email is already registered.' };
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // MVP: plaintext password. DO NOT USE IN PRODUCTION.
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login after registration
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
}

export function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password.' };
}

export function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'index.html';
}

export function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Global hook for easy debugging / manual trigger
window.apexAuth = {
    logout: logoutUser,
    getCurrentUser
};
