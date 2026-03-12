/**
 * Studio Mode Type Definitions
 * Centralized type definitions for the Studio canvas-to-code workflow
 */

// Layer types
export type LayerType = 'text' | 'batch' | 'shape';

// Shape subtypes
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line';

// Style properties for each layer
export interface LayerStyle {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    opacity?: number;
    rotation?: number;
    zIndex: number;
}

// Layer object structure
export interface Layer {
    id: string;
    type: LayerType;
    content: string;
    style: LayerStyle;
    locked?: boolean;
    visible?: boolean;
    metadata?: Record<string, any>;
}

// History state for undo/redo functionality
export interface HistoryState {
    layers: Layer[];
    selectedLayerId: string | null;
    timestamp: number;
}

// Export formats
export type ExportFormat = 'react' | 'html' | 'vue' | 'json' | 'css';

// Canvas settings
export interface CanvasSettings {
    width: number;
    height: number;
    backgroundColor: string;
    gridSize?: number;
    showGrid?: boolean;
    snapToGrid?: boolean;
}

// Tool types for the studio
export type ToolType = 'select' | 'text' | 'shape' | 'batch' | 'pan' | 'zoom';

// Alignment options
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

// Distribution options
export type DistributionType = 'horizontal' | 'vertical';
