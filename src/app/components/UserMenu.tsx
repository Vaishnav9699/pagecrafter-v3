'use client';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
            >
                {/* User Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                    } text-white`}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm hidden sm:block truncate max-w-[150px]">
                    {user.email}
                </span>
                {/* Dropdown Arrow */}
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Menu */}
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 border ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}>
                        <div className="py-1">
                            <div className={`px-4 py-2 text-xs border-b ${theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-200'
                                }`}>
                                Signed in as
                                <div className={`font-medium truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {user.email}
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark'
                                        ? 'text-red-400 hover:bg-gray-700'
                                        : 'text-red-600 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                            >
                                {isLoading ? 'Signing out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
