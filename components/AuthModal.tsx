import React, { useState } from 'react';
import { Icons } from './ui/icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (username: string, password: string) => Promise<void>;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onLogin(username, password);
            setUsername('');
            setPassword('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Icons.Lock />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Access</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter your username and password.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            autoFocus
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}