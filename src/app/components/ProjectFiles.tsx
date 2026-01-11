'use client';

import { useState } from 'react';
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

interface ProjectFilesProps {
  currentProject: Project | null;
  onProjectUpdate: (project: Project) => void;
}

export default function ProjectFiles({ currentProject, onProjectUpdate }: ProjectFilesProps) {
  const { theme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'html' | 'css' | 'js'>('html');
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreateFile = () => {
    if (!currentProject || !newFileName.trim()) return;

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: newFileName.trim(),
      content: '',
      type: newFileType,
      createdAt: new Date()
    };

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile]
    };

    onProjectUpdate(updatedProject);
    setNewFileName('');
    setIsCreating(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      files: currentProject.files.filter(f => f.id !== fileId)
    };

    onProjectUpdate(updatedProject);
  };

  const handleEditFile = (file: ProjectFile) => {
    setEditingFile(file);
    setEditContent(file.content);
  };

  const handleSaveFile = () => {
    if (!currentProject || !editingFile) return;

    const updatedProject = {
      ...currentProject,
      files: currentProject.files.map(f =>
        f.id === editingFile.id ? { ...f, content: editContent } : f
      )
    };

    onProjectUpdate(updatedProject);
    setEditingFile(null);
    setEditContent('');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html':
        return '🟠';
      case 'css':
        return '🔵';
      case 'js':
        return '🟡';
      default:
        return '📄';
    }
  };

  if (!currentProject) {
    return (
      <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Select a project to view its files
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Project Files: {currentProject.name}
          </h3>
        </div>
      </div>

      {/* Create File Section */}
      <div className="p-4">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            + New File
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name (without extension)"
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value as 'html' | 'css' | 'js')}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="js">JavaScript</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateFile}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewFileName('');
                }}
                className={`flex-1 px-3 py-2 rounded-lg ${
                  theme === 'dark'
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

      {/* Files List */}
      <div className="flex-1 overflow-y-auto">
        {currentProject.files.length === 0 ? (
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No files yet. Create your first file!
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {currentProject.files.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {file.name}.{file.type}
                      </h4>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Created {file.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditFile(file)}
                      className={`px-3 py-1 rounded text-sm ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className={`px-3 py-1 rounded text-sm ${
                        theme === 'dark'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit File Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-4xl mx-4 rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit {editingFile.name}.{editingFile.type}
                </h3>
                <button
                  onClick={() => setEditingFile(null)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full h-96 px-3 py-2 rounded-lg border font-mono text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={`Enter your ${editingFile.type.toUpperCase()} code here...`}
              />
            </div>
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingFile(null)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
