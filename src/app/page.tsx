'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import NewProjectModal from './components/NewProjectModal';
import UserMenu from './components/UserMenu';
import PPTPanel from './components/PPTPanel';
import PPTPreview from './components/PPTPreview';
import {
  getProjects,
  createProject as createProjectInDb,
  deleteProject as deleteProjectInDb,
  updateProjectCode as updateProjectCodeInDb,
  replaceProjectMessages,
  Project,
} from '../lib/supabaseOperations';


export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) setStoredApiKey(key);
  }, [apiKeyModalOpen]);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isNewProjectAdvanced, setIsNewProjectAdvanced] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState({
    html: '<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"><div class="text-center text-white p-8 rounded-lg bg-black bg-opacity-20 backdrop-blur-sm"></div></div>',
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
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsInitialLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [pptSlides, setPptSlides] = useState<any[]>([]);
  const [isPPTLoading, setIsPPTLoading] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('Account');
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat'); // Mobile toggle between chat and preview
  const [generatedPages, setGeneratedPages] = useState<Record<string, { title: string; html: string; css: string; js: string; }> | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);

  // Load projects from Supabase when user is authenticated
  useEffect(() => {
    async function loadProjects() {
      if (authLoading || !user) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          setCurrentProject(fetchedProjects[0]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadProjects();
  }, [user, authLoading]);

  // Update generated code when current project changes
  useEffect(() => {
    if (currentProject?.lastGeneratedCode) {
      setGeneratedCode(currentProject.lastGeneratedCode);
      setHasGeneratedCode(true);
    } else {
      setHasGeneratedCode(false);
    }
  }, [currentProject]);

  // Close share/download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (downloadMenuOpen && !target.closest('.download-menu-container')) {
        setDownloadMenuOpen(false);
      }
      if (shareMenuOpen && !target.closest('.share-menu-container')) {
        setShareMenuOpen(false);
      }
    };

    if (downloadMenuOpen || shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [downloadMenuOpen, shareMenuOpen]);

  // Falling stars effect disabled to prevent screen flickering
  // The effect was creating new DOM elements every 200ms with infinite animations
  /*
  useEffect(() => {
    if (activeTab === 'projects') {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;

      // Clear existing stars
      starsContainer.innerHTML = '';

      const createStar = () => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
          position: absolute;
          width: 2px;
          height: 2px;
          background: ${theme === 'dark' ? '#ffffff' : '#4f46e5'};
          border-radius: 50%;
          pointer-events: none;
          animation: fall ${Math.random() * 3 + 2}s linear infinite;
          left: ${Math.random() * 100}%;
          top: -10px;
          opacity: ${Math.random() * 0.8 + 0.2};
        `;
        starsContainer.appendChild(star);

        // Remove star after animation
        setTimeout(() => {
          if (star.parentNode) {
            star.parentNode.removeChild(star);
          }
        }, 5000);
      };

      // Create stars at intervals
      const interval = setInterval(createStar, 200);

      // Add CSS animation if not exists
      if (!document.getElementById('star-animation')) {
        const style = document.createElement('style');
        style.id = 'star-animation';
        style.textContent = `
          @keyframes fall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      return () => {
        clearInterval(interval);
        if (starsContainer) {
          starsContainer.innerHTML = '';
        }
      };
    }
  }, [activeTab, theme]);
  */

  const handleCodeGeneration = async (code: typeof generatedCode, pages?: Record<string, { title: string; html: string; css: string; js: string }> | null) => {
    setGeneratedCode(code);
    setGeneratedPages(pages || undefined);
    setHasGeneratedCode(true);

    // Also save to current project's lastGeneratedCode if a project is active
    if (currentProject) {
      setProjects(prev => prev.map(p =>
        p.id === currentProject.id ? { ...p, lastGeneratedCode: code } : p
      ));
      // Save to Supabase
      await updateProjectCodeInDb(currentProject.id, code);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setSidebarOpen(false);
    setActiveView('chat');
  };

  const handleNewProject = (advanced = false) => {
    setIsNewProjectAdvanced(advanced);
    setNewProjectModalOpen(true);
  };

  const handleCreateProject = async (name: string, description: string, settings?: any) => {
    try {
      const newProject = await createProjectInDb(name, description || undefined);
      if (newProject) {
        setProjects(prev => [newProject, ...prev]);
        setCurrentProject(newProject);
        setNewProjectModalOpen(false);
        setSidebarOpen(false);
        setMobileView('chat');
        setActiveView('chat');
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const success = await deleteProjectInDb(projectId);
    if (success) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setCurrentProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
    }
  };

  const handleMessagesUpdate = async (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    if (currentProject) {
      setProjects(prev => prev.map(p =>
        p.id === currentProject.id ? { ...p, messages } : p
      ));
      // Save messages to Supabase
      await replaceProjectMessages(currentProject.id, messages);
    }
  };

  const handleCodeUpdate = async (code: { html: string; css: string; js: string }) => {
    if (currentProject) {
      setProjects(prev => prev.map(p =>
        p.id === currentProject.id ? { ...p, lastGeneratedCode: code } : p
      ));
      // Save code to Supabase
      await updateProjectCodeInDb(currentProject.id, code);
    }
  };

  const handleShareToGitHub = (project: Project) => {
    // Create a GitHub Gist with the project data
    const gistData = {
      description: `PageCrafter Project: ${project.name}`,
      public: true,
      files: {
        'project.json': {
          content: JSON.stringify({
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            messages: project.messages,
            lastGeneratedCode: project.lastGeneratedCode,
            files: project.files
          }, null, 2)
        },
        'README.md': {
          content: `# ${project.name}

${project.description || 'A web project created with PageCrafter AI'}

## Project Details
- Created: ${project.createdAt.toLocaleDateString()}
- Messages: ${project.messages.length}
- Files: ${project.files.length}

## Generated Code
${project.lastGeneratedCode ? 'This project contains generated HTML, CSS, and JavaScript code.' : 'No code has been generated yet.'}

*Created with [PageCrafter AI](https://pagecrafter.ai)*
`
        }
      }
    };

    // Open GitHub Gist creation page with pre-filled data
    const gistUrl = `https://gist.github.com/new?description=${encodeURIComponent(gistData.description)}&public=${gistData.public}`;
    window.open(gistUrl, '_blank');
  };

  const handleExportCode = (format: 'html' | 'zip', projectToExport?: Project) => {
    // Use provided project, or current project's last generated code, or fall back to current generated code
    const targetProject = projectToExport || currentProject;
    const codeToExport = targetProject?.lastGeneratedCode || generatedCode;

    if (!codeToExport) return;

    const { html, css, js } = codeToExport;
    const projectName = targetProject?.name || 'PageCrafter Project';

    if (format === 'html') {
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>${css || ''}</style>
</head>
<body>
    ${html}
    <script>${js || ''}</script>
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'zip') {
      // Dynamic import for JSZip to avoid server-side issues
      import('jszip').then(({ default: JSZip }) => {
        const zip = new JSZip();

        // Add main index.html file
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>${css || ''}</style>
</head>
<body>
    ${html}
    <script>${js || ''}</script>
</body>
</html>`;
        zip.file('index.html', htmlContent);

        // Add separate CSS file
        zip.file('styles.css', css || '/* CSS Code */');

        // Add separate JavaScript file
        zip.file('script.js', js || '/* JavaScript Code */');

        // Add all other files from the project
        if (targetProject && targetProject.files && targetProject.files.length > 0) {
          targetProject.files.forEach(file => {
            let extension = '';
            if (file.type === 'html') extension = '.html';
            else if (file.type === 'css') extension = '.css';
            else if (file.type === 'js') extension = '.js';

            // Avoid overwriting main files if names conflict, though unlikely with standard naming
            let fileName = file.name;
            if (!fileName.endsWith(extension)) {
              fileName += extension;
            }

            zip.file(fileName, file.content);
          });
        }

        // Generate ZIP and download
        zip.generateAsync({ type: 'blob' }).then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectName}.zip`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }).catch((error) => {
        console.error('Error generating ZIP:', error);
        alert('Failed to generate ZIP file. Please try the HTML format instead.');
      });
    }
  };

  return (
    <div className={`relative flex flex-col h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 border-b ${theme === 'dark' ? 'bg-[#0f1117] border-gray-800' : 'bg-white border-gray-200'} z-[100] shadow-sm`}>
        <div className="flex items-center gap-8 flex-1">
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 ${activeView === 'chat' ? 'bg-indigo-500' : ''}`}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight hidden sm:block`}>
              PageCrafter
            </h1>
          </div>

          {activeView !== 'chat' ? (
            /* Search Bar for general views */
            <div className="hidden md:flex items-center relative flex-1 max-w-[500px]">
              <svg className="absolute left-4 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects, templates, or commands (Cmd+K)"
                className={`w-full pl-11 pr-4 py-2.5 rounded-2xl text-sm border transition-all ${theme === 'dark' ? 'bg-[#1a1c23]/80 border-gray-800/50 text-gray-300 focus:border-indigo-500 focus:bg-[#1a1c23]' : 'bg-gray-100/80 border-gray-200/50 text-gray-900 focus:border-indigo-500 focus:bg-white'} outline-none shadow-inner`}
              />
            </div>
          ) : (
            /* Project Title for Chat View */
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                  {currentProject?.name || 'Untitled Project'}
                </span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeView !== 'chat' ? (
            <>
              {/* Theme Toggle */}
              <div className={`flex items-center p-1 rounded-2xl ${theme === 'dark' ? 'bg-[#1a1c23]' : 'bg-gray-100'} border border-gray-800/30`}>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`p-1.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-white shadow-xl text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`p-1.5 rounded-xl transition-all ${theme === 'light' ? 'bg-white shadow-xl text-indigo-600' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                </button>
              </div>

              <button
                onClick={() => setApiKeyModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800/50 text-gray-400 hover:text-white hover:border-indigo-500/50 shadow-lg shadow-black/40' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 shadow-sm'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                <span className="hidden sm:inline">API Key</span>
              </button>

              <button
                onClick={() => setActiveView('settings')}
                className={`p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800/50 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </>
          ) : (
            <>
              {/* Project Specific Actions */}
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all shadow-lg active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>

              <div className="relative share-menu-container">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 transition-all hover:border-white/20 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Share
                </button>

                {shareMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden border animate-fade-in ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} z-[200]`}>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          handleExportCode('zip');
                          setShareMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                          <span>Export .ZIP</span>
                          <span className="text-[10px] text-gray-600 font-medium">Download all source files</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/project/${currentProject?.id}`;
                          navigator.clipboard.writeText(url);
                          alert('Project link copied to clipboard!');
                          setShareMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 11-5.656-5.656l-1.102 1.101" /></svg>
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                          <span>Copy Link</span>
                          <span className="text-[10px] text-gray-600 font-medium">Shareable view-only link</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          if (currentProject) handleShareToGitHub(currentProject);
                          setShareMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                          <span>Post to Gist</span>
                          <span className="text-[10px] text-gray-600 font-medium">Share on GitHub</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                Publish
              </button>
            </>
          )}

        </div>

        <UserMenu />
      </header>

      {/* Main Content Area - Add padding-top to account for fixed header and tabs */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden pt-[60px]">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          activeView={activeView}
          onViewChange={setActiveView}
          isCollapsed={sidebarCollapsed}
        />

        {/* Main Content */}
        <div
          className="flex flex-col md:flex-row flex-1 relative w-full"
          onMouseEnter={() => setSidebarCollapsed(true)}
          onMouseLeave={() => setSidebarCollapsed(false)}
        >
          {activeView === 'chat' ? (
            /* Chat View */
            <div className={`flex flex-col md:flex-row flex-1 relative w-full h-full overflow-hidden`}>
              <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-col w-full ${hasGeneratedCode || isLoading ? 'md:w-1/2' : 'max-w-5xl mx-auto'} h-full overflow-hidden transition-all duration-300`}>
                <ChatPanel
                  onCodeGenerated={handleCodeGeneration}
                  onLoadingChange={setIsLoading}
                  currentProject={currentProject}
                  onMessagesUpdate={handleMessagesUpdate}
                  onCodeUpdate={handleCodeUpdate}
                  onShowSettings={() => setSettingsOpen(true)}
                  onShowHistory={() => {/* TODO: Show history modal */ }}
                  onBack={() => setActiveView('dashboard')}
                />
              </div>
              {(hasGeneratedCode || isLoading) && (
                <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2 h-full overflow-hidden border-l ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                  <PreviewPanel code={generatedCode} pages={generatedPages} isVisible={hasGeneratedCode} isLoading={isLoading} />
                </div>
              )}
            </div>
          ) : activeView === 'ppt' ? (
            /* PPT View */
            <div className="flex flex-col md:flex-row flex-1 relative w-full h-full overflow-hidden">
              <div className={`flex flex-col w-full md:w-1/3 h-full overflow-hidden transition-all duration-300 border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <PPTPanel
                  onPPTGenerated={setPptSlides}
                  onLoadingChange={setIsPPTLoading}
                  onBack={() => setActiveView('dashboard')}
                />
              </div>
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                <PPTPreview slides={pptSlides} isLoading={isPPTLoading} />
              </div>
            </div>
          ) : (
            /* Main Content Views */
            <div className={`flex-1 flex flex-col relative overflow-y-auto ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>
              <div className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-6xl mx-auto">

                  {activeView === 'dashboard' && (
                    <div className="flex flex-col h-full animate-fade-in gap-12 pb-10">
                      {/* Dashboard Hero / AI Matchmaker */}
                      <div className="flex flex-col items-center text-center gap-8 pt-6">
                        <div className="space-y-2">
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Quick Start</span>
                          <h2 className="text-5xl font-black text-white tracking-tighter">What will you build today?</h2>
                        </div>

                        <div className="w-full max-w-[700px] relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                          <div className="relative flex items-center bg-[#0f1117] border border-white/10 rounded-2xl px-5 py-4 shadow-2xl">
                            <svg className="w-5 h-5 text-indigo-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                              type="text"
                              placeholder="Describe your vision (e.g., A minimalist furniture store)..."
                              className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-500 font-medium tracking-tight"
                            />
                            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                              <svg className="w-4 h-4 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mode Selection Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-4">
                        <button
                          onClick={() => handleNewProject(false)}
                          className="group relative flex flex-col items-center p-10 rounded-[2.5rem] bg-[#1a1c23]/60 backdrop-blur-md border border-white/5 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl hover:-translate-y-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2 text-center">Basic Mode</h3>
                          <p className="text-gray-500 text-sm font-medium text-center">Quick AI generation for landing pages</p>
                        </button>

                        <button
                          onClick={() => handleNewProject(true)}
                          className="group relative flex flex-col items-center p-10 rounded-[2.5rem] bg-[#1a1c23]/60 backdrop-blur-md border border-white/5 hover:border-purple-500/50 transition-all duration-500 shadow-2xl hover:-translate-y-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-20 h-20 rounded-3xl bg-purple-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2 text-center">Advanced Mode</h3>
                          <p className="text-gray-500 text-sm font-medium text-center">Full control over components</p>
                        </button>

                        <button
                          onClick={() => setActiveView('ppt')}
                          className="group relative flex flex-col items-center p-10 rounded-[2.5rem] bg-[#1a1c23]/60 backdrop-blur-md border border-white/5 hover:border-orange-500/50 transition-all duration-500 shadow-2xl hover:-translate-y-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-20 h-20 rounded-3xl bg-orange-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3h20M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3m4 18 5-5 5 5m-5-5v5" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2 text-center">PPT Make</h3>
                          <p className="text-gray-500 text-sm font-medium text-center">Create stunning presentations with AI</p>
                        </button>
                      </div>

                      {/* Recent Projects Minimalist Grid */}
                      {projects.length > 0 && (
                        <div className="max-w-6xl mx-auto w-full px-4 space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Recent Projects</h3>
                            <button onClick={() => setActiveView('projects')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">View All</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {projects.slice(0, 4).map((project) => (
                              <div
                                key={project.id}
                                onClick={() => { setCurrentProject(project); setActiveView('chat'); }}
                                className="group flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer shadow-xl active:scale-[0.98]"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                                  {project.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-bold text-sm truncate">{project.name}</h4>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(project.createdAt).toLocaleDateString()}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeView === 'projects' && (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">Your Projects</h2>
                          <p className="text-gray-400">Manage and edit your generated websites</p>
                        </div>
                        <button
                          onClick={() => handleNewProject(false)}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                        >
                          + New Project
                        </button>
                      </div>

                      {projects.length === 0 ? (
                        <div className="text-center py-20 bg-[#1a1c23] border border-gray-800 rounded-3xl">
                          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                          <p className="text-gray-500 mb-8">Create your first project to start building</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projects.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => {
                                setCurrentProject(project);
                                setActiveView('chat');
                              }}
                              className="group p-6 rounded-3xl bg-[#1a1c23] border border-gray-800 hover:border-indigo-500/50 transition-all cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-md">{project.messages.length} chats</span>
                                </div>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2 truncate">{project.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description || 'No description provided'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span>Active</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeView === 'community' && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Community Hub</h2>
                        <div className="flex bg-[#1a1c23] p-1.5 rounded-2xl border border-gray-800/50 shadow-inner shadow-black/40">
                          {['Featured', 'Trending', 'Latest', 'Remixable'].map((tab) => (
                            <button
                              key={tab}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tab === 'Featured' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Featured Project of the Week */}
                      <div className="relative h-[340px] rounded-[2.5rem] overflow-hidden border border-gray-800/50 group shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/70 to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />

                        <div className="relative z-20 h-full flex flex-col justify-center px-14 max-w-2xl">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Featured Project of the Week
                          </div>
                          <h3 className="text-5xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                            AI Generated <br /><span className="gradient-text">E-commerce Site</span>
                          </h3>
                          <div className="flex items-center gap-5">
                            <button className="px-10 py-4-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-sm rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              Remix This Project
                            </button>
                            <button className="px-10 py-4.5 bg-white/5 backdrop-blur-2xl border border-white/10 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition-all border-b-white/20">
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Project Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                          { title: 'Neon Portfolio', user: 'AlexD', color: 'from-fuchsia-600 to-purple-600', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60' },
                          { title: 'SaaS Landing', user: 'SarahK', color: 'from-blue-600 to-indigo-600', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60' },
                          { title: 'Blog Template', user: 'MikeR', color: 'from-emerald-600 to-teal-600', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60' },
                          { title: '3D Showcase', user: 'EmilyW', color: 'from-orange-600 to-red-600', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60' }
                        ].map((project, idx) => (
                          <div key={idx} className="group flex flex-col bg-[#1a1c23]/40 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-gray-800/50 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl hover:-translate-y-2">
                            <div className="relative h-56 overflow-hidden">
                              <img src={project.img} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent opacity-60" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[4px]">
                                <button className="px-8 py-3 bg-white text-black font-black text-xs rounded-2xl shadow-2xl hover:scale-110 transition-transform active:scale-95 uppercase tracking-widest">
                                  Preview Live
                                </button>
                              </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${project.color} flex items-center justify-center text-xs font-black text-white shadow-lg`}>
                                  {project.user[0]}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <h4 className="text-white font-bold text-sm truncate tracking-tight">{project.title}</h4>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">by @{project.user}</span>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <svg className="w-4 h-4 text-gray-600 group-hover:text-rose-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
                                    <span className="text-[9px] font-black text-gray-600">12</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-0.5">
                                    <svg className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path></svg>
                                    <span className="text-[9px] font-black text-gray-600">8</span>
                                  </div>
                                </div>
                              </div>
                              <button className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-xs rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/10 active:scale-95 uppercase tracking-widest">
                                Remix
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeView === 'templates' && (
                    <div className="flex flex-col h-full animate-fade-in group/templates">
                      {/* Top AI Search Bar */}
                      <div className="p-8 pb-6">
                        <div className="max-w-[700px] mx-auto relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                          <div className="relative flex items-center bg-[#0f1117] border border-white/10 rounded-2xl px-5 py-4 shadow-2xl">
                            <svg className="w-5 h-5 text-indigo-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                              type="text"
                              placeholder="AI Matchmaker: Describe your business (e.g., Yoga studio in Bali)..."
                              className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-500 font-medium tracking-tight"
                            />
                            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                              <svg className="w-4 h-4 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-8">
                        {/* Side Filters */}
                        <div className="w-64 h-full overflow-y-auto pr-6 hidden lg:flex flex-col gap-8 custom-scrollbar border-r border-white/5">
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Free / Premium</span>
                            <div className="flex items-center gap-1 opacity-60">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              <div className="w-9 h-5 bg-indigo-600/40 rounded-full relative cursor-pointer border border-indigo-500/30">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-6">
                            <h3 className="text-[11px] font-black text-white/40 px-2 uppercase tracking-[0.2em]">Filter By</h3>

                            <div className="flex flex-col gap-1">
                              <button className="flex items-center justify-between px-3 py-2 text-xs font-black text-white bg-white/5 rounded-xl border border-white/5 group">
                                INDUSTRY
                                <svg className="w-4 h-4 text-gray-600 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <div className="flex flex-col gap-1 py-2">
                                {['SaaS', 'Hospitality', 'Professional Services', 'Creative', 'Retail'].map(item => (
                                  <button key={item} className="text-left px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-all hover:translate-x-1">{item}</button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                              <button className="flex items-center justify-between px-3 py-2 text-xs font-black text-white group">
                                PAGE TYPE
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <div className="px-4 py-2">
                                <button className="text-left text-xs font-bold text-gray-500 hover:text-white transition-all">Multi-Page Site</button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                              <button className="flex items-center justify-between px-3 py-2 text-xs font-black text-white group">
                                FEATURES
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <div className="flex flex-col gap-1 py-2">
                                {['Dark Mode', 'Payment', 'Login', '3D / WebGL', 'CMS Ready', 'Interactive'].map(item => (
                                  <button key={item} className="text-left px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-all hover:translate-x-1">{item}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Templates Grid */}
                        <div className="flex-1 h-full overflow-y-auto custom-scrollbar pr-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                              { name: 'SaaS Dark Mode', tags: ['SaaS', 'E-commerce', 'Portfolio'], img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', badge: 'Trending', badgeColor: 'bg-orange-500' },
                              { name: '3D Product Float', tags: ['Modern', 'Minimalist', 'Portfolio'], img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', badge: 'New', badgeColor: 'bg-cyan-500' },
                              { name: 'Bento Grid Portfolio', tags: ['SaaS', 'E-commerce', 'Portfolio'], img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', badge: 'Premium', badgeColor: 'bg-amber-500' },
                              { name: 'Glitch Agency', tags: ['SaaS', 'E-commerce'], img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' },
                              { name: 'Bento Grid Portfolio', tags: ['SaaS', 'Portfolio', 'Cyberpunk'], img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800' },
                              { name: 'Glitch Agency', tags: ['SaaS', 'Minimalist'], img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800' },
                              { name: 'Trust Medical/Law', tags: ['Modern', 'Portfolio'], img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' },
                              { name: 'Retro Blog', tags: ['SaaS', 'Minimalist'], img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' },
                            ].map((template, idx) => (
                              <div key={idx} className="group flex flex-col bg-[#1a1c23]/60 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl">
                                <div className="relative h-44 overflow-hidden">
                                  <img src={template.img} alt={template.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-black/20" />
                                  {template.badge && (
                                    <div className={`absolute top-4 right-4 ${template.badgeColor} text-[9px] font-black text-white px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg`}>
                                      {template.badge}
                                    </div>
                                  )}
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <h4 className="text-white font-black text-sm tracking-tight">{template.name}</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {template.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{tag}</span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                      Preview
                                    </button>
                                    <button className="flex-[1.5] py-2.5 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest">
                                      Use Template
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'assets' && (
                    <div className="space-y-8 animate-fade-in pb-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Assets Library</h2>

                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-900/40">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload Asset
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-[#1a1c23] border border-gray-800 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            New Folder
                          </button>
                          <div className="relative group">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full md:w-64 pl-11 pr-4 py-3 bg-[#1a1c23] border border-gray-800 rounded-2xl text-sm text-white focus:border-purple-500/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Folder Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { name: 'Images', files: 196, color: 'text-blue-500' },
                          { name: 'Icons', files: 60, color: 'text-emerald-500' },
                          { name: 'Fonts', files: 7, color: 'text-purple-500' },
                          { name: 'Brand Kit', files: 3, color: 'text-rose-500' },
                        ].map((folder, idx) => (
                          <div key={idx} className="group bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 hover:border-purple-500/50 transition-all cursor-pointer shadow-xl">
                            <div className="w-full aspect-[4/3] bg-black/20 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                              <svg className={`w-16 h-16 ${folder.color} opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white">{folder.name}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{folder.files} files</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* File Details Table */}
                      <div className="bg-[#1a1c23]/60 backdrop-blur-md rounded-[2.5rem] border border-gray-800/50 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-800/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">File</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Name <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg></th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Size</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/30">
                              {[
                                { name: 'Hero.jpg', type: 'Hero.jpg', size: '25.2 MB', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60' },
                                { name: 'Logo.svg', type: 'Logo.svg', size: '427.0 KB', brand: true },
                                { name: 'MainFont.ttf', type: 'MainFont.ttf', size: '3.88 KB', font: true },
                                { name: 'Post-1.png', type: 'Post-1.png', size: '1.2 MB', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=60' },
                                { name: 'Contact-bg.webp', type: 'Contact-bg.webp', size: '840.4 KB', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=60' }
                              ].map((file, idx) => (
                                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                  <td className="px-8 py-4">
                                    <div className="w-12 h-12 rounded-xl border border-gray-800/50 overflow-hidden flex items-center justify-center bg-black/20">
                                      {file.img ? (
                                        <img src={file.img} alt="" className="w-full h-full object-cover" />
                                      ) : file.brand ? (
                                        <div className="w-full h-full bg-purple-600 flex items-center justify-center text-xs font-black text-white">P</div>
                                      ) : (
                                        <div className="text-[10px] font-black text-gray-600 uppercase">Aa</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-8 py-4">
                                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{file.name}</span>
                                  </td>
                                  <td className="px-8 py-4">
                                    <span className="text-sm text-gray-500 font-sans tracking-tight">{file.type}</span>
                                  </td>
                                  <td className="px-8 py-4">
                                    <span className="text-sm text-gray-500 font-sans tracking-tight">{file.size}</span>
                                  </td>
                                  <td className="px-8 py-4 text-right">
                                    <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'groups' && (
                    <div className="max-w-4xl mx-auto py-10">
                      <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Team Workspaces</h2>
                        <p className="text-gray-400">Collaborate with your team in real-time</p>
                      </div>

                      <div className="bg-[#1a1c23] rounded-3xl border border-gray-800 p-10 text-center">
                        <div className="w-24 h-24 rounded-full bg-indigo-600/10 flex items-center justify-center mx-auto mb-6">
                          <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Create a new group</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                          Groups allow you to share projects, assets, and templates with specific team members for better collaboration.
                        </p>
                        <button className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20">
                          Initialize Workspace
                        </button>
                      </div>
                    </div>
                  )}

                  {(activeView === 'settings' || activeView.startsWith('settings-')) && (
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
                      <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Settings</h2>

                        {/* Settings Tabs */}
                        <div className="flex items-center gap-1 border-b border-gray-800/50 pb-px">
                          {['Account', 'Team', 'Billing', 'API & Integrations', 'Appearance', 'Privacy'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setSettingsTab(tab)}
                              className={`px-6 py-4 text-sm font-bold transition-all relative ${settingsTab === tab
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                              {tab}
                              {settingsTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {settingsTab === 'Account' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                          {/* Profile Picture Card */}
                          <div className="lg:col-span-1 bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Profile Picture</h3>
                            <div className="flex flex-col items-center gap-4">
                              <div className="relative group">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-purple-500/20 group-hover:border-purple-500/50 transition-all">
                                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-purple-600 rounded-xl shadow-xl hover:scale-110 transition-transform">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>
                              </div>
                              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Profile
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <input type="text" placeholder="Full Name" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input type="email" placeholder="namin@gmail.com" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                  <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
                                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  </button>
                                </div>
                              </div>
                              <button className="w-full py-3.5 bg-purple-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Edit Password
                              </button>
                              <div className="pt-4 border-t border-gray-800/50">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Delete Account</label>
                                <button className="w-full py-3 border border-red-500/30 text-red-500 font-bold text-xs rounded-xl hover:bg-red-500/10 transition-all">
                                  Delete Account
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Members Card */}
                          <div className="lg:col-span-1 bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Members</h3>
                            <div className="space-y-1">
                              {[
                                { name: 'Lohent K.', count: 18, img: 'https://i.pravatar.cc/150?u=1' },
                                { name: 'Kaline Adatt', count: 15, img: 'https://i.pravatar.cc/150?u=2' },
                                { name: 'Nichan J.', count: 7, img: 'https://i.pravatar.cc/150?u=3' },
                              ].map((m, i) => (
                                <button key={i} className="w-full group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all">
                                  <img src={m.img} className="w-10 h-10 rounded-xl" alt="" />
                                  <div className="flex flex-col items-start min-w-0">
                                    <span className="text-sm font-bold text-white truncate">{m.name}</span>
                                    <span className="text-[10px] text-gray-500">{m.count} members</span>
                                  </div>
                                  <svg className="ml-auto w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                              ))}
                            </div>
                            <button className="w-full mt-auto py-3.5 bg-purple-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                              Invite Member
                            </button>
                          </div>

                          {/* Billing & Plans */}
                          <div className="lg:col-span-1 bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Plan</h3>
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-white">Current Inn</span>
                                <span className="text-sm text-gray-500">$30.99 <span className="text-[10px] opacity-50 font-sans tracking-normal">(Per month)</span></span>
                              </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Payment Method</h3>
                              <button className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:bg-black/30 transition-all">
                                <div className="flex flex-col items-start font-sans">
                                  <span className="text-sm font-bold text-white">PayPad</span>
                                  <span className="text-[10px] text-gray-500">$357.00</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-800/50 flex flex-col flex-1">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Invoice History</h3>
                              <div className="space-y-4 py-2">
                                {[
                                  { date: 'Jan 11, 2022', amount: '$1089' },
                                  { date: 'Sep 11, 2022', amount: '$1000' },
                                  { date: 'Aug 18, 2022', amount: '$1050' },
                                ].map((inv, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-gray-500">{inv.date}</span>
                                    <span className="text-white font-bold">{inv.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* API & Integration */}
                          <div className="lg:col-span-1 bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">API Key</h3>
                              <div className="relative group">
                                <div className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 text-xs text-gray-500 font-mono tracking-widest truncate">
                                  {storedApiKey ? `••••${storedApiKey.slice(-4)}` : '••••••••••••••••••••'}
                                </div>
                                <button
                                  onClick={() => {
                                    if (storedApiKey) {
                                      navigator.clipboard.writeText(storedApiKey);
                                      // Optional: Add toast or feedback
                                    }
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                                  title="Copy API Key"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                </button>
                              </div>
                              <button
                                onClick={() => setApiKeyModalOpen(true)}
                                className="w-full py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                              >
                                Manage API Key
                              </button>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-800/50 flex-1">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Connected Apps</h3>
                              <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all group">
                                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                  </div>
                                  <span className="text-sm font-bold text-white">GitHub</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Appearance Card */}
                          <div className="lg:col-span-1 bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Theme</h3>
                              <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
                                <button
                                  onClick={() => theme !== 'dark' && toggleTheme()}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                  <span className="text-xs font-bold">Dark</span>
                                </button>
                                <button
                                  onClick={() => theme === 'dark' && toggleTheme()}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${theme !== 'dark' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                  <span className="text-xs font-bold">Light</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Accent Color</h3>
                              <div className="flex items-center gap-2.5">
                                {[
                                  'bg-purple-500 border-2 border-white',
                                  'bg-gray-700',
                                  'bg-emerald-500',
                                  'bg-blue-600',
                                  'bg-rose-500'
                                ].map((c, i) => (
                                  <button key={i} className={`w-7 h-7 rounded-lg ${c} shadow-lg hover:scale-110 transition-transform`}>
                                    {i === 0 && <svg className="w-3.5 h-3.5 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'Privacy' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                          <div className="bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              </div>
                              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Data Encryption</h3>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              All project code, messages, and API keys are encrypted at rest using industry-standard AES-256 encryption. We never store your API keys in plain text format on our servers.
                            </p>
                          </div>

                          <div className="bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Usage Policy</h3>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              We use Google Gemini to generate your website code. Your prompts are sent directly to the AI. No personal authentication data is shared with AI providers unless explicitly part of your prompt.
                            </p>
                          </div>

                          <div className="bg-[#1a1c23]/60 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </div>
                              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Data Deletion</h3>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              You maintain full ownership of your data. Deleting a project permanently and immediately removes all associated code, files, and chat logs from our production database.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onExportCode={handleExportCode}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        initialAdvanced={isNewProjectAdvanced}
        showAdvancedOption={isNewProjectAdvanced}
      />
    </div>
  );
}
