'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: 'html' | 'css' | 'js';
  createdAt: Date;
}

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  lastGeneratedCode?: { html: string; css: string; js: string };
  files: ProjectFile[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  currentProject,
  onProjectSelect,
  onNewProject,
}: SidebarProps) {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('pagecrafter_projects');
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects).map((p: Omit<Project, 'createdAt'> & { createdAt: string }) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
      setProjects(parsed);
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem('pagecrafter_projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      createdAt: new Date(),
      messages: [],
      lastGeneratedCode: undefined,
      files: []
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    onProjectSelect(newProject);
    setNewProjectName('');
    setIsCreating(false);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    if (currentProject?.id === projectId) {
      onNewProject();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-xl`}>

        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Projects
            </h2>
            <button
              onClick={onToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Project Button */}
        <div className="p-4">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              + New Project
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="p-4 text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No projects yet. Create your first project!
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${currentProject?.id === project.id
                      ? theme === 'dark'
                        ? 'bg-blue-900 border-blue-700'
                        : 'bg-blue-100 border-blue-300'
                      : theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-50'
                    } border`}
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {project.name}
                      </h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {project.messages.length} messages • {project.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
