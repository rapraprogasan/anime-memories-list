// Loading screen functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Simulate loading time (remove this in production)
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
    
    // Show loading screen when page is about to unload
    window.addEventListener('beforeunload', function() {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    });
});