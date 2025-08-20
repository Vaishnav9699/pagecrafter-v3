'use client';

import { useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface PreviewPanelProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
}

export default function PreviewPanel({ code }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;

      // Create the complete HTML document as a data URL
      const fullHtml = `
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

      // Use data URL to avoid cross-origin issues
      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml);
      iframe.src = dataUrl;
    }
  }, [code]);

  const renderCodeView = (language: string, content: string) => (
    <div className="h-full overflow-auto bg-card">
      <pre className="p-6 text-sm font-mono text-foreground h-full overflow-scroll">
        <code className="block">{content}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-scroll">
      {/* Header with tabs */}
      <div className="bg-card border-b border-border">
        <div className="flex">
          {['preview', 'html', 'css', 'js'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${activeTab === tab
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-slide-in" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white relative">
        {activeTab === 'preview' && (
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

        {activeTab === 'html' && (
          <SyntaxHighlighter language="html" style={docco}>
            {code.html}
          </SyntaxHighlighter>
        )}
        {activeTab === 'css' && (
          <SyntaxHighlighter language="css" style={docco}>
            {code.css}
          </SyntaxHighlighter>
        )}
        {activeTab === 'js' && (
          <SyntaxHighlighter language="javascript" style={docco}>
            {code.js}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
