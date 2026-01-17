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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
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
  const [activeTab, setActiveTab] = useState<'projects' | 'chat'>('projects');
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

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (downloadMenuOpen && !target.closest('.download-menu-container')) {
        setDownloadMenuOpen(false);
      }
    };

    if (downloadMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [downloadMenuOpen]);

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
  };

  const handleNewProject = () => {
    setNewProjectModalOpen(true);
  };

  const handleCreateProject = async (name: string, description: string) => {
    const newProject = await createProjectInDb(name, description || undefined);
    if (newProject) {
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      setSidebarOpen(false);
      setActiveTab('chat');
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
      <header className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800/50' : 'bg-white/80 border-gray-200/50'} shadow-lg shadow-black/5 z-50`}>
        <div className="flex items-center gap-3">
          {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-white font-bold text-sm">PC</span>
          </div> */}
          <h1 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span className="hidden sm:inline">Page</span>
            <span className="hidden sm:inline gradient-text">Crafter</span>
            <span className="sm:hidden gradient-text">PageCrafter</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* API Key Button */}
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400 hover:text-amber-400' : 'hover:bg-gray-100 text-gray-500 hover:text-amber-600'}`}
            title="Set API Key"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400 hover:text-yellow-400' : 'hover:bg-gray-100 text-gray-500 hover:text-indigo-600'}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Menu or Login Button */}
          <UserMenu />

        </div>
      </header>



      {/* Main Content Area - Add padding-top to account for fixed header and tabs */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden pt-[60px]">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 relative w-full">
          {activeTab === 'projects' ? (
            /* Projects Overview */
            <div className={`flex-1 flex flex-col relative overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {/* Falling Stars Background */}
              <div className="absolute inset-0 pointer-events-none">
                <div id="stars-container" className="absolute inset-0"></div>
              </div>
              <div className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                  {/* Hero Section with enhanced visuals */}
                  <div className="text-center mb-12 sm:mb-16 md:mb-20 pt-4 sm:pt-8">
                    {/* Decorative element */}
                    <div className="flex justify-center mb-6">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        AI-Powered Development
                      </div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Welcome to </span>
                      <span className="gradient-text">PageCrafter</span>
                    </h2>

                    <p className={`text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 px-4 max-w-2xl mx-auto font-light ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create stunning web projects with the power of artificial intelligence
                    </p>

                    {/* Show login prompt if not authenticated */}
                    {!user && !authLoading ? (
                      <div className={`max-w-md mx-auto p-8 rounded-2xl glass glow-hover ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'}`}>
                        <div className="mb-6">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Sign in to create and manage your projects
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In
                          </Link>
                          <Link
                            href="/register"
                            className={`inline-flex items-center justify-center px-6 py-3.5 font-semibold rounded-xl transition-all duration-300 border ${theme === 'dark'
                              ? 'bg-white/5 text-white hover:bg-white/10 border-white/10 hover:border-white/20'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    ) : user ? (
                      <button
                        onClick={handleNewProject}
                        className="inline-flex items-center px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white text-base sm:text-lg md:text-xl font-semibold rounded-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all duration-500 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 cursor-pointer pulse-button group"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Project
                      </button>
                    ) : (
                      <div className="animate-pulse">
                        <div className={`h-14 w-56 mx-auto rounded-2xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200'}`}></div>
                      </div>
                    )}
                  </div>

                  {user && projects.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Your Projects
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                        {projects.map((project, index) => (
                          <div
                            key={project.id}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            className={`group relative p-5 sm:p-6 rounded-2xl border cursor-pointer card-hover glow-hover animate-fade-in ${theme === 'dark'
                              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700/30 hover:border-indigo-500/50 hover:bg-gray-800/70'
                              : 'bg-white/70 backdrop-blur-xl border-gray-200/50 hover:border-indigo-400/50 hover:bg-white/90'
                              } ${menuOpen === project.id ? 'z-30' : ''}`}
                            onClick={() => {
                              setCurrentProject(project);
                              setActiveTab('chat');
                            }}
                          >
                            <div className="relative z-10">
                              {/* Three-dot menu button */}
                              <div className="absolute top-0 right-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(menuOpen === project.id ? null : project.id);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                                  title="Project options"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {/* Dropdown menu */}
                                {menuOpen === project.id && (
                                  <div className={`absolute right-0 mt-2 w-48 max-h-64 overflow-y-auto rounded-md shadow-lg z-20 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCurrentProject(null);
                                          setActiveTab('projects');
                                          setMenuOpen(null);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                      >
                                        Close Project
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExportCode('zip', project);
                                          setMenuOpen(null);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                      >
                                        Download as ZIP
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExportCode('html', project);
                                          setMenuOpen(null);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                      >
                                        Download as HTML
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRenameProjectId(project.id);
                                          setMenuOpen(null);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                      >
                                        Rename Project
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                                            handleDeleteProject(project.id);
                                          }
                                          setMenuOpen(null);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors text-red-600 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                      >
                                        Delete Project
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className={`text-lg sm:text-xl font-bold mb-2 transition-colors group-hover:text-indigo-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {renameProjectId === project.id ? (
                                    <input
                                      type="text"
                                      defaultValue={project.name}
                                      onBlur={(e) => {
                                        const newName = e.target.value.trim();
                                        if (newName && newName !== project.name) {
                                          setProjects(prev => prev.map(p =>
                                            p.id === project.id ? { ...p, name: newName } : p
                                          ));
                                          if (currentProject?.id === project.id) {
                                            setCurrentProject(prev => prev ? { ...prev, name: newName } : null);
                                          }
                                        }
                                        setRenameProjectId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.currentTarget.blur();
                                        } else if (e.key === 'Escape') {
                                          setRenameProjectId(null);
                                        }
                                      }}
                                      className={`w-full px-3 py-2 rounded-xl border focus-glow ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    project.name
                                  )}
                                </h4>
                                {project.description && (
                                  <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {project.description}
                                  </p>
                                )}

                                {/* Stats row */}
                                <div className={`flex items-center gap-4 mb-4 py-3 border-t border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                                  <div className="flex items-center gap-1.5">
                                    <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{project.messages.length}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{project.files.length}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {project.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShareToGitHub(project);
                                    }}
                                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${theme === 'dark'
                                      ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300'
                                      }`}
                                    title="Share to GitHub"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span>Share</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Panel - Show based on mobile view state */}
              <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-col w-full ${hasGeneratedCode || isLoading ? 'md:w-1/2' : 'max-w-5xl mx-auto'} h-full overflow-hidden transition-all duration-300`}>
                <ChatPanel
                  onCodeGenerated={handleCodeGeneration}
                  onLoadingChange={setIsLoading}
                  currentProject={currentProject}
                  onMessagesUpdate={handleMessagesUpdate}
                  onCodeUpdate={handleCodeUpdate}
                  onShowSettings={() => setSettingsOpen(true)}
                  onShowHistory={() => {/* TODO: Show history modal */ }}
                  onBack={() => setActiveTab('projects')}
                />
              </div>

              {/* PreviewPanel - Show only when generating or generated */}
              {(hasGeneratedCode || isLoading) && (
                <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2 h-full overflow-hidden border-l ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                  <PreviewPanel code={generatedCode} pages={generatedPages} isVisible={hasGeneratedCode} isLoading={isLoading} />
                </div>
              )}

              {/* Mobile Toggle Button - Fixed and visible in both chat and preview */}
              {hasGeneratedCode && (
                <div className={`md:hidden fixed right-4 z-50 transition-all duration-300 ${mobileView === 'chat' ? 'bottom-24' : 'bottom-6'}`}>
                  <button
                    onClick={() => setMobileView(mobileView === 'chat' ? 'preview' : 'chat')}
                    className={`flex items-center space-x-2 px-5 py-3.5 rounded-full shadow-2xl transition-transform transform active:scale-95 ${theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/50'
                      }`}
                  >
                    {mobileView === 'chat' ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-semibold">Preview</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-semibold">Chat</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
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
      />
    </div>
  );
}
