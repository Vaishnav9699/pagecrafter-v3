import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string, settings?: any) => void;
  initialAdvanced?: boolean;
  showAdvancedOption?: boolean;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  initialAdvanced = false,
  showAdvancedOption = true
}: NewProjectModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(initialAdvanced);

  // Advanced Settings State
  const [uiFramework, setUiFramework] = useState('React');
  const [designSystem, setDesignSystem] = useState('Tailwind CSS');
  const [colorPalette, setColorPalette] = useState('Dark Mode');
  const [database, setDatabase] = useState('PostgreSQL');
  const [hosting, setHosting] = useState('Vercel');
  const [enableSSR, setEnableSSR] = useState(false);
  const [includeTS, setIncludeTS] = useState(false);
  const [setupCI, setSetupCI] = useState(false);

  useEffect(() => {
    setIsAdvanced(initialAdvanced);
  }, [initialAdvanced, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const settings = isAdvanced ? {
        uiFramework,
        designSystem,
        colorPalette,
        database,
        hosting,
        enableSSR,
        includeTS,
        setupCI
      } : undefined;

      await onCreateProject(name.trim(), description.trim(), settings);
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[110] p-4 animate-fade-in overflow-y-auto py-8">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl transform transition-all duration-300 my-8 ${theme === 'dark' ? 'bg-[#12141c] border border-white/10' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-8 py-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-100'}`}>
              <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New Project
              </h2>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Start building something amazing
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="space-y-6">
            <div>
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${theme === 'dark'
                  ? 'bg-[#0f1117] border-white/5 text-white placeholder-gray-600 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                  }`}
                placeholder="My Awesome Website"
                required
                autoFocus
              />
            </div>

            <div>
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Description <span className={`font-medium ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 resize-none ${theme === 'dark'
                  ? 'bg-[#0f1117] border-white/5 text-white placeholder-gray-600 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                  }`}
                placeholder="A brief description of your project..."
                rows={3}
              />
            </div>

            {/* Advanced Settings Toggle */}
            {showAdvancedOption && (
              <>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdvanced(!isAdvanced)}
                    className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${isAdvanced ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <svg className={`w-4 h-4 transform transition-transform ${isAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
                    </svg>
                    Advanced Developer Settings
                  </button>
                </div>

                {isAdvanced && (
                  <div className="space-y-6 pt-4 animate-slide-down">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">UI Framework</label>
                        <div className="relative">
                          <select
                            value={uiFramework}
                            onChange={(e) => setUiFramework(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 text-sm text-gray-300 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer`}
                          >
                            <option>React</option>
                            <option>Vue</option>
                            <option>Svelte</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Design System</label>
                        <div className="relative">
                          <select
                            value={designSystem}
                            onChange={(e) => setDesignSystem(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 text-sm text-gray-300 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer`}
                          >
                            <option>Tailwind CSS</option>
                            <option>Material UI</option>
                            <option>Chakra UI</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Color Palette</label>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{colorPalette}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                        {[
                          { name: 'Dark Mode', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=120&fit=crop' },
                          { name: 'Cyberpunk', img: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?w=200&h=120&fit=crop' },
                          { name: 'Minimalist', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=200&h=120&fit=crop' },
                          { name: 'Ocean Blue', img: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de8?w=200&h=120&fit=crop' },
                          { name: 'Forest Green', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop' },
                          { name: 'Sunset Glow', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=120&fit=crop' },
                          { name: 'Space Nebula', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&h=120&fit=crop' },
                          { name: 'Watercolor', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=120&fit=crop' },
                          { name: 'Glassmorphism', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=120&fit=crop' },
                          { name: 'High Tech', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=120&fit=crop' },
                        ].map((palette) => (
                          <button
                            key={palette.name}
                            type="button"
                            onClick={() => setColorPalette(palette.name)}
                            className={`group relative aspect-[1.6/1] rounded-lg overflow-hidden border-2 transition-all ${colorPalette === palette.name ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/5 hover:border-white/20'
                              }`}
                          >
                            <img src={palette.img} alt={palette.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className={`absolute inset-0 bg-black/40 transition-opacity ${colorPalette === palette.name ? 'opacity-0' : 'opacity-20 group-hover:opacity-10'}`} />
                            {colorPalette === palette.name && (
                              <div className="absolute top-1 right-1 w-3 h-3 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Database</label>
                        <div className="relative">
                          <select
                            value={database}
                            onChange={(e) => setDatabase(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 text-sm text-gray-300 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer`}
                          >
                            <option>PostgreSQL</option>
                            <option>MongoDB</option>
                            <option>MySQL</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Hosting</label>
                        <div className="relative">
                          <select
                            value={hosting}
                            onChange={(e) => setHosting(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-white/5 text-sm text-gray-300 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer`}
                          >
                            <option>Vercel</option>
                            <option>Netlify</option>
                            <option>AWS</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: 'Enable Server-Side Rendering', state: enableSSR, setState: setEnableSSR },
                        { label: 'Include TypeScript', state: includeTS, setState: setIncludeTS },
                        { label: 'Setup CI/CD Pipeline', state: setupCI, setState: setSetupCI },
                      ].map((toggle) => (
                        <div key={toggle.label} className="flex items-center justify-between group cursor-pointer" onClick={() => toggle.setState(!toggle.state)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${toggle.state ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/30' : 'border-white/10 group-hover:border-white/20'}`}>
                              {toggle.state && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-gray-200 transition-colors">{toggle.label}</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full p-1 transition-colors ${toggle.state ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${toggle.state ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-200 ${theme === 'dark'
                ? 'text-gray-500 hover:text-white hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[1.5] px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
