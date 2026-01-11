'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

interface ChatPanelProps {
  onCodeGenerated: (code: { html: string; css: string; js: string }, pages?: Record<string, { title: string; html: string; css: string; js: string }>) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  currentProject?: { id: string; name: string; messages: Message[]; lastGeneratedCode?: { html: string; css: string; js: string } } | null;
  onMessagesUpdate?: (messages: Message[]) => void;
  onCodeUpdate?: (code: { html: string; css: string; js: string }) => void;
  onToggleSidebar?: () => void;
  onShowHistory?: () => void;
  onShowSettings?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  '🎨 Create a colorful landing page',
  '📱 Build a mobile app mockup',
  '🛒 Design an e-commerce product card',
  '✍️ Make a blog post layout',
  '🎯 Create a portfolio showcase',
  '💬 Design a chat interface'
];

export default function ChatPanel({ onCodeGenerated, onLoadingChange, currentProject, onMessagesUpdate, onCodeUpdate, onShowHistory, onShowSettings }: ChatPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
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

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 ease-in-out ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} ${
      messages.length > 1 ? 'md:w-1/2 w-full' : 'w-full'
    }`}>
      {/* Header with theme toggle */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-600 border-blue-700'} border-b p-4 flex justify-between items-center`}>
        {/* Left side - Sidebar toggle and title */}
        <div className="flex items-center space-x-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => {/* TODO: Connect to sidebar toggle */}}
            className="p-2 rounded-lg text-white hover:bg-opacity-20 hover:bg-white transition-colors"
            title="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {currentProject ? currentProject.name : 'PageCrafter AI'}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-100'}`}>
              {currentProject ? `${messages.length} messages` : 'Create web pages with AI assistance'}
            </p>
          </div>
        </div>

        {/* Right side - Buttons aligned horizontally */}
        <div className="flex items-center space-x-2">
          {/* History Button */}
          <button
            onClick={onShowHistory}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            title="View history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Login Button */}
          <Link
            href="/login"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
          >
            Login
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                message.role === 'user'
                  ? theme === 'dark'
                    ? 'bg-primary text-white shadow-primary/20'
                    : 'bg-primary text-white shadow-primary/20'
                  : theme === 'dark'
                    ? 'bg-card text-card-foreground border border-border/50'
                    : 'bg-white text-gray-800 border border-border/50 shadow-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Show suggested prompts only on initial state (no user messages yet) */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-8 space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Try these suggestions
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className={`p-3 rounded-lg text-left text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
                      : 'bg-white hover:bg-blue-50 text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 ${
              theme === 'dark' 
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
      <div className={`border-t p-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the web page you want to create..."
            className={`flex-1 px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm transform hover:scale-105 active:scale-95"
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
