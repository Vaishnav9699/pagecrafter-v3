'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Slide {
    title: string;
    content: string[];
    background?: string;
    layout?: 'title' | 'content' | 'split';
}

interface PPTPreviewProps {
    slides: Slide[];
    isLoading?: boolean;
}

export default function PPTPreview({ slides, isLoading }: PPTPreviewProps) {
    const { theme } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);

    if (isLoading && slides.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                <span className="text-orange-500 font-bold animate-pulse">Designing your presentation...</span>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-900/20">
                <div className="w-32 h-32 rounded-[3rem] bg-orange-600/10 flex items-center justify-center text-orange-400 mb-8 border border-orange-500/20 shadow-2xl">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Your Presentation Awaits</h2>
                <p className="text-gray-500 max-w-sm font-medium">Describe your topic in the chat to generate a professional slide deck instantly.</p>
            </div>
        );
    }

    const slide = slides[currentSlide];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Slide {currentSlide + 1} of {slides.length}</span>
                    <div className="h-4 w-px bg-white/10" />
                    <h3 className="text-sm font-bold text-gray-300 truncate max-w-[200px]">{slide.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        disabled={currentSlide === slides.length - 1}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Main Slide Canvas */}
            <div className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-purple-600/5 pointer-events-none" />

                <div className="w-full aspect-video max-w-5xl bg-[#12141c] rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col p-12 relative group animate-slide-up">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {slide.layout === 'title' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
                            <div className="w-20 h-1 bg-orange-500 rounded-full" />
                            <h1 className="text-6xl font-black text-white tracking-tight leading-tight">{slide.title}</h1>
                            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">{slide.content[0]}</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-4xl font-black text-white mb-10 border-l-4 border-orange-500 pl-6">{slide.title}</h2>
                            <ul className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
                                {slide.content.map((item, idx) => (
                                    <li key={idx} className="flex gap-4 items-start group/item">
                                        <div className="mt-2 w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)] group-hover/item:scale-150 transition-transform" />
                                        <span className="text-lg text-gray-300 leading-relaxed font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                        <span>PageCrafter AI Presenter</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">Confidential</span>
                        <span>Slide {currentSlide + 1}</span>
                    </div>
                </div>
            </div>

            {/* Slide Thumbnails Tray */}
            <div className="h-32 bg-black/40 border-t border-white/5 p-4 flex gap-4 overflow-x-auto custom-scrollbar scroll-smooth">
                {slides.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`flex-shrink-0 w-44 aspect-video rounded-lg border-2 transition-all relative overflow-hidden group/thumb ${currentSlide === idx ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/5 hover:border-white/20'}`}
                    >
                        <div className="absolute inset-0 bg-gray-900 p-2 text-left">
                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1 truncate">{s.title}</div>
                            <div className="space-y-1 opacity-20">
                                <div className="h-1 w-full bg-white/50 rounded-full" />
                                <div className="h-1 w-[80%] bg-white/50 rounded-full" />
                                <div className="h-1 w-[60%] bg-white/50 rounded-full" />
                            </div>
                        </div>
                        {currentSlide === idx && <div className="absolute inset-0 bg-orange-500/5" />}
                    </button>
                ))}
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
        </div>
    );
}
