'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GridTunnelProps {
    isVisible: boolean;
    color?: string;
}

const GridTunnel: React.FC<GridTunnelProps> = ({ isVisible, color = '#6366f1' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setOpacity(1);
        } else {
            const timeout = setTimeout(() => setOpacity(0), 500);
            return () => clearTimeout(timeout);
        }
    }, [isVisible]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            // Speed of movement (Positive for Forward)
            offset += 0.04;
            if (offset > 1) offset = 0;

            // Draw perspective lines (from center to corners/edges of frames)
            const horizontalLineCount = 10;
            const verticalLineCount = 10;

            ctx.globalAlpha = 0.3 * opacity;

            // Vertical converging lines
            for (let i = 0; i <= verticalLineCount; i++) {
                const x = (i / verticalLineCount) * canvas.width;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal converging lines
            for (let i = 0; i <= horizontalLineCount; i++) {
                const y = (i / horizontalLineCount) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(0, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw rectangular frames (grid squares moving towards camera)
            const frameCount = 18; // More frames for smoother transition
            for (let i = 0; i < frameCount; i++) {
                // (i + offset) ensures they originate from the center 0 and grow to size
                const progress = (i + offset) / frameCount;

                // Exponential scale to simulate perspective distance (from 0 to huge)
                const scale = Math.pow(progress, 3) * 5;

                if (scale <= 0.01) continue;

                const w = (canvas.width) * scale;
                const h = (canvas.height) * scale;

                ctx.beginPath();
                ctx.rect(centerX - w / 2, centerY - h / 2, w, h);

                // Frames fade out as they pass the "camera" (progress near 1)
                // and start invisible at the center (progress near 0)
                const fade = progress < 0.1 ? progress * 10 : (1 - progress) * 1.5;
                ctx.globalAlpha = Math.max(0, Math.min(0.6, fade)) * opacity;
                ctx.lineWidth = 0.5 + progress * 4;
                ctx.stroke();

                // Intensity glow for the frames as they get closer
                if (progress > 0.5) {
                    ctx.shadowBlur = 20 * progress;
                    ctx.shadowColor = color;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }

            ctx.shadowBlur = 0;
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, opacity]);

    if (!isVisible && opacity === 0) return null;

    return (
        <div
            className="absolute inset-0 z-50 transition-opacity duration-1000 overflow-hidden bg-black"
            style={{ opacity }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
            {/* Black Hole Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black shadow-[0_0_50px_20px_rgba(0,0,0,1)]" />

            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan opacity-30" />

            <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(5000%); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default GridTunnel;
