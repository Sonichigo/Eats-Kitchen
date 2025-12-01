import React from 'react';
import { Icons } from './ui/icons';

interface HeaderProps {
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogout: () => void;
}

export function Header({ isLoggedIn, onLoginClick, onLogout }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
                    <div className="bg-primary text-white p-2 rounded-lg">
                        <Icons.Chef />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Eats<span className="text-primary">&Kitchen</span></span>
                </div>
                <div>
                    {isLoggedIn ? (
                        <button 
                            onClick={onLogout}
                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-500 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
                        >
                            <Icons.Unlock />
                            <span>Admin Connected</span>
                        </button>
                    ) : (
                        <button 
                            onClick={onLoginClick}
                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary transition-colors px-3 py-1.5"
                        >
                            <Icons.Lock />
                            <span>Staff Login</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}