'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (category: string, isTemplate: boolean, tags: string[]) => void;
    projectName: string;
}

export default function PublishModal({ isOpen, onClose, onPublish, projectName }: PublishModalProps) {
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isTemplate, setIsTemplate] = useState(true);
    const [tagsInput, setTagsInput] = useState('');

    const categories = ['SaaS', 'Hospitality', 'Professional Services', 'Creative', 'Retail'];

    const handlePublish = () => {
        if (!selectedCategory) {
            alert('Please select a category');
            return;
        }

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        onPublish(selectedCategory, isTemplate, tags);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-[#1a1c23] border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-white">Publish to Community</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Project Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Project Name</label>
                        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-white font-bold">{projectName}</p>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Category *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedCategory === category
                                            ? 'bg-indigo-600 text-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                            <div>
                                <span className="block text-white font-bold mb-1">Make this a template</span>
                                <span className="text-xs text-gray-500">Allow others to use this as a starting point</span>
                            </div>
                            <div
                                onClick={() => setIsTemplate(!isTemplate)}
                                className={`relative w-14 h-7 rounded-full transition-colors ${isTemplate ? 'bg-indigo-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isTemplate ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                />
                            </div>
                        </label>
                    </div>

                    {/* Tags Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Tags <span className="text-gray-600">(comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="e.g., Modern, Dark Mode, Responsive"
                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                                }`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePublish}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
