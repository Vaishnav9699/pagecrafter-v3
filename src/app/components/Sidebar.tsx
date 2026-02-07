'use client';

import React, { useState } from 'react';
import {
  Home,
  Folder,
  Globe,
  LayoutGrid,
  Image as ImageIcon,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Project } from '../../lib/supabaseOperations';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  projects,
  currentProject,
  onProjectSelect,
  onNewProject,
  activeView,
  onViewChange,
  isCollapsed = false,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const { theme } = useTheme();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: Folder, hasDropdown: true },
    { id: 'community', label: 'Community', icon: Globe },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'assets', label: 'Assets', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings, hasDropdown: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed md:sticky left-0 top-[60px] h-[calc(100vh-60px)] transition-all duration-500 ease-in-out z-40 flex flex-col font-sans ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          } ${isCollapsed ? 'w-20' : 'w-64'} ${theme === 'dark'
            ? 'bg-[#0f1117] border-slate-800/50'
            : 'bg-white border-gray-200'
          } border-r shrink-0 overflow-hidden`}
      >
        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'projects' && activeView === 'chat') || (item.id === 'settings' && activeView.startsWith('settings'));
            const isDropdown = item.hasDropdown;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (item.id === 'projects') {
                      setIsProjectsExpanded(!isProjectsExpanded);
                      onViewChange('projects');
                    } else {
                      onViewChange(item.id);
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? theme === 'dark'
                      ? 'bg-white/10 text-white font-medium'
                      : 'bg-indigo-50 text-indigo-600 font-medium'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={`${isActive
                      ? theme === 'dark' ? 'text-white' : 'text-indigo-600'
                      : theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                      } shrink-0`} />
                    {!isCollapsed && <span className="text-sm animate-fade-in whitespace-nowrap">{item.label}</span>}
                  </div>
                  {!isCollapsed && isDropdown && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${(item.id === 'projects' && isProjectsExpanded) ||
                        (item.id === 'settings' && isSettingsExpanded)
                        ? 'rotate-180'
                        : ''
                        }`}
                    />
                  )}
                </button>

                {/* Projects Dropdown Content */}
                {item.id === 'projects' && isProjectsExpanded && !isCollapsed && (
                  <div className={`ml-4 pl-4 space-y-1 py-1 animate-fade-in ${theme === 'dark' ? 'border-l border-slate-800/50' : 'border-l border-gray-200'
                    }`}>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          onProjectSelect(project);
                          onViewChange('chat');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${currentProject?.id === project.id && activeView === 'chat'
                          ? theme === 'dark'
                            ? 'text-white bg-white/5 font-semibold'
                            : 'text-indigo-600 bg-indigo-50 font-semibold'
                          : theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{project.name}</span>
                          {currentProject?.id === project.id && activeView === 'chat' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                          )}
                        </div>
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <p className={`px-3 py-1 text-[10px] italic ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                        }`}>No projects found</p>
                    )}
                    <button
                      onClick={onNewProject}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${theme === 'dark'
                          ? 'text-purple-400 hover:text-purple-300'
                          : 'text-indigo-600 hover:text-indigo-500'
                        }`}
                    >
                      + Create New
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </nav>

        {/* User / Footer Section */}
        <div className={`p-4 ${theme === 'dark' ? 'border-t border-slate-800/50' : 'border-t border-gray-200'
          }`}>
          <div className={`flex items-center gap-3 px-2 py-2 transition-all duration-500 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shrink-0">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>John Doe</span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                  }`}>Pro Plan</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </>
  );
}
