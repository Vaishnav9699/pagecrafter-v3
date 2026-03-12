'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PDFPanelProps {
    onPDFGenerated: (document: any) => void;
    onLoadingChange?: (isLoading: boolean) => void;
    onBack?: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function PDFPanel({ onPDFGenerated, onLoadingChange, onBack }: PDFPanelProps) {
    const { theme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Welcome to PDF Maker! Describe the document you want to create (e.g., a report, a resume, or an essay), and I\'ll generate it for you.'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);
        onLoadingChange?.(true);

        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage }),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            if (data.document) {
                onPDFGenerated(data.document);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I couldn\'t generate the document. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
            onLoadingChange?.(false);
        }
    };

    return (
        <div className={`flex flex-col h-full min-h-0 ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>
            {/* PDF Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">PDF Maker AI</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {messages.map((message, index) => (
                    <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${message.role === 'assistant' ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                            {message.role === 'assistant' ? 'AI' : 'U'}
                        </div>
                        <div className={`p-4 rounded-[1.5rem] shadow-2xl ${message.role === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-100 rounded-tl-none'}`}>
                            <p className="text-[13px] font-medium leading-relaxed">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-4 animate-fade-in">
                        <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                            <span className="text-xs font-bold text-gray-400 animate-pulse">Drafting your document...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. Write a professional report on Artificial Intelligence trends..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all shadow-inner"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
                    </button>
                </form>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
        </div>
    );
}
