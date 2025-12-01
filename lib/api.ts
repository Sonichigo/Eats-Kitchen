import { Item, DistributiveOmit } from './types';

const MOCK_DELAY = 800;

export class MockBackend {
    // In-memory storage to simulate a server database.
    // Data is lost on page reload, enforcing the "app only uses server" behavior.
    private items: Item[] = [];
    private ADMIN_TOKEN = 'mock_token_' + Math.random().toString(36).substring(2);

    async getItems(): Promise<Item[]> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate a successful server response
                resolve([...this.items]); 
                
                // Uncomment the line below to test Error Handling in the UI:
                // reject(new Error("Connection refused"));
            }, MOCK_DELAY);
        });
    }

    async login(password: string): Promise<{ token: string, user: { name: string } }> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (password === 'admin') {
                    resolve({ 
                        token: this.ADMIN_TOKEN, 
                        user: { name: 'Admin User' } 
                    });
                } else {
                    reject(new Error('Invalid Credentials'));
                }
            }, MOCK_DELAY);
        });
    }

    async addItem(token: string, item: DistributiveOmit<Item, 'id' | 'createdAt'>): Promise<Item> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (token !== this.ADMIN_TOKEN) {
                    return reject(new Error('Unauthorized: Valid token required'));
                }

                const newItem = { 
                    ...item, 
                    id: Math.random().toString(36).substring(2, 9), 
                    createdAt: Date.now() 
                } as Item;
                
                // Add to in-memory store
                this.items.unshift(newItem);
                resolve(newItem);
            }, MOCK_DELAY);
        });
    }

    async updateItem(token: string, id: string, updates: Partial<Item>): Promise<Item> {
        return new Promise((resolve, reject) => {
             setTimeout(() => {
                if (token !== this.ADMIN_TOKEN) {
                    return reject(new Error('Unauthorized: Valid token required'));
                }

                const index = this.items.findIndex(i => i.id === id);
                
                if (index === -1) {
                    return reject(new Error('Item not found'));
                }

                const existingItem = this.items[index];
                const updatedItem = {
                    ...existingItem,
                    ...updates,
                    id: existingItem.id, 
                    createdAt: existingItem.createdAt
                } as Item;

                this.items[index] = updatedItem;
                resolve(updatedItem);
             }, MOCK_DELAY);
        });
    }

    async deleteItem(token: string, id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (token !== this.ADMIN_TOKEN) {
                    return reject(new Error('Unauthorized: Valid token required'));
                }

                this.items = this.items.filter(i => i.id !== id);
                resolve();
            }, MOCK_DELAY);
        });
    }
}

export const api = new MockBackend();