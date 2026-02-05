// Manhwa-specific JavaScript
let manhwaItems = [];

// Load manhwa from database
async function loadManhwa() {
    const user = localStorage.getItem('anime_user');
    if (!user) {
        document.getElementById('no-manhwa').style.display = 'block';
        document.getElementById('manhwa-grid').innerHTML = '';
        return;
    }
    
    try {
        const items = await Database.getAllItems('manhwa');
        manhwaItems = items;
        displayManhwa(manhwaItems);
        updateManhwaCounts(manhwaItems);
    } catch (error) {
        console.log('Error loading manhwa:', error);
        manhwaItems = [];
        displayManhwa([]);
        updateManhwaCounts([]);
    }
}

// Display manhwa items
function displayManhwa(items) {
    const grid = document.getElementById('manhwa-grid');
    const noItems = document.getElementById('no-manhwa');
    
    if (!items || items.length === 0) {
        grid.innerHTML = '';
        noItems.style.display = 'block';
        return;
    }
    
    noItems.style.display = 'none';
    
    grid.innerHTML = items.map(item => {
        const imageUrl = item.image_url || 'https://via.placeholder.com/350x200/9f7aea/ffffff?text=Manhwa+Cover';
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
                    ${getManhwaStatusLabel(item.status)}
                </span>
            </div>
            
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title || 'Untitled'}</h3>
                    <span class="item-rating">${formatManhwaRating(item.rating)}</span>
                </div>
                
                <div class="item-meta">
                    <span class="item-chapter">Chapters: ${item.episode || 'N/A'}</span>
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
                    <button class="btn-edit" onclick="editManhwa('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteManhwa('${item.id}')">
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

// Get manhwa status label
function getManhwaStatusLabel(status) {
    switch(status) {
        case 'reading': return 'Reading';
        case 'plan': return 'Plan to Read';
        case 'dropped': return 'Dropped';
        case 'completed': return 'Completed';
        default: return 'Plan to Read';
    }
}

// Filter manhwa by status
function filterManhwa(status) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (status === 'all') {
        displayManhwa(manhwaItems);
    } else {
        const filtered = manhwaItems.filter(item => item.status === status);
        displayManhwa(filtered);
    }
}

// Update manhwa counts
function updateManhwaCounts(items) {
    const total = items.length;
    const reading = items.filter(item => item.status === 'reading').length;
    const dropped = items.filter(item => item.status === 'dropped').length;
    const plan = items.filter(item => item.status === 'plan').length;
    const completed = items.filter(item => item.status === 'completed').length;
    
    // Update filter buttons
    document.getElementById('count-all').textContent = total;
    document.getElementById('count-reading').textContent = reading;
    document.getElementById('count-dropped').textContent = dropped;
    document.getElementById('count-plan').textContent = plan;
    document.getElementById('count-completed').textContent = completed;
    
    // Update summary
    document.getElementById('total-count').textContent = total;
    document.getElementById('summary-reading').textContent = reading;
    document.getElementById('summary-dropped').textContent = dropped;
    document.getElementById('summary-plan').textContent = plan;
    document.getElementById('summary-completed').textContent = completed;
}

// Show add manhwa form
function showAddManhwaForm(item = null) {
    const modal = document.getElementById('manhwa-modal');
    const title = document.getElementById('manhwa-modal-title');
    const form = document.getElementById('manhwa-form');
    
    if (item) {
        title.textContent = 'Edit Manhwa';
        document.getElementById('manhwa-id').value = item.id;
        document.getElementById('manhwa-title').value = item.title || '';
        document.getElementById('manhwa-status').value = item.status || 'plan';
        document.getElementById('manhwa-chapter').value = item.episode || '';
        document.getElementById('manhwa-rating').value = item.rating || '';
        document.getElementById('manhwa-image_url').value = item.image_url || '';
        document.getElementById('manhwa-video_url').value = item.video_url || '';
        document.getElementById('manhwa-link').value = item.link || '';
        document.getElementById('manhwa-notes').value = item.notes || '';
    } else {
        title.textContent = 'Add New Manhwa';
        form.reset();
        document.getElementById('manhwa-id').value = '';
        document.getElementById('manhwa-type').value = 'manhwa';
        document.getElementById('manhwa-status').value = 'plan';
    }
    
    modal.style.display = 'flex';
}

// Close manhwa modal
function closeManhwaModal() {
    document.getElementById('manhwa-modal').style.display = 'none';
}

// Save manhwa
async function saveManhwa(event) {
    event.preventDefault();
    
    const user = localStorage.getItem('anime_user');
    if (!user) {
        alert('Please login first!');
        return;
    }
    
    const itemId = document.getElementById('manhwa-id').value;
    const itemData = {
        type: 'manhwa',
        title: document.getElementById('manhwa-title').value.trim(),
        status: document.getElementById('manhwa-status').value,
        episode: document.getElementById('manhwa-chapter').value.trim(),
        rating: document.getElementById('manhwa-rating').value || '0',
        image_url: document.getElementById('manhwa-image_url').value.trim(),
        video_url: document.getElementById('manhwa-video_url').value.trim(),
        link: document.getElementById('manhwa-link').value.trim(),
        notes: document.getElementById('manhwa-notes').value.trim()
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
        closeManhwaModal();
        loadManhwa();
        if (typeof updateStats === 'function') updateStats();
        alert(itemId ? 'Manhwa updated successfully!' : 'Manhwa added successfully!');
    } else {
        alert('Error saving manhwa. Please try again.');
    }
}

// Edit manhwa
async function editManhwa(id) {
    const item = manhwaItems.find(item => item.id == id);
    if (item) {
        showAddManhwaForm(item);
    }
}

// Delete manhwa
async function deleteManhwa(id) {
    if (!confirm('Are you sure you want to delete this manhwa?')) {
        return;
    }
    
    const result = await Database.deleteItem(id);
    if (result && result.success) {
        loadManhwa();
        if (typeof updateStats === 'function') updateStats();
        alert('Manhwa deleted successfully!');
    } else {
        alert('Error deleting manhwa. Please try again.');
    }
}

// Format rating for manhwa
function formatManhwaRating(rating) {
    if (!rating || rating === '0' || rating === 0) return 'Not rated';
    return `${parseFloat(rating).toFixed(1)}/10`;
}

// Make functions available globally
window.filterManhwa = filterManhwa;
window.showAddManhwaForm = showAddManhwaForm;
window.closeManhwaModal = closeManhwaModal;
window.saveManhwa = saveManhwa;
window.editManhwa = editManhwa;
window.deleteManhwa = deleteManhwa;
window.loadManhwa = loadManhwa;