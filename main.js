// Home page functions
let allItems = [];

// Load all items for home page
async function loadAllItems() {
    const user = localStorage.getItem('anime_user');
    if (!user) return;
    
    try {
        const items = await Database.getAllItems();
        allItems = items;
        updateStats();
    } catch (error) {
        console.log('Using local storage for home page');
        // Items are already loaded from localStorage
        updateStats();
    }
}

// Update category counts
function updateCategoryCounts() {
    if (!allItems || allItems.length === 0) {
        allItems = [];
    }
    
    const animeCount = allItems.filter(item => item.type === 'anime').length;
    const mangaCount = allItems.filter(item => item.type === 'manga').length;
    const manhwaCount = allItems.filter(item => item.type === 'manhwa').length;
    
    // Calculate detailed counts
    const animeWatching = allItems.filter(item => 
        item.type === 'anime' && item.status === 'watching'
    ).length;
    const animePlan = allItems.filter(item => 
        item.type === 'anime' && item.status === 'plan'
    ).length;
    const animeDropped = allItems.filter(item => 
        item.type === 'anime' && item.status === 'dropped'
    ).length;
    const animeCompleted = allItems.filter(item => 
        item.type === 'anime' && item.status === 'completed'
    ).length;
    
    const mangaReading = allItems.filter(item => 
        item.type === 'manga' && item.status === 'reading'
    ).length;
    const mangaPlan = allItems.filter(item => 
        item.type === 'manga' && item.status === 'plan'
    ).length;
    const mangaDropped = allItems.filter(item => 
        item.type === 'manga' && item.status === 'dropped'
    ).length;
    const mangaCompleted = allItems.filter(item => 
        item.type === 'manga' && item.status === 'completed'
    ).length;
    
    const manhwaReading = allItems.filter(item => 
        item.type === 'manhwa' && item.status === 'reading'
    ).length;
    const manhwaPlan = allItems.filter(item => 
        item.type === 'manhwa' && item.status === 'plan'
    ).length;
    const manhwaDropped = allItems.filter(item => 
        item.type === 'manhwa' && item.status === 'dropped'
    ).length;
    const manhwaCompleted = allItems.filter(item => 
        item.type === 'manhwa' && item.status === 'completed'
    ).length;
    
    // Update DOM elements
    const elements = {
        'anime-count': animeCount,
        'manga-count': mangaCount,
        'manhwa-count': manhwaCount,
        'anime-watching': animeWatching,
        'anime-plan': animePlan,
        'anime-dropped': animeDropped,
        'anime-completed': animeCompleted,
        'manga-reading': mangaReading,
        'manga-plan': mangaPlan,
        'manga-dropped': mangaDropped,
        'manga-completed': mangaCompleted,
        'manhwa-reading': manhwaReading,
        'manhwa-plan': manhwaPlan,
        'manhwa-dropped': manhwaDropped,
        'manhwa-completed': manhwaCompleted
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Update status overview
    const watchingCount = animeWatching + mangaReading + manhwaReading;
    const planCount = animePlan + mangaPlan + manhwaPlan;
    const droppedCount = animeDropped + mangaDropped + manhwaDropped;
    const completedCount = animeCompleted + mangaCompleted + manhwaCompleted;
    
    document.getElementById('count-watching').textContent = watchingCount;
    document.getElementById('count-plan').textContent = planCount;
    document.getElementById('count-dropped').textContent = droppedCount;
    document.getElementById('count-completed').textContent = completedCount;
}

// Update recent items
function updateRecentItems() {
    const recentList = document.getElementById('recent-list');
    if (!recentList) return;
    
    if (!allItems || allItems.length === 0) {
        recentList.innerHTML = '<p class="empty-message">No items added yet. Start by adding your first title!</p>';
        return;
    }
    
    const recentItems = allItems
        .sort((a, b) => {
            // Sort by ID (timestamp) descending
            return parseInt(b.id) - parseInt(a.id);
        })
        .slice(0, 6);
    
    recentList.innerHTML = recentItems.map(item => `
        <div class="recent-item">
            <div class="recent-header">
                <strong>${item.title || 'Untitled'}</strong>
                <span class="recent-type ${item.type}">
                    ${item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Unknown'}
                </span>
            </div>
            <div class="recent-meta">
                <span class="status-badge badge-${getStatusClass(item.status)}">
                    ${getStatusLabel(item.status)}
                </span>
                <span>${item.episode || 'No progress'}</span>
                <span>${item.rating ? formatRating(item.rating) : 'Not rated'}</span>
            </div>
        </div>
    `).join('');
}

// Get status class for CSS
function getStatusClass(status) {
    switch(status) {
        case 'watching':
        case 'reading':
            return 'watching';
        case 'plan':
            return 'plan';
        case 'dropped':
            return 'dropped';
        case 'completed':
            return 'completed';
        default:
            return 'plan';
    }
}

// Get status label
function getStatusLabel(status) {
    switch(status) {
        case 'watching': return 'Watching';
        case 'reading': return 'Reading';
        case 'plan': return 'Plan';
        case 'dropped': return 'Dropped';
        case 'completed': return 'Completed';
        default: return status || 'Plan';
    }
}

// Format rating
function formatRating(rating) {
    if (!rating || rating === '0' || rating === 0) return 'Not rated';
    return `${parseFloat(rating).toFixed(1)}/10`;
}

// Update all stats
function updateStats() {
    updateCategoryCounts();
    updateRecentItems();
}

// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    // Load saved user
    const savedUser = localStorage.getItem('anime_user');
    if (savedUser) {
        const userIdInput = document.getElementById('userId');
        if (userIdInput) {
            userIdInput.value = '********';
        }
        
        // Load items after a short delay
        setTimeout(() => {
            loadAllItems();
        }, 500);
    }
    
    // Auto-check database status
    setTimeout(checkDatabaseStatus, 1000);
});

// Make functions global
window.loadAllItems = loadAllItems;
window.updateStats = updateStats;
window.formatRating = formatRating;