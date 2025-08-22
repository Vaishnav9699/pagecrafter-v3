'use client';

import { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';

export default function Home() {
  const { theme } = useTheme();
  const [generatedCode, setGeneratedCode] = useState({
    html: '<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"><div class="text-center text-white p-8 rounded-lg bg-black bg-opacity-20 backdrop-blur-sm"><h1 class="text-5xl font-bold mb-4">Welcome to PageCrafter</h1><p class="text-xl mb-6 opacity-90">Ask me to create something amazing!</p><div class="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full text-sm">✨ AI-Powered Web Development</div></div></div>',
    css: `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
      }
      
      .backdrop-blur-sm {
        backdrop-filter: blur(4px);
      }
    `,
    js: `
      // Add some interactive sparkles
      document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('.text-center');
        if (container) {
          container.addEventListener('mousemove', function(e) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const sparkle = document.createElement('div');
            sparkle.style.cssText = \`
              position: absolute;
              left: \${x}px;
              top: \${y}px;
              width: 4px;
              height: 4px;
              background: white;
              border-radius: 50%;
              pointer-events: none;
              animation: sparkle 1s ease-out forwards;
            \`;
            
            container.style.position = 'relative';
            container.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
          });
        }
      });
      
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(180deg); opacity: 0; }
        }
      \`;
      document.head.appendChild(style);
    `
  });

  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  const handleCodeGeneration = (code: typeof generatedCode) => {
    setGeneratedCode(code);
    setHasGeneratedCode(true);
  };

  return (
    <div className={`relative flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Chat Panel */}
      <ChatPanel onCodeGenerated={handleCodeGeneration} />
      
      {/* Preview Panel */}
      <PreviewPanel code={generatedCode} isVisible={hasGeneratedCode} />
    </div>
  );
}
