// Authentication functions
let currentUser = null;

function login() {
    const userIdInput = document.getElementById('userId');
    if (!userIdInput) return;
    
    const userId = userIdInput.value.trim();
    if (!userId) {
        alert('Please enter your User ID');
        return;
    }
    
    // Mask the password
    userIdInput.value = '********';
    
    // Set current user
    currentUser = userId;
    localStorage.setItem('anime_user', userId);
    
    // Update UI
    const userSpans = document.querySelectorAll('#current-user');
    userSpans.forEach(span => {
        span.textContent = userId;
    });
    
    alert('Logged in successfully as: ' + userId);
    
    // Reload data on current page
    if (typeof loadAnime === 'function') loadAnime();
    if (typeof loadManga === 'function') loadManga();
    if (typeof loadManhwa === 'function') loadManhwa();
    if (typeof loadAllItems === 'function') loadAllItems();
    if (typeof checkDatabaseStatus === 'function') checkDatabaseStatus();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('anime_user');
    
    const userIdInput = document.getElementById('userId');
    if (userIdInput) {
        userIdInput.value = '';
    }
    
    const userSpans = document.querySelectorAll('#current-user');
    userSpans.forEach(span => {
        span.textContent = 'Guest';
    });
    
    alert('Logged out successfully');
    
    // Reload page to clear data
    location.reload();
}

// Initialize user from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('anime_user');
    if (savedUser) {
        currentUser = savedUser;
        const userIdInput = document.getElementById('userId');
        if (userIdInput) {
            userIdInput.value = '********';
        }
        const userSpans = document.querySelectorAll('#current-user');
        userSpans.forEach(span => {
            span.textContent = savedUser;
        });
    }
});

// Make functions global
window.login = login;
window.logout = logout;
window.currentUser = currentUser;