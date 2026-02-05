// Anime-specific JavaScript
let animeItems = [];

// Load anime from database
async function loadAnime() {
    const user = localStorage.getItem('anime_user');
    if (!user) {
        document.getElementById('no-anime').style.display = 'block';
        document.getElementById('anime-grid').innerHTML = '';
        return;
    }
    
    try {
        const items = await Database.getAllItems('anime');
        animeItems = items;
        displayAnime(animeItems);
        updateAnimeCounts(animeItems);
    } catch (error) {
        console.log('Error loading anime:', error);
        animeItems = [];
        displayAnime([]);
        updateAnimeCounts([]);
    }
}

// Display anime items
function displayAnime(items) {
    const grid = document.getElementById('anime-grid');
    const noItems = document.getElementById('no-anime');
    
    if (!items || items.length === 0) {
        grid.innerHTML = '';
        noItems.style.display = 'block';
        return;
    }
    
    noItems.style.display = 'none';
    
    grid.innerHTML = items.map(item => {
        const imageUrl = item.image_url || 'https://via.placeholder.com/350x200/667eea/ffffff?text=Anime+Cover';
        const hasLink = item.link && item.link.startsWith('http');
        const onClick = hasLink ? `window.open('${item.link}', '_blank')` : '';
        const cursorStyle = hasLink ? 'pointer' : 'default';
        
        return `
        <div class="item-card" data-status="${item.status || 'plan'}">
            <div class="item-image">
                <img src="${imageUrl}" 
                     alt="${item.title || 'Untitled'}"
                     onclick="${onClick}"
                     style="cursor: ${cursorStyle}">
                <span class="item-status status-${item.status || 'plan'}">
                    ${getStatusLabel(item.status)}
                </span>
            </div>
            
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title || 'Untitled'}</h3>
                    <span class="item-rating">${formatAnimeRating(item.rating)}</span>
                </div>
                
                <div class="item-meta">
                    <span class="item-episode">Episodes: ${item.episode || 'N/A'}</span>
                </div>
                
                ${item.video_url ? `
                <div class="youtube-container">
                    <iframe src="${getYouTubeEmbedUrl(item.video_url)}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
                ` : ''}
                
                ${item.notes ? `
                <div class="item-notes">
                    <strong>Notes:</strong> ${item.notes}
                </div>
                ` : ''}
                
                <div class="item-actions">
                    <button class="btn-edit" onclick="editAnime('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteAnime('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Get YouTube embed URL
function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

// Get status label
function getStatusLabel(status) {
    switch(status) {
        case 'watching': return 'Watching';
        case 'plan': return 'Plan to Watch';
        case 'dropped': return 'Dropped';
        case 'completed': return 'Completed';
        default: return 'Plan to Watch';
    }
}

// Filter anime by status
function filterAnime(status) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (status === 'all') {
        displayAnime(animeItems);
    } else {
        const filtered = animeItems.filter(item => item.status === status);
        displayAnime(filtered);
    }
}

// Update anime counts
function updateAnimeCounts(items) {
    const total = items.length;
    const watching = items.filter(item => item.status === 'watching').length;
    const dropped = items.filter(item => item.status === 'dropped').length;
    const plan = items.filter(item => item.status === 'plan').length;
    const completed = items.filter(item => item.status === 'completed').length;
    
    // Update filter buttons
    document.getElementById('count-all').textContent = total;
    document.getElementById('count-watching').textContent = watching;
    document.getElementById('count-dropped').textContent = dropped;
    document.getElementById('count-plan').textContent = plan;
    document.getElementById('count-completed').textContent = completed;
    
    // Update summary
    document.getElementById('total-count').textContent = total;
    document.getElementById('summary-watching').textContent = watching;
    document.getElementById('summary-dropped').textContent = dropped;
    document.getElementById('summary-plan').textContent = plan;
    document.getElementById('summary-completed').textContent = completed;
}

// Show add anime form
function showAddAnimeForm(item = null) {
    const modal = document.getElementById('anime-modal');
    const title = document.getElementById('anime-modal-title');
    const form = document.getElementById('anime-form');
    
    if (item) {
        title.textContent = 'Edit Anime';
        document.getElementById('anime-id').value = item.id;
        document.getElementById('anime-title').value = item.title || '';
        document.getElementById('anime-status').value = item.status || 'plan';
        document.getElementById('anime-episode').value = item.episode || '';
        document.getElementById('anime-rating').value = item.rating || '';
        document.getElementById('anime-image_url').value = item.image_url || '';
        document.getElementById('anime-video_url').value = item.video_url || '';
        document.getElementById('anime-link').value = item.link || '';
        document.getElementById('anime-notes').value = item.notes || '';
    } else {
        title.textContent = 'Add New Anime';
        form.reset();
        document.getElementById('anime-id').value = '';
        document.getElementById('anime-type').value = 'anime';
    }
    
    modal.style.display = 'flex';
}

// Close anime modal
function closeAnimeModal() {
    document.getElementById('anime-modal').style.display = 'none';
}

// Save anime
async function saveAnime(event) {
    event.preventDefault();
    
    const user = localStorage.getItem('anime_user');
    if (!user) {
        alert('Please login first!');
        return;
    }
    
    const itemId = document.getElementById('anime-id').value;
    const itemData = {
        type: 'anime',
        title: document.getElementById('anime-title').value.trim(),
        status: document.getElementById('anime-status').value,
        episode: document.getElementById('anime-episode').value.trim(),
        rating: document.getElementById('anime-rating').value || '0',
        image_url: document.getElementById('anime-image_url').value.trim(),
        video_url: document.getElementById('anime-video_url').value.trim(),
        link: document.getElementById('anime-link').value.trim(),
        notes: document.getElementById('anime-notes').value.trim()
    };
    
    if (!itemData.title) {
        alert('Please enter a title');
        return;
    }
    
    let result;
    if (itemId) {
        result = await Database.updateItem(itemId, itemData);
    } else {
        result = await Database.addItem(itemData);
    }
    
    if (result && result.success) {
        closeAnimeModal();
        loadAnime();
        if (typeof updateStats === 'function') updateStats();
        alert(itemId ? 'Anime updated successfully!' : 'Anime added successfully!');
    } else {
        alert('Error saving anime. Please try again.');
    }
}

// Edit anime
async function editAnime(id) {
    const item = animeItems.find(item => item.id == id);
    if (item) {
        showAddAnimeForm(item);
    }
}

// Delete anime
async function deleteAnime(id) {
    if (!confirm('Are you sure you want to delete this anime?')) {
        return;
    }
    
    const result = await Database.deleteItem(id);
    if (result && result.success) {
        loadAnime();
        if (typeof updateStats === 'function') updateStats();
        alert('Anime deleted successfully!');
    } else {
        alert('Error deleting anime. Please try again.');
    }
}

// Format rating for anime
function formatAnimeRating(rating) {
    if (!rating || rating === '0' || rating === 0) return 'Not rated';
    return `${parseFloat(rating).toFixed(1)}/10`;
}

// Make functions available globally
window.filterAnime = filterAnime;
window.showAddAnimeForm = showAddAnimeForm;
window.closeAnimeModal = closeAnimeModal;
window.saveAnime = saveAnime;
window.editAnime = editAnime;
window.deleteAnime = deleteAnime;
window.loadAnime = loadAnime;