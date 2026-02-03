'use client';

import React from 'react';

interface HolographicCardProps {
    title: string;
    description: string;
    color: string;
    onClick: () => void;
    type: 'ppt' | 'pdf' | 'website' | 'advanced';
}

const HolographicCard: React.FC<HolographicCardProps> = ({ title, description, color, onClick, type }) => {

    const getBackContent = () => {
        switch (type) {
            case 'website': return { stats: ['99% Precision', 'SEO Ready', 'Mobile First'], hint: 'Launch AI Builder' };
            case 'ppt': return { stats: ['20+ Layouts', 'Dynamic Charts', 'AI Writer'], hint: 'Start Deck' };
            case 'pdf': return { stats: ['OCR Engine', 'Signed Docs', 'Cloud Sync'], hint: 'Generate PDF' };
            case 'advanced': return { stats: ['Full JSX', 'Live Preview', 'API Access'], hint: 'Open Editor' };
            default: return { stats: [], hint: 'Select Mode' };
        }
    };

    const backData = getBackContent();

    return (
        <div className="group w-full aspect-[4/3] [perspective:1000px]">
            <div
                className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer"
                onClick={onClick}
            >
                {/* --- FRONT FACE --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] z-[2]">
                    {/* Glowing Border & Background */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-xl border-2 rounded-2xl transition-all duration-500 shadow-[0_0_15px_rgba(var(--glow-color),0.1)] group-hover:shadow-[0_0_30px_rgba(var(--glow-color),0.3)]"
                        style={{
                            borderColor: `${color}30`,
                            // @ts-ignore
                            '--glow-color': color === '#fb923c' ? '251, 146, 60' : color === '#ef4444' ? '239, 68, 68' : color === '#818cf8' ? '129, 140, 248' : '168, 85, 247'
                        } as any}
                    />

                    {/* Content Area */}
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center gap-4">
                        {/* Hologram Visualizers (Keep existing logic) */}
                        <div className="relative w-full h-32 flex items-center justify-center">
                            {type === 'ppt' && (
                                <div className="relative w-full h-full">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-orange-500/10 blur-2xl animate-pulse" />
                                        <div className="relative z-10 w-20 h-16 border-2 border-orange-400/50 rounded-lg flex flex-col p-2 gap-1 bg-orange-950/20">
                                            <div className="w-full h-2 bg-orange-400/30 rounded" />
                                            <div className="flex gap-1 h-full">
                                                <div className="w-2/3 h-full bg-orange-400/20 rounded" />
                                                <div className="w-1/3 h-full bg-orange-400/10 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-20 opacity-40 pointer-events-none"
                                        style={{ background: 'conic-gradient(from 150deg at 50% 100%, transparent, #fb923c, transparent)', filter: 'blur(4px)' }}
                                    />
                                </div>
                            )}

                            {type === 'pdf' && (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-16 h-20 border-2 border-red-500/50 rounded-lg bg-red-950/20 relative overflow-hidden flex items-center justify-center">
                                        <span className="text-red-400 font-black text-xs">PDF</span>
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-red-400 shadow-[0_0_10px_#ef4444] animate-scan" />
                                    </div>
                                    <div className="absolute w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
                                </div>
                            )}

                            {type === 'website' && (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className="absolute w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                                    <div className="relative w-28 h-20 perspective-1000">
                                        <div className="absolute inset-0 border-2 border-indigo-400/20 rounded-lg bg-indigo-950/20 transform translate-z-[-20px] rotate-x-12" />
                                        <div className="absolute inset-0 border-2 border-indigo-400/60 rounded-lg bg-indigo-900/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] transform rotate-x-12 translate-y-[-10px]">
                                            <div className="w-full h-4 border-b border-indigo-400/30 flex items-center px-2 gap-1 px-1.5">
                                                <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                                                <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                                                <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <div className="flex gap-2"><div className="w-8 h-8 rounded bg-indigo-400/30 animate-pulse" /><div className="flex-1 space-y-1"><div className="w-full h-1.5 bg-indigo-400/40 rounded" /><div className="w-2/3 h-1.5 bg-indigo-400/20 rounded" /></div></div>
                                                <div className="grid grid-cols-3 gap-1"><div className="h-6 bg-indigo-400/10 rounded" /><div className="h-6 bg-indigo-400/10 rounded" /><div className="h-6 bg-indigo-400/10 rounded" /></div>
                                            </div>
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-10 h-10 border border-indigo-300/40 rounded bg-indigo-900/40 backdrop-blur-sm transform rotate-y-12 translate-z-20 animate-float" />
                                    </div>
                                </div>
                            )}

                            {type === 'advanced' && (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-20 font-mono text-[6px] overflow-hidden select-none pointer-events-none text-purple-400 flex flex-wrap gap-1 leading-none p-2">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>{'010110010101011'.split('').join('\n')}</div>
                                        ))}
                                    </div>
                                    <div className="relative w-16 h-16 transform rotate-x-45 rotate-z-45">
                                        <div className="absolute inset-0 border-2 border-purple-400 shadow-[0_0_15px_#a855f7] animate-float" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center z-10">
                            <h3 className="text-xl font-black text-white mb-1" style={{ color: color }}>{title}</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-60">{description}</p>
                        </div>
                    </div>
                </div>

                {/* --- BACK FACE --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] z-0">
                    <div
                        className="absolute inset-0 bg-[#0f1117] border-2 rounded-2xl shadow-inner"
                        style={{ borderColor: `${color}40` }}
                    />

                    <div className="absolute inset-0 p-8 flex flex-col items-center justify-between text-center">
                        <div className="w-full">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6" style={{ color: color }}>System Status</h4>
                            <div className="space-y-4">
                                {backData.stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-sm font-bold text-gray-300 font-mono">{stat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center gap-4">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Initialize Core</span>
                            <div
                                className="px-6 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-110 active:scale-95"
                                style={{ borderColor: color, color: color, boxShadow: `0 0 15px ${color}30` }}
                            >
                                {backData.hint}
                            </div>
                        </div>
                    </div>

                    {/* Matrix Rain effect overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 animate-matrix-rain text-[8px] font-mono whitespace-pre bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent">
                            {Array.from({ length: 15 }).map(() => '0101101\n').join('')}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan { 0%, 100% { top: 0; opacity: 0; } 50% { top: 100%; opacity: 1; } }
                .animate-scan { animation: scan 2s linear infinite; }
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-12 { transform: rotateX(12deg); }
                .rotate-x-45 { transform: rotateX(45deg); }
                .rotate-z-45 { transform: rotateZ(45deg); }
                
                @keyframes matrix-rain {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100%); }
                }
                .animate-matrix-rain {
                    animation: matrix-rain 5s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default HolographicCard;
