// Manga-specific JavaScript
let mangaItems = [];

// Load manga from database
async function loadManga() {
    const user = localStorage.getItem('anime_user');
    if (!user) {
        document.getElementById('no-manga').style.display = 'block';
        document.getElementById('manga-grid').innerHTML = '';
        return;
    }
    
    try {
        const items = await Database.getAllItems('manga');
        mangaItems = items;
        displayManga(mangaItems);
        updateMangaCounts(mangaItems);
    } catch (error) {
        console.log('Error loading manga:', error);
        mangaItems = [];
        displayManga([]);
        updateMangaCounts([]);
    }
}

// Display manga items
function displayManga(items) {
    const grid = document.getElementById('manga-grid');
    const noItems = document.getElementById('no-manga');
    
    if (!items || items.length === 0) {
        grid.innerHTML = '';
        noItems.style.display = 'block';
        return;
    }
    
    noItems.style.display = 'none';
    
    grid.innerHTML = items.map(item => {
        const imageUrl = item.image_url || 'https://via.placeholder.com/350x200/ed8936/ffffff?text=Manga+Cover';
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
                    ${getMangaStatusLabel(item.status)}
                </span>
            </div>
            
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title || 'Untitled'}</h3>
                    <span class="item-rating">${formatMangaRating(item.rating)}</span>
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
                    <button class="btn-edit" onclick="editManga('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteManga('${item.id}')">
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

// Get manga status label
function getMangaStatusLabel(status) {
    switch(status) {
        case 'reading': return 'Reading';
        case 'plan': return 'Plan to Read';
        case 'dropped': return 'Dropped';
        case 'completed': return 'Completed';
        default: return 'Plan to Read';
    }
}

// Filter manga by status
function filterManga(status) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (status === 'all') {
        displayManga(mangaItems);
    } else {
        const filtered = mangaItems.filter(item => item.status === status);
        displayManga(filtered);
    }
}

// Update manga counts
function updateMangaCounts(items) {
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

// Show add manga form
function showAddMangaForm(item = null) {
    const modal = document.getElementById('manga-modal');
    const title = document.getElementById('manga-modal-title');
    const form = document.getElementById('manga-form');
    
    if (item) {
        title.textContent = 'Edit Manga';
        document.getElementById('manga-id').value = item.id;
        document.getElementById('manga-title').value = item.title || '';
        document.getElementById('manga-status').value = item.status || 'plan';
        document.getElementById('manga-chapter').value = item.episode || '';
        document.getElementById('manga-rating').value = item.rating || '';
        document.getElementById('manga-image_url').value = item.image_url || '';
        document.getElementById('manga-video_url').value = item.video_url || '';
        document.getElementById('manga-link').value = item.link || '';
        document.getElementById('manga-notes').value = item.notes || '';
    } else {
        title.textContent = 'Add New Manga';
        form.reset();
        document.getElementById('manga-id').value = '';
        document.getElementById('manga-type').value = 'manga';
        document.getElementById('manga-status').value = 'plan';
    }
    
    modal.style.display = 'flex';
}

// Close manga modal
function closeMangaModal() {
    document.getElementById('manga-modal').style.display = 'none';
}

// Save manga
async function saveManga(event) {
    event.preventDefault();
    
    const user = localStorage.getItem('anime_user');
    if (!user) {
        alert('Please login first!');
        return;
    }
    
    const itemId = document.getElementById('manga-id').value;
    const itemData = {
        type: 'manga',
        title: document.getElementById('manga-title').value.trim(),
        status: document.getElementById('manga-status').value,
        episode: document.getElementById('manga-chapter').value.trim(),
        rating: document.getElementById('manga-rating').value || '0',
        image_url: document.getElementById('manga-image_url').value.trim(),
        video_url: document.getElementById('manga-video_url').value.trim(),
        link: document.getElementById('manga-link').value.trim(),
        notes: document.getElementById('manga-notes').value.trim()
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
        closeMangaModal();
        loadManga();
        if (typeof updateStats === 'function') updateStats();
        alert(itemId ? 'Manga updated successfully!' : 'Manga added successfully!');
    } else {
        alert('Error saving manga. Please try again.');
    }
}

// Edit manga
async function editManga(id) {
    const item = mangaItems.find(item => item.id == id);
    if (item) {
        showAddMangaForm(item);
    }
}

// Delete manga
async function deleteManga(id) {
    if (!confirm('Are you sure you want to delete this manga?')) {
        return;
    }
    
    const result = await Database.deleteItem(id);
    if (result && result.success) {
        loadManga();
        if (typeof updateStats === 'function') updateStats();
        alert('Manga deleted successfully!');
    } else {
        alert('Error deleting manga. Please try again.');
    }
}

// Format rating for manga
function formatMangaRating(rating) {
    if (!rating || rating === '0' || rating === 0) return 'Not rated';
    return `${parseFloat(rating).toFixed(1)}/10`;
}

// Make functions available globally
window.filterManga = filterManga;
window.showAddMangaForm = showAddMangaForm;
window.closeMangaModal = closeMangaModal;
window.saveManga = saveManga;
window.editManga = editManga;
window.deleteManga = deleteManga;
window.loadManga = loadManga;