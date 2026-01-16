'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ProjectFiles from './components/ProjectFiles';
import NewProjectModal from './components/NewProjectModal';
import {
  getProjects,
  createProject as createProjectInDb,
  deleteProject as deleteProjectInDb,
  updateProjectCode as updateProjectCodeInDb,
  replaceProjectMessages,
  updateProject as updateProjectInDb,
  Project,
} from '../lib/supabaseOperations';

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: 'html' | 'css' | 'js';
  createdAt: Date;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
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

  const [hasGeneratedCode, setHasGeneratedCode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'chat' | 'files'>('projects');
  const [generatedPages, setGeneratedPages] = useState<Record<string, { title: string; html: string; css: string; js: string; }> | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);

  // Load projects from Supabase on mount
  useEffect(() => {
    async function loadProjects() {
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
  }, []);

  // Update generated code when current project changes
  useEffect(() => {
    if (currentProject?.lastGeneratedCode) {
      setGeneratedCode(currentProject.lastGeneratedCode);
      setHasGeneratedCode(true);
    }
  }, [currentProject]);

  // Initialize falling stars effect for projects page
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

  const handleExportCode = (format: 'html' | 'zip') => {
    // Use current project's last generated code, or fall back to current generated code
    const codeToExport = currentProject?.lastGeneratedCode || generatedCode;
    if (!codeToExport) return;

    const { html, css, js } = codeToExport;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentProject?.name || 'PageCrafter Project'}</title>
    <style>${css || ''}</style>
</head>
<body>
    ${html}
    <script>${js || ''}</script>
</body>
</html>`;

    const projectName = currentProject?.name || 'PageCrafter Project';

    if (format === 'html') {
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

        // Add HTML file with inline CSS and JS
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
      <header className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm z-10`}>
        <div className="flex items-center space-x-4">
          <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            PageCrafter
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
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

          {/* Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'projects'
            ? theme === 'dark'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-blue-600 border-b-2 border-blue-600 bg-gray-50'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          📋 Projects
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'chat'
            ? theme === 'dark'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-blue-600 border-b-2 border-blue-600 bg-gray-50'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'files'
            ? theme === 'dark'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
              : 'text-blue-600 border-b-2 border-blue-600 bg-gray-50'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          📁 Files
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
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
        <div className="flex flex-1 relative">
          {activeTab === 'projects' ? (
            /* Projects Overview */
            <div className={`flex-1 flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {/* Falling Stars Background */}
              <div className="absolute inset-0 pointer-events-none">
                <div id="stars-container" className="absolute inset-0"></div>
              </div>
              <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Welcome to PageCrafter
                    </h2>
                    <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Create amazing web projects with AI-powered development
                    </p>
                    <button
                      onClick={handleNewProject}
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Project
                    </button>
                  </div>

                  {projects.length > 0 && (
                    <div>
                      <h3 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Your Projects
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className={`group relative p-6 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${theme === 'dark'
                              ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-750 hover:border-transparent'
                              : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-transparent'
                              } hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] before:absolute before:inset-0 before:rounded-lg before:p-[2px] before:bg-gradient-to-r before:from-blue-400 before:via-purple-400 before:to-pink-400 before:opacity-0 hover:before:opacity-70 before:transition-opacity before:duration-300 before:pointer-events-none`}
                            style={{
                              background: theme === 'dark'
                                ? 'linear-gradient(135deg, rgba(31,41,55,0.8), rgba(17,24,39,0.8))'
                                : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8))'
                            }}
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
                                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
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

                              <h4 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                    className={`w-full px-2 py-1 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    autoFocus
                                  />
                                ) : (
                                  project.name
                                )}
                              </h4>
                              {project.description && (
                                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {project.description}
                                </p>
                              )}
                              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {project.messages.length} messages • {project.files.length} files
                              </p>
                              <div className="flex items-center justify-between">
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Created {project.createdAt.toLocaleDateString()}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareToGitHub(project);
                                  }}
                                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'chat' ? (
            <>
              {/* Chat Panel */}
              <ChatPanel
                onCodeGenerated={handleCodeGeneration}
                onLoadingChange={setIsLoading}
                currentProject={currentProject}
                onMessagesUpdate={handleMessagesUpdate}
                onCodeUpdate={handleCodeUpdate}
                onShowSettings={() => setSettingsOpen(true)}
                onShowHistory={() => {/* TODO: Show history modal */ }}
              />

              {/* Preview Panel */}
              <PreviewPanel code={generatedCode} pages={generatedPages} isVisible={hasGeneratedCode} isLoading={isLoading} />
            </>
          ) : (
            /* Project Files */
            <ProjectFiles
              currentProject={currentProject}
              onProjectUpdate={(updatedProject) => {
                setProjects(prev => prev.map(p =>
                  p.id === updatedProject.id ? updatedProject : p
                ));
                setCurrentProject(updatedProject);
              }}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onExportCode={handleExportCode}
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
