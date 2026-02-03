'use client';

import { useStudio, Layer } from '../contexts/StudioContext';
import { useEffect, useRef, useState } from 'react';

export default function StudioCanvas() {
    const {
        layers,
        selectedLayerId,
        addLayer,
        updateLayerStyle,
        updateLayerContent,
        selectLayer,
        deleteLayer,
        clearLayers,
    } = useStudio();

    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Handle layer selection
    const handleLayerClick = (e: React.MouseEvent, layerId: string) => {
        e.stopPropagation();
        selectLayer(layerId);
    };

    // Handle canvas click (deselect)
    const handleCanvasClick = () => {
        selectLayer(null);
    };

    // Handle drag start
    const handleDragStart = (e: React.MouseEvent, layer: Layer) => {
        e.stopPropagation();
        setIsDragging(true);
        selectLayer(layer.id);

        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Handle drag move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !selectedLayerId || !canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            const newX = e.clientX - canvasRect.left - dragOffset.x;
            const newY = e.clientY - canvasRect.top - dragOffset.y;

            updateLayerStyle(selectedLayerId, { x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, selectedLayerId, dragOffset, updateLayerStyle]);

    // Render layer based on type
    const renderLayer = (layer: Layer) => {
        const isSelected = layer.id === selectedLayerId;
        const baseStyle = {
            position: 'absolute' as const,
            left: `${layer.style.x}px`,
            top: `${layer.style.y}px`,
            width: `${layer.style.width}px`,
            height: `${layer.style.height}px`,
            color: layer.style.color,
            fontSize: `${layer.style.fontSize}px`,
            zIndex: layer.style.zIndex,
            cursor: 'move',
            border: isSelected ? '2px solid #4F46E5' : '1px solid transparent',
            padding: '8px',
            userSelect: 'none' as const,
        };

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        style={baseStyle}
                        onClick={(e) => handleLayerClick(e, layer.id)}
                        onMouseDown={(e) => handleDragStart(e, layer)}
                    >
                        {layer.content}
                    </div>
                );

            case 'shape':
                return (
                    <div
                        key={layer.id}
                        style={{
                            ...baseStyle,
                            backgroundColor: layer.style.color,
                            borderRadius: layer.content === 'circle' ? '50%' : '0',
                        }}
                        onClick={(e) => handleLayerClick(e, layer.id)}
                        onMouseDown={(e) => handleDragStart(e, layer)}
                    />
                );

            case 'batch':
                return (
                    <div
                        key={layer.id}
                        style={{
                            ...baseStyle,
                            backgroundColor: '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={(e) => handleLayerClick(e, layer.id)}
                        onMouseDown={(e) => handleDragStart(e, layer)}
                    >
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            {layer.content}
                        </span>
                    </div>
                );

            default:
                return null;
        }
    };

    // Sort layers by z-index for proper rendering
    const sortedLayers = [...layers].sort((a, b) => a.style.zIndex - b.style.zIndex);

    return (
        <div className="studio-canvas-container">
            {/* Toolbar */}
            <div className="studio-toolbar">
                <button
                    onClick={() => addLayer('text', 'New Text', { fontSize: 20, color: '#000000' })}
                    className="toolbar-btn"
                >
                    + Text
                </button>
                <button
                    onClick={() => addLayer('shape', 'rectangle', { width: 150, height: 150, color: '#4F46E5' })}
                    className="toolbar-btn"
                >
                    + Shape
                </button>
                <button
                    onClick={() => addLayer('batch', 'Batch Element', { width: 200, height: 80 })}
                    className="toolbar-btn"
                >
                    + Batch
                </button>
                <button
                    onClick={clearLayers}
                    className="toolbar-btn danger"
                >
                    Clear All
                </button>
                {selectedLayerId && (
                    <button
                        onClick={() => deleteLayer(selectedLayerId)}
                        className="toolbar-btn danger"
                    >
                        Delete Selected
                    </button>
                )}
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="studio-canvas"
                onClick={handleCanvasClick}
            >
                {sortedLayers.map(renderLayer)}
            </div>

            {/* Layer Info Panel */}
            {selectedLayerId && (
                <div className="layer-info">
                    <h3>Selected Layer</h3>
                    <p>ID: {selectedLayerId}</p>
                    <p>Type: {layers.find(l => l.id === selectedLayerId)?.type}</p>
                    <p>Layers Count: {layers.length}</p>
                </div>
            )}

            <style jsx>{`
        .studio-canvas-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #F9FAFB;
        }

        .studio-toolbar {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border-bottom: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toolbar-btn {
          padding: 8px 16px;
          background: #4F46E5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .toolbar-btn:hover {
          background: #4338CA;
        }

        .toolbar-btn.danger {
          background: #EF4444;
        }

        .toolbar-btn.danger:hover {
          background: #DC2626;
        }

        .studio-canvas {
          flex: 1;
          position: relative;
          background: white;
          margin: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .layer-info {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          min-width: 200px;
        }

        .layer-info h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .layer-info p {
          margin: 4px 0;
          font-size: 12px;
          color: #6B7280;
        }
      `}</style>
        </div>
    );
}
