'use client';

import React, { useEffect, useRef, useState } from 'react';

const phi = (1 + Math.sqrt(5)) / 2;
const vertices: [number, number, number][] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
];

const edges: [number, number][] = [];
const distSq = (a: [number, number, number], b: [number, number, number]) =>
    Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);

for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
        if (Math.abs(distSq(vertices[i], vertices[j]) - 4) < 0.1) {
            edges.push([i, j]);
        }
    }
}

interface HexagonalLoaderProps {
    size?: number;
    color?: string;
    className?: string;
}

const HexagonalLoader: React.FC<HexagonalLoaderProps> = ({
    size = 120,
    color = '#6366f1',
    className = ''
}) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = useState(1);
    const requestRef = useRef<number>(null);

    const animate = (time: number) => {
        setRotation({
            x: time * 0.0005,
            y: time * 0.0007,
            z: time * 0.0003
        });
        // Breathe effect
        setScale(1 + Math.sin(time * 0.002) * 0.1);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const project = (v: [number, number, number]) => {
        let { x, y, z } = { x: v[0], y: v[1], z: v[2] };

        // Rotate X
        let ty = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
        let tz = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);
        y = ty; z = tz;

        // Rotate Y
        let tx = x * Math.cos(rotation.y) + z * Math.sin(rotation.y);
        tz = -x * Math.sin(rotation.y) + z * Math.cos(rotation.y);
        x = tx; z = tz;

        // Rotate Z
        tx = x * Math.cos(rotation.z) - y * Math.sin(rotation.z);
        ty = x * Math.sin(rotation.z) + y * Math.cos(rotation.z);
        x = tx; y = ty;

        // Perspective projection
        const factor = 150 / (150 + z);
        const scaleFactor = (size / 4) * scale;
        return {
            x: x * scaleFactor * factor + size / 2,
            y: y * scaleFactor * factor + size / 2,
            z: z // for depth sorting or fading
        };
    };

    const projectedVertices = vertices.map(project);

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Background Glow */}
            <div
                className="absolute inset-0 rounded-full blur-2xl opacity-20"
                style={{ backgroundColor: color }}
            />

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Edges */}
                {edges.map(([i, j], idx) => {
                    const v1 = projectedVertices[i];
                    const v2 = projectedVertices[j];
                    // Simple depth-based opacity
                    const avgZ = (v1.z + v2.z) / 2;
                    const opacity = Math.max(0.1, 0.7 + (avgZ / phi));

                    return (
                        <line
                            key={idx}
                            x1={v1.x}
                            y1={v1.y}
                            x2={v2.x}
                            y2={v2.y}
                            stroke={`url(#grad-${color.replace('#', '')})`}
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeOpacity={opacity}
                            style={{ filter: 'url(#glow)' }}
                        />
                    );
                })}

                {/* Vertices */}
                {projectedVertices.map((v, idx) => (
                    <circle
                        key={idx}
                        cx={v.x}
                        cy={v.y}
                        r="1.5"
                        fill={color}
                        fillOpacity={Math.max(0.2, 0.9 + (v.z / 4))}
                    />
                ))}
            </svg>
        </div>
    );
};

export default HexagonalLoader;
