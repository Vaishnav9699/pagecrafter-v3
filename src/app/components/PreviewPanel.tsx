'use client';

import { useEffect, useRef, useState } from 'react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePage, setActivePage] = useState('home');

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
  }, [code, activePage, pages]);

  // Initialize activePage to first page when pages are loaded
  useEffect(() => {
    if (pages && Object.keys(pages).length > 0) {
      const firstPageKey = Object.keys(pages)[0];
      if (activePage !== firstPageKey) {
        setActivePage(firstPageKey);
      }
    }
  }, [pages]);

  return (
    <div className={`flex flex-col h-full overflow-y-scroll transition-all duration-500 ease-in-out transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } md:w-1/2 w-full absolute right-0 top-12 bg-background border-l border-border z-0`}>
      {/* Page Navigation */}
      {pages && Object.keys(pages).length > 1 && (
        <div className="flex border-b border-border bg-card">
          {Object.entries(pages).map(([pageKey, pageData]) => (
            <button
              key={pageKey}
              onClick={() => setActivePage(pageKey)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activePage === pageKey
                  ? 'text-primary border-b-2 border-primary bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {pageData.title}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="w-full max-w-md space-y-6">
              {/* Skeleton Header */}
              <div className="space-y-3">
                <div className="h-8 bg-gray-300 rounded-lg animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded-lg animate-pulse w-full"></div>
                <div className="h-4 bg-gray-300 rounded-lg animate-pulse w-5/6"></div>
              </div>

              {/* Skeleton Content */}
              <div className="space-y-4 pt-4">
                <div className="h-4 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-40 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>

              {/* Loading Text */}
              <div className="flex items-center justify-center space-x-3 pt-4">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        ) : !code.html ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="text-center max-w-sm">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-300 mx-auto mb-4 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => iframeRef.current?.requestFullscreen()}
              className="absolute top-2 right-2 p-2 bg-card hover:bg-accent rounded-md z-10"
              title="Fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </>
        )}
      </div>
    </div>
  );
}
