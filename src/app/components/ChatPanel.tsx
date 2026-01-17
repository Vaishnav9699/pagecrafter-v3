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
  }, [messages, isLoading]);

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
        // Store the code globally for next request
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
      // TODO: Handle file upload logic here
      console.log('Files selected:', e.target.files);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#CCCCFF]'}`}>
      {/* Header with Back Button */}
      <div className={`flex items-center p-3 sm:p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={onBack}
          className={`p-2 mr-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Back to Projects"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {currentProject?.name || 'New Project'}
        </h2>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 scroll-smooth ${theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${message.role === 'user'
                ? theme === 'dark'
                  ? 'bg-primary text-white shadow-primary/20'
                  : 'bg-primary text-white shadow-primary/20'
                : theme === 'dark'
                  ? 'bg-card text-card-foreground border border-border/50'
                  : 'bg-white text-gray-800 border border-border/50 shadow-md'
                }`}
            >
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}



        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 ${theme === 'dark'
              ? 'bg-gray-800 text-gray-100 border border-gray-700'
              : 'bg-white text-gray-800 border border-gray-200 shadow-md'
              }`}>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium">Generating code...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t p-3 sm:p-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-[#CCCCFF] border-blue-200'}`}>
        <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the web page you want to create..."
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-2.5 sm:py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm transform active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center border ${theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            title="Add images"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm transform active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Send message (Shift+Enter)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
