'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ChatPanelProps {
  onCodeGenerated: (code: { html: string; css: string; js: string }, pages?: Record<string, { title: string; html: string; css: string; js: string }>) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  currentProject?: { id: string; name: string; messages: Message[]; lastGeneratedCode?: { html: string; css: string; js: string } } | null;
  onMessagesUpdate?: (messages: Message[]) => void;
  onCodeUpdate?: (code: { html: string; css: string; js: string }) => void;
  onToggleSidebar?: () => void;
  onShowHistory?: () => void;
  onShowSettings?: () => void;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}



import HexagonalLoader from './HexagonalLoader';

export default function ChatPanel({ onCodeGenerated, onLoadingChange, currentProject, onMessagesUpdate, onCodeUpdate, onBack }: ChatPanelProps) {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>(currentProject?.messages || [
    {
      role: 'assistant',
      content: 'Hi! I\'m your PageCrafter assistant. Tell me what kind of web page you\'d like me to create, and I\'ll generate the HTML, CSS, and JavaScript for you!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<{ html: string; css: string; js: string }>(currentProject?.lastGeneratedCode || {
    html: '',
    css: '',
    js: ''
  });

  const [activeTab, setActiveTab] = useState<'ai' | 'components' | 'styles'>('ai');

  // Update messages and code when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setMessages(currentProject.messages.length > 0 ? currentProject.messages as Message[] : [
        {
          role: 'assistant',
          content: 'Hi! I\'m your PageCrafter assistant. Tell me what kind of web page you\'d like me to create, and I\'ll generate the HTML, CSS, and JavaScript for you!'
        }
      ]);
      setLastGeneratedCode(currentProject.lastGeneratedCode || {
        html: '',
        css: '',
        js: ''
      });
    }
  }, [currentProject]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    onLoadingChange?.(true);

    // Add user message to chat
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    onMessagesUpdate?.(newMessages);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          previousHtml: lastGeneratedCode.html,
          previousCss: lastGeneratedCode.css,
          previousJs: lastGeneratedCode.js
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();

      // Add assistant response to chat
      const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }, { role: 'assistant' as const, content: data.response }];
      setMessages(updatedMessages);
      onMessagesUpdate?.(updatedMessages);

      // Update the generated code
      if (data.code) {
        setLastGeneratedCode(data.code);
        onCodeUpdate?.(data.code);
        onCodeGenerated(data.code, data.pages);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error generating the code. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log('Files selected:', e.target.files);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>
      {/* Premium Tabs */}
      <div className="flex items-center gap-1 p-2 bg-black/20 border-b border-white/5">
        {[
          {
            id: 'ai', label: 'AI Assistant', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            )
          },
          {
            id: 'components', label: 'Components', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            )
          },
          {
            id: 'styles', label: 'Styles', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            )
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === tab.id
              ? 'bg-indigo-600/10 text-indigo-400 shadow-lg'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ai' ? (
        <>
          {/* AI Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <span className="text-sm font-black text-white uppercase tracking-widest">AI Assistant</span>
            </div>
            <button className="p-2 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${message.role === 'assistant'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                  {message.role === 'assistant' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  ) : 'U'}
                </div>
                <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-[1.5rem] shadow-2xl transition-all duration-300 ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/5 text-gray-100 rounded-tl-none hover:bg-white/10'
                    }`}>
                    <p className="text-[13px] font-medium leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg overflow-hidden">
                  <HexagonalLoader size={32} color="white" />
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center">
                  <span className="text-xs font-bold text-gray-400 animate-pulse">Generating your masterpiece...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </form>
          </div>
        </>
      ) : activeTab === 'components' ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Advanced Components</h3>
          <p className="text-sm text-gray-500 max-w-xs">Drag and drop premium components directly into your project. Coming soon!</p>
        </div>
      ) : (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 flex items-center justify-center text-purple-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Advanced Styles</h3>
          <p className="text-sm text-gray-500 max-w-xs">Fine-tune every pixel with precision style controls. Feature in development.</p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
