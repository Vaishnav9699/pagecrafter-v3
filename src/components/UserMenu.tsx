'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function UserMenu() {
    const { user, loading, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        router.push('/login');
    };

    // Show nothing while loading
    if (loading) {
        return (
            <div className={`w-9 h-9 rounded-xl animate-pulse ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
        );
    }

    // Show login button if not authenticated
    if (!user) {
        return (
            <Link
                href="/login"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                title="Sign In"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm hidden sm:block">Sign In</span>
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${theme === 'dark'
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                    }`}
            >
                {/* User Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={`text-sm hidden sm:block truncate max-w-[120px] font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user.email}
                </span>
                {/* Dropdown Arrow */}
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
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
                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl z-20 border overflow-hidden animate-fade-in ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-800'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className={`px-4 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {user.email?.split('@')[0]}
                                    </p>
                                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${theme === 'dark'
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : 'text-red-600 hover:bg-red-50'
                                    } disabled:opacity-50`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {isLoading ? 'Signing out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
