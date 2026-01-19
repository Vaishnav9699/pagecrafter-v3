'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCode?: (format: 'html' | 'zip') => void;
}

type SettingsTab = 'General' | 'Export' | 'Privacy';

export default function SettingsModal({ isOpen, onClose, onExportCode }: SettingsModalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [exportFormat, setExportFormat] = useState<'html' | 'zip'>('html');

  if (!isOpen) return null;

  const handleExport = () => {
    onExportCode?.(exportFormat);
    onClose();
  };

  const tabs: { id: SettingsTab; icon: React.ReactNode }[] = [
    {
      id: 'General',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'Export',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    },
    {
      id: 'Privacy',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-[#12141c] border border-white/10' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-8 py-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : theme === 'dark'
                    ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {tab.icon}
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 min-h-[400px] max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'General' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  About PageCrafter
                </h3>
                <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-[#0f1117] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                      <span className="text-white font-black text-lg">PC</span>
                    </div>
                    <div>
                      <p className={`text-lg font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>PageCrafter AI</p>
                      <p className={`text-xs font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Version 2.0.0 "Aurora"</p>
                    </div>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    The next generation of AI-powered web development. Build, deploy, and scale beautiful websites using only your natural language. Crafted for developers and creators.
                  </p>
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  System Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">AI Engine</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Operational</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">API Latency</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>42ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Export' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Select Export Format
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportFormat('html')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${exportFormat === 'html'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : theme === 'dark'
                        ? 'border-white/5 hover:border-white/10 bg-[#0f1117]'
                        : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${exportFormat === 'html' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className={`text-base font-black tracking-tight ${exportFormat === 'html' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>HTML/CSS Bundle</p>
                    <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Single combined file</p>
                  </button>

                  <button
                    onClick={() => setExportFormat('zip')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${exportFormat === 'zip'
                      ? 'border-purple-500 bg-purple-500/5'
                      : theme === 'dark'
                        ? 'border-white/5 hover:border-white/10 bg-[#0f1117]'
                        : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${exportFormat === 'zip' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className={`text-base font-black tracking-tight ${exportFormat === 'zip' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>ZIP Package</p>
                    <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Full source project</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-500 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
              >
                Start Compilation
              </button>
            </div>
          )}

          {activeTab === 'Privacy' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Privacy & Data Policy
                </h3>
                <div className="space-y-6">
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0f1117] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <p className={`font-black text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Data Encryption</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-500">
                      All project code, messages, and API keys are encrypted at rest using industry-standard AES-256 encryption. We never store your API keys in plain text.
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0f1117] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className={`font-black text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Usage Policy</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-500">
                      We use Google Gemini to generate code. Your prompts are sent directly to Google's API. No personal data from your profile is shared with AI providers unless explicitly part of your prompt.
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0f1117] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </div>
                      <p className={`font-black text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Right to Deletion</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-500">
                      You have full control over your data. Deleting a project permanently removes all associated code and chat history from our servers immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
