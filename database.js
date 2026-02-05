// Database Configuration
// REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJ-3CYomG5OlTdxPPUgHgRJCUWcnGrRp4wfbei0js9qvuLrd5H0U3L5pOU7_cNACPG/exec';

// Database Class
class Database {
    // Main request function
    static async request(action, data = {}) {
        try {
            const user = localStorage.getItem('anime_user') || 'default';
            
            // Build URL parameters
            const params = new URLSearchParams();
            params.append('action', action);
            params.append('user', user);
            
            if (data.type) params.append('type', data.type);
            if (data.id) params.append('id', data.id);
            if (data.item) params.append('item', JSON.stringify(data.item));
            
            const url = `${SCRIPT_URL}?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.warn('Online database failed, using local storage:', error);
            return this.localStorageRequest(action, data);
        }
    }
    
    // Local storage fallback
    static localStorageRequest(action, data) {
        const user = localStorage.getItem('anime_user') || 'default';
        const storageKey = `anime_memories_${user}`;
        
        let items = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        switch(action) {
            case 'getAll':
                const type = data.type;
                const filtered = type ? items.filter(item => item.type === type) : items;
                return { success: true, data: filtered };
                
            case 'addItem':
                const newItem = {
                    id: Date.now().toString(),
                    ...data.item,
                    createdAt: new Date().toISOString()
                };
                items.push(newItem);
                localStorage.setItem(storageKey, JSON.stringify(items));
                return { success: true, id: newItem.id };
                
            case 'updateItem':
                const index = items.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    items[index] = { ...items[index], ...data.item };
                    localStorage.setItem(storageKey, JSON.stringify(items));
                    return { success: true };
                }
                return { success: false, message: 'Item not found' };
                
            case 'deleteItem':
                items = items.filter(item => item.id !== data.id);
                localStorage.setItem(storageKey, JSON.stringify(items));
                return { success: true };
                
            case 'getStats':
                const stats = {
                    total: items.length,
                    byType: {
                        anime: items.filter(item => item.type === 'anime').length,
                        manga: items.filter(item => item.type === 'manga').length,
                        manhwa: items.filter(item => item.type === 'manhwa').length
                    },
                    byStatus: {
                        watching: items.filter(item => item.status === 'watching').length,
                        reading: items.filter(item => item.status === 'reading').length,
                        dropped: items.filter(item => item.status === 'dropped').length,
                        plan: items.filter(item => item.status === 'plan').length,
                        completed: items.filter(item => item.status === 'completed').length
                    }
                };
                return { success: true, stats: stats };
                
            case 'ping':
                return { 
                    success: true, 
                    message: 'Using local storage',
                    mode: 'offline'
                };
                
            default:
                return { success: false, message: 'Unknown action' };
        }
    }
    
    // Public methods
    static async getAllItems(type = null) {
        const result = await this.request('getAll', { type: type });
        return result.data || [];
    }
    
    static async addItem(itemData) {
        const result = await this.request('addItem', { item: itemData });
        return result;
    }
    
    static async updateItem(id, itemData) {
        const result = await this.request('updateItem', { 
            id: id, 
            item: itemData 
        });
        return result;
    }
    
    static async deleteItem(id) {
        const result = await this.request('deleteItem', { id: id });
        return result;
    }
    
    static async getStats() {
        const result = await this.request('getStats');
        return result;
    }
    
    static async ping() {
        const result = await this.request('ping');
        return result;
    }
}

// Database status check
async function checkDatabaseStatus() {
    const statusElement = document.getElementById('db-status');
    if (!statusElement) return;
    
    try {
        const result = await Database.ping();
        if (result && result.success) {
            if (result.mode === 'offline') {
                statusElement.textContent = '● Offline (Local Storage)';
                statusElement.className = 'offline';
            } else {
                statusElement.textContent = '● Online';
                statusElement.className = 'online';
            }
        } else {
            statusElement.textContent = '● Offline';
            statusElement.className = 'offline';
        }
    } catch (error) {
        statusElement.textContent = '● Offline';
        statusElement.className = 'offline';
    }
}

// Make functions global
window.Database = Database;
window.checkDatabaseStatus = checkDatabaseStatus;