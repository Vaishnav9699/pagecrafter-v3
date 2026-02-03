'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeatureAnimation from '../components/FeatureAnimation';

export default function RegisterPage() {
    const { theme } = useTheme();
    const { signUp, user, loading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Redirect if already logged in
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-3 border-gray-300"></div>
                    <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={`min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
                {theme === 'dark' && <FeatureAnimation />}
                <div className={`relative z-10 w-full max-w-md p-8 sm:p-10 transition-all duration-500`}>
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-green-500/20 flex items-center justify-center">
                                <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Check Your Email
                        </h2>
                        <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            We&apos;ve sent a confirmation link to <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{email}</strong>.
                            Please click the link to activate your account.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
            {theme === 'dark' && <FeatureAnimation />}
            <div className={`relative z-10 w-full max-w-md p-8 sm:p-10 transition-all duration-500`}>
                {/* Header */}
                {/* Error Message */}

                {/* Error Message */}
                {error && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
                        <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus-glow ${theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                                }`}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus-glow ${theme === 'dark'
                                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                                    }`}
                                placeholder="Min 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus-glow ${theme === 'dark'
                                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                                    }`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={`transition-all duration-500 overflow-hidden ${email && password && confirmPassword ? 'opacity-100 max-h-20 mt-6 translate-y-0' : 'opacity-0 max-h-0 translate-y-4 pointer-events-none'}`}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer - Moved to bottom */}
            <div className="absolute bottom-8 left-0 right-0 z-20 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
                <div>
                    <Link
                        href="/"
                        className={`inline-flex items-center gap-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to PageCrafter
                    </Link>
                </div>
            </div>
        </div>
    );
}
