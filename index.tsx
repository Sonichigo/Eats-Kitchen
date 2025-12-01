import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import { api } from './lib/api';
import { Item } from './lib/types';

import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { AuthModal } from './components/AuthModal';
import { ItemModal } from './components/ItemModal';
import { Icons } from './components/ui/icons';

function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [filter, setFilter] = useState<'all' | 'recipe' | 'restaurant'>('all');
    
    // Auth State
    const [authToken, setAuthToken] = useState<string | null>(null);
    
    // UI State
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await api.getItems();
            setItems(data);
        } catch (err) {
            console.error(err);
            setError('Unable to connect to the server. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (password: string) => {
        const response = await api.login(password);
        setAuthToken(response.token);
    };

    const handleLogout = () => {
        setAuthToken(null);
    };

    const handleSave = async (data: Partial<Item>) => {
        if (!authToken) {
            alert("Unauthorized");
            return;
        }

        if (editingItem) {
            // Update Mode
            const updated = await api.updateItem(authToken, editingItem.id, data);
            setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        } else {
            // Add Mode
            const newItem = await api.addItem(authToken, data as any);
            setItems(prev => [newItem, ...prev]);
        }
    };

    const handleDelete = async (id: string) => {
        if (!authToken) return;
        await api.deleteItem(authToken, id);
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleEditClick = (item: Item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const filteredItems = useMemo(() => {
        return filter === 'all' ? items : items.filter(i => i.type === filter);
    }, [items, filter]);

    return (
        <div className="min-h-screen pb-20">
            <Header 
                isLoggedIn={!!authToken} 
                onLoginClick={() => setIsLoginOpen(true)} 
                onLogout={handleLogout} 
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero / Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Discover Excellence</h1>
                        <p className="text-gray-500">Curated recipes and restaurant reviews.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
                        <button onClick={() => setFilter('recipe')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'recipe' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Recipes</button>
                        <button onClick={() => setFilter('restaurant')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'restaurant' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Reviews</button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-8">
                        <div className="text-red-500 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Connection Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={loadItems}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>)}
                    </div>
                )}

                {/* Data Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map(item => (
                            <ItemCard 
                                key={item.id} 
                                item={item} 
                                isLoggedIn={!!authToken} 
                                onDelete={handleDelete}
                                onEdit={handleEditClick}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredItems.length === 0 && (
                    <div className="text-center py-20">
                         <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.Chef />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Empty</h3>
                        <p className="text-gray-500 mt-1">No recipe or restaurant added yet</p>
                        {authToken && (
                            <button 
                                onClick={handleAddClick} 
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
                            >
                                Add your first item
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Floating Action Button for Admin */}
            {authToken && !error && (
                <button 
                    onClick={handleAddClick}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-red-500 transition-all transform hover:scale-110 flex items-center justify-center z-40"
                >
                    <Icons.Plus />
                </button>
            )}

            {/* Modals */}
            <AuthModal 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)} 
                onLogin={handleLogin} 
            />
            
            <ItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                initialData={editingItem}
            />
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);