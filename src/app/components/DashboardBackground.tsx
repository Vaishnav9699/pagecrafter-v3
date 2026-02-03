'use client';

import React, { useEffect, useState } from 'react';

const DashboardBackground = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#02040a]">
            {/* 3D Perspective Grid */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    transform: 'perspective(1000px) rotateX(60deg) translateY(-200px) scale(2.5)',
                    transformOrigin: 'top',
                }}
            />

            {/* Starry Nebula Base */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `radial-gradient(circle at 50% 50%, #1e1b4b 0%, transparent 70%),
                       radial-gradient(circle at 80% 20%, #312e81 0%, transparent 50%),
                       radial-gradient(circle at 20% 80%, #1e3a8a 0%, transparent 50%)`,
                }}
            />

            {/* Animated Stars */}
            <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            width: Math.random() * 2 + 'px',
                            height: Math.random() * 2 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 5 + 's',
                            opacity: Math.random() * 0.5 + 0.2,
                        }}
                    />
                ))}
            </div>

            {/* Circuit Patterns Left */}
            <svg className="absolute top-0 left-0 w-1/3 h-full opacity-30" viewBox="0 0 400 1000">
                <defs>
                    <linearGradient id="circuit-gradient-left" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal & Vertical circuit lines */}
                <g stroke="#1e293b" strokeWidth="1" fill="none">
                    <path d="M 0 100 H 100 V 200 H 150 V 400 H 50" />
                    <path d="M 0 300 H 80 V 250 H 120 V 500" />
                    <path d="M 200 0 V 150 H 100 V 350 H 300" />
                    <path d="M 50 1000 V 800 H 150 V 700 H 0" />
                    <path d="M 300 1000 V 850 H 200 V 750 H 250" />
                </g>

                {/* Moving Blue Pulses */}
                <g stroke="url(#circuit-gradient-left)" strokeWidth="2" fill="none">
                    <path d="M 0 100 H 100 V 200 H 150 V 400 H 50" className="circuit-pulse" style={{ animationDelay: '0s' }} />
                    <path d="M 0 300 H 80 V 250 H 120 V 500" className="circuit-pulse" style={{ animationDelay: '2s' }} />
                    <path d="M 200 0 V 150 H 100 V 350 H 300" className="circuit-pulse" style={{ animationDelay: '4s' }} />
                    <path d="M 50 1000 V 800 H 150 V 700 H 0" className="circuit-pulse-reverse" style={{ animationDelay: '1s' }} />
                </g>

                {/* Dots at intersections */}
                <g fill="#3b82f6" opacity="0.5">
                    <circle cx="100" cy="100" r="3" />
                    <circle cx="150" cy="200" r="3" />
                    <circle cx="120" cy="250" r="3" />
                    <circle cx="200" cy="150" r="3" />
                </g>
            </svg>

            {/* Circuit Patterns Right */}
            <svg className="absolute top-0 right-0 w-1/3 h-full opacity-30" viewBox="0 0 400 1000">
                <defs>
                    <linearGradient id="circuit-gradient-right" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <g stroke="#1e293b" strokeWidth="1" fill="none">
                    <path d="M 400 150 H 300 V 250 H 250 V 100 H 350" />
                    <path d="M 400 400 H 320 V 450 H 280 V 200" />
                    <path d="M 200 1000 V 850 H 300 V 650 H 100" />
                    <path d="M 350 0 V 200 H 250 V 300 H 400" />
                </g>

                <g stroke="url(#circuit-gradient-right)" strokeWidth="2" fill="none">
                    <path d="M 400 150 H 300 V 250 H 250 V 100 H 350" className="circuit-pulse-reverse" style={{ animationDelay: '3s' }} />
                    <path d="M 400 400 H 320 V 450 H 280 V 200" className="circuit-pulse" style={{ animationDelay: '1.5s' }} />
                    <path d="M 200 1000 V 850 H 300 V 650 H 100" className="circuit-pulse-reverse" style={{ animationDelay: '5s' }} />
                </g>
            </svg>

            <style jsx>{`
        .circuit-pulse {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: pulse-move 8s linear infinite;
        }
        .circuit-pulse-reverse {
          stroke-dasharray: 100;
          stroke-dashoffset: -100;
          animation: pulse-move-reverse 8s linear infinite;
        }
        @keyframes pulse-move {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: -200; }
        }
        @keyframes pulse-move-reverse {
          0% { stroke-dashoffset: -200; }
          100% { stroke-dashoffset: 200; }
        }
      `}</style>
        </div>
    );
};

export default DashboardBackground;
