'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCode?: (format: 'html' | 'zip') => void;
}

export default function SettingsModal({ isOpen, onClose, onExportCode }: SettingsModalProps) {
  const { theme } = useTheme();
  const [exportFormat, setExportFormat] = useState<'html' | 'zip'>('html');

  if (!isOpen) return null;

  const handleExport = () => {
    onExportCode?.(exportFormat);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Export Options */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Export
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Export Format
                </label>
                <div className="mt-2 space-x-4 flex flex-wrap">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="html"
                      checked={exportFormat === 'html'}
                      onChange={(e) => setExportFormat(e.target.value as 'html')}
                      className="text-blue-600"
                    />
                    <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      HTML File
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="zip"
                      checked={exportFormat === 'zip'}
                      onChange={(e) => setExportFormat(e.target.value as 'zip')}
                      className="text-blue-600"
                    />
                    <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      ZIP Package
                    </span>
                  </label>
                </div>
              </div>
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Export Current Project
              </button>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              About
            </h3>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="mb-2">PageCrafter v1.0</p>
              <p>AI-powered web development assistant</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
