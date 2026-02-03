'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import HexagonalLoader from './HexagonalLoader';

interface PreviewPanelProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
  pages?: Record<string, { title: string; html: string; css: string; js: string }>;
  isVisible: boolean;
  isLoading?: boolean;
}

export default function PreviewPanel({ code, pages, isVisible, isLoading = false }: PreviewPanelProps) {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePage, setActivePage] = useState('home');
  const [showPreview, setShowPreview] = useState(!isLoading);

  // Sync showPreview with isLoading with a delay
  useEffect(() => {
    if (isLoading) {
      setShowPreview(false);
    } else {
      const timer = setTimeout(() => setShowPreview(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Function to update iframe content
  const updateIframeContent = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let fullHtml = '';

    if (pages && pages[activePage]) {
      const page = pages[activePage];
      fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title}</title>
          <style>
            ${page.css}
          </style>
        </head>
        <body>
          ${page.html}
          <script>
            ${page.js}
          </script>
        </body>
        </html>
      `;
    } else {
      fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>
            ${code.css}
          </style>
        </head>
        <body>
          ${code.html}
          <script>
            ${code.js}
          </script>
        </body>
        </html>
      `;
    }

    // Use data URL to avoid cross-origin issues, add timestamp to force reload
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml) + '#' + Date.now();
    iframe.src = '';
    iframe.src = dataUrl;
  };

  // Update when code or active page changes
  useEffect(() => {
    updateIframeContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, activePage, pages]);

  // Initialize activePage to first page when pages are loaded
  useEffect(() => {
    if (pages && Object.keys(pages).length > 0) {
      const firstPageKey = Object.keys(pages)[0];
      if (activePage !== firstPageKey) {
        setActivePage(firstPageKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} border-t md:border-t-0 md:border-l ${theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'} overflow-hidden`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800/50' : 'bg-white/80 border-gray-200/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Preview</h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Live preview of your code</p>
          </div>
        </div>
        {code.html && (
          <button
            onClick={() => iframeRef.current?.requestFullscreen()}
            className={`p-2.5 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
            title="Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Page Navigation */}
      {pages && Object.keys(pages).length > 1 && (
        <div className={`flex gap-1 px-4 py-2 border-b overflow-x-auto ${theme === 'dark' ? 'bg-gray-900 border-gray-800/50' : 'bg-gray-50 border-gray-200/50'}`}>
          {Object.entries(pages).map(([pageKey, pageData]) => (
            <button
              key={pageKey}
              onClick={() => setActivePage(pageKey)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activePage === pageKey
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {pageData.title}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {isLoading || !showPreview ? (
          <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ${!isLoading && showPreview ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl backdrop-blur-md bg-black/40 border border-white/5 animate-slide-up">
              <HexagonalLoader size={100} color="#6366f1" />
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-3xl font-black text-white tracking-tighter uppercase italic animate-pulse">
                  Querying Global Intelligence
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] opacity-80">
                    Sourcing related assets & documentation
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-1 w-8 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-indigo-500 animate-[loading-bar_1.5s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !code.html ? (
          <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50'}`}>
            <div className="text-center max-w-sm">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                <svg
                  className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No preview yet
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Start chatting to generate your first web page preview
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-1000">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
