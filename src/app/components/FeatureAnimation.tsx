'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Handshake, Rocket, Box, Sparkles, Cpu } from 'lucide-react';

interface Node {
    id: string;
    x: number;
    y: number;
    label: string;
    sublabel?: string;
    Icon: React.ElementType;
    color: string;
    delay: number;
}

const FeatureAnimation = () => {
    const [activeNodes, setActiveNodes] = useState<string[]>([]);
    const [activeLines, setActiveLines] = useState<number[]>([]);

    const nodes: Node[] = [
        {
            id: 'center',
            x: 50,
            y: 50,
            label: 'PageCrafter AI',
            Icon: Sparkles,
            color: '#6366f1',
            delay: 0,
        },
        {
            id: 'enterprise',
            x: 35,
            y: 20,
            label: 'BACKED BY ENTERPRISE-GRADE RELIABILITY',
            Icon: Shield,
            color: '#f43f5e',
            delay: 1000,
        },
        {
            id: 'success',
            x: 65,
            y: 35,
            label: 'WE PARTNER WITH YOU TO ENSURE SUCCESS',
            Icon: Handshake,
            color: '#0ea5e9',
            delay: 2500,
        },
        {
            id: 'power',
            x: 45,
            y: 75,
            label: 'HARNESS THE POWER OF AI — WITHOUT THE OVERHEAD',
            Icon: Cpu,
            color: '#a855f7',
            delay: 4000,
        },
        {
            id: 'silos',
            x: 20,
            y: 55,
            label: 'BREAK DOWN SILOS BETWEEN PRODUCT, DESIGN, AND ENGINEERING',
            Icon: Box,
            color: '#f59e0b',
            delay: 5500,
        },
        {
            id: 'launch',
            x: 80,
            y: 65,
            label: 'READY FOR LAUNCH',
            Icon: Rocket,
            color: '#10b981',
            delay: 7000,
        },
    ];

    const connections = [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 },
        { from: 2, to: 5 },
    ];

    useEffect(() => {
        nodes.forEach((node, index) => {
            setTimeout(() => {
                setActiveNodes((prev) => [...prev, node.id]);
            }, node.delay);
        });

        connections.forEach((conn, index) => {
            const targetNode = nodes[conn.to];
            setTimeout(() => {
                setActiveLines((prev) => [...prev, index]);
            }, targetNode.delay - 500);
        });
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#0a0a0c]">
            {/* Perspective Grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(#4a4a4a 1px, transparent 1px), linear-gradient(90deg, #4a4a4a 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)',
                    transformOrigin: 'top',
                }}
            />

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    {nodes.map((node) => (
                        <filter id={`glow-${node.id}`} key={node.id}>
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    ))}
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>

                {/* Connections */}
                {connections.map((conn, index) => {
                    const from = nodes[conn.from];
                    const to = nodes[conn.to];
                    const isActive = activeLines.includes(index);

                    return (
                        <g key={index}>
                            <path
                                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                                stroke="white"
                                strokeWidth="0.1"
                                strokeOpacity="0.1"
                                fill="none"
                            />
                            {isActive && (
                                <path
                                    d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                                    stroke={to.color}
                                    strokeWidth="0.3"
                                    pathLength="100"
                                    strokeDasharray="100"
                                    strokeDashoffset="100"
                                    fill="none"
                                    className="animate-draw-line"
                                    style={{ filter: `drop-shadow(0 0 2px ${to.color})` }}
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
                const isActive = activeNodes.includes(node.id);
                const Icon = node.Icon;

                return (
                    <div
                        key={node.id}
                        className={`absolute transition-all duration-1000 flex flex-col items-center gap-2 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            transform: `translate(-50%, -50%)`,
                        }}
                    >
                        {node.id === 'center' ? (
                            <div className="relative group">
                                <div className="absolute -inset-8 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                    PageCrafter AI
                                </h1>
                            </div>
                        ) : (
                            <div className="relative group flex flex-col items-center">
                                {/* Tooltip Label */}
                                <div className="absolute bottom-full mb-3 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full whitespace-nowrap">
                                    <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
                                        {node.label}
                                    </span>
                                </div>

                                {/* Icon Container */}
                                <div
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#1a1a1e] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300"
                                    style={{
                                        boxShadow: isActive ? `0 0 20px ${node.color}40, inset 0 0 10px ${node.color}20` : 'none',
                                        borderColor: isActive ? `${node.color}50` : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Icon
                                        className="w-6 h-6 md:w-8 md:h-8"
                                        style={{ color: isActive ? node.color : '#444' }}
                                    />

                                    {/* Subtle surface glow */}
                                    <div
                                        className="absolute inset-0 opacity-20 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at center, ${node.color} 0%, transparent 70%)`
                                        }}
                                    />
                                </div>

                                {/* Vertical Connector Stem */}
                                <div
                                    className={`w-0.5 h-4 transition-all duration-1000 ${isActive ? 'opacity-50' : 'opacity-0'}`}
                                    style={{ backgroundColor: node.color }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FeatureAnimation;
