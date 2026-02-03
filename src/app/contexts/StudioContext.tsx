'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Layer types
export type LayerType = 'text' | 'batch' | 'shape';

// Style properties for each layer
export interface LayerStyle {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
    zIndex: number;
}

// Layer object structure
export interface Layer {
    id: string;
    type: LayerType;
    content: string;
    style: LayerStyle;
}

// Context type definition
interface StudioContextType {
    layers: Layer[];
    selectedLayerId: string | null;
    addLayer: (type: LayerType, content: string, style?: Partial<LayerStyle>) => void;
    updateLayerStyle: (layerId: string, style: Partial<LayerStyle>) => void;
    updateLayerContent: (layerId: string, content: string) => void;
    selectLayer: (layerId: string | null) => void;
    deleteLayer: (layerId: string) => void;
    reorderLayer: (layerId: string, newZIndex: number) => void;
    clearLayers: () => void;
    getLayer: (layerId: string) => Layer | undefined;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

// Default style values
const DEFAULT_STYLE: LayerStyle = {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    fontSize: 16,
    color: '#000000',
    zIndex: 0,
};

export function StudioProvider({ children }: { children: React.ReactNode }) {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

    // Generate unique ID for layers
    const generateId = (): string => {
        return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Add a new layer to the canvas
    const addLayer = useCallback((type: LayerType, content: string, style?: Partial<LayerStyle>) => {
        const newLayer: Layer = {
            id: generateId(),
            type,
            content,
            style: {
                ...DEFAULT_STYLE,
                ...style,
                zIndex: layers.length, // Auto-increment z-index
            },
        };

        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id); // Auto-select newly added layer
    }, [layers.length]);

    // Update style properties of a specific layer
    const updateLayerStyle = useCallback((layerId: string, style: Partial<LayerStyle>) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === layerId
                    ? { ...layer, style: { ...layer.style, ...style } }
                    : layer
            )
        );
    }, []);

    // Update content of a specific layer
    const updateLayerContent = useCallback((layerId: string, content: string) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === layerId ? { ...layer, content } : layer
            )
        );
    }, []);

    // Select a layer (or deselect if null)
    const selectLayer = useCallback((layerId: string | null) => {
        setSelectedLayerId(layerId);
    }, []);

    // Delete a layer
    const deleteLayer = useCallback((layerId: string) => {
        setLayers((prev) => prev.filter((layer) => layer.id !== layerId));

        // If deleted layer was selected, deselect
        if (selectedLayerId === layerId) {
            setSelectedLayerId(null);
        }
    }, [selectedLayerId]);

    // Reorder layer (change z-index)
    const reorderLayer = useCallback((layerId: string, newZIndex: number) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === layerId
                    ? { ...layer, style: { ...layer.style, zIndex: newZIndex } }
                    : layer
            )
        );
    }, []);

    // Clear all layers
    const clearLayers = useCallback(() => {
        setLayers([]);
        setSelectedLayerId(null);
    }, []);

    // Get a specific layer
    const getLayer = useCallback((layerId: string): Layer | undefined => {
        return layers.find((layer) => layer.id === layerId);
    }, [layers]);

    const value: StudioContextType = {
        layers,
        selectedLayerId,
        addLayer,
        updateLayerStyle,
        updateLayerContent,
        selectLayer,
        deleteLayer,
        reorderLayer,
        clearLayers,
        getLayer,
    };

    return (
        <StudioContext.Provider value={value}>
            {children}
        </StudioContext.Provider>
    );
}

// Custom hook for using Studio context
export function useStudio() {
    const context = useContext(StudioContext);
    if (context === undefined) {
        throw new Error('useStudio must be used within a StudioProvider');
    }
    return context;
}
