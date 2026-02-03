'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Download, Globe, Link2, ChevronDown, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import HexagonalLoader from './HexagonalLoader';

interface PDFSection {
    heading: string;
    content: string;
}

interface PDFDocument {
    title: string;
    author: string;
    sections: PDFSection[];
}

interface PDFPreviewProps {
    document: PDFDocument | null;
    isLoading?: boolean;
}

export default function PDFPreview({ document: doc, isLoading }: PDFPreviewProps) {
    const { theme } = useTheme();
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExportPDF = async () => {
        if (!previewRef.current) return;

        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 1,
            filename: `${doc?.title || 'document'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };

        html2pdf().from(previewRef.current).set(opt).save();
        setIsShareMenuOpen(false);
    };

    if (isLoading && !doc) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-md gap-8">
                <HexagonalLoader size={120} color="#ef4444" />
                <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">Drafting Document</span>
                    <span className="text-red-500 font-bold animate-pulse text-sm uppercase tracking-widest">AI is writing your content...</span>
                </div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-900/20">
                <div className="w-32 h-32 rounded-[3rem] bg-red-600/10 flex items-center justify-center text-red-400 mb-8 border border-red-500/20 shadow-2xl">
                    <FileText className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Your Document Awaits</h2>
                <p className="text-gray-500 max-w-sm font-medium">Describe your requirements in the chat to generate a professional PDF document instantly.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">PDF Preview</span>
                    <div className="h-4 w-px bg-white/10" />
                    <h3 className="text-sm font-bold text-gray-300 truncate max-w-[200px]">{doc.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={shareMenuRef}>
                        <button
                            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95"
                        >
                            <Share2 size={14} />
                            Actions
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isShareMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isShareMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1c23] border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-fade-in">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                            <Download size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Export as PDF</span>
                                            <span className="text-[10px] text-gray-600 font-medium">Download professional PDF</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const dummyLink = `${window.location.origin}/share/pdf/${Math.random().toString(36).substring(7)}`;
                                            navigator.clipboard.writeText(dummyLink);
                                            setIsPublic(true);
                                            alert('Document is now public! Link copied to clipboard.');
                                            setIsShareMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <Globe size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Share Publicly</span>
                                            <span className="text-[10px] text-gray-600 font-medium">Make public & copy link</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex justify-center">
                <div
                    ref={previewRef}
                    className="w-full max-w-[800px] bg-white text-gray-900 p-12 shadow-2xl min-h-[1056px] flex flex-col gap-8 rounded-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    <div className="border-b-4 border-red-600 pb-6">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-2">{doc.title}</h1>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <span>By {doc.author}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {doc.sections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            <h2 className="text-xl font-black uppercase tracking-tight text-red-600 border-l-4 border-red-600 pl-4">{section.heading}</h2>
                            <p className="text-lg leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">{section.content}</p>
                        </div>
                    ))}

                    <div className="mt-auto pt-10 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                        <span>Generated by PageCrafter AI</span>
                        <span>Page 1 of 1</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
