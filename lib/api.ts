import { Item, DistributiveOmit } from './types';

export class ApiService {
    
    private async request(url: string, options: RequestInit = {}) {
        const res = await fetch(url, options);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Request failed');
        }
        return res.json();
    }

    async getItems(): Promise<Item[]> {
        return this.request('/api/items');
    }

    async login(username: string, password: string): Promise<{ token: string, user: { name: string } }> {
        return this.request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    }

    async addItem(token: string, item: DistributiveOmit<Item, 'id' | 'createdAt'>): Promise<Item> {
        return this.request('/api/items', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(item)
        });
    }

    async updateItem(token: string, id: string, updates: Partial<Item>): Promise<Item> {
        return this.request(`/api/items/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(updates)
        });
    }

    async deleteItem(token: string, id: string): Promise<void> {
        return this.request(`/api/items/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
    }
}

export const api = new ApiService();