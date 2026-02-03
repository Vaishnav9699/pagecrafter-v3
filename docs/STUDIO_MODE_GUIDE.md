# Studio Mode - Usage Guide

## Overview
The Studio Mode provides a canvas-to-code workflow for PageCrafter. It uses React Context to manage layers, their styles, and interactions.

## Installation

### 1. Add StudioProvider to your layout

```tsx
// src/app/layout.tsx
import { StudioProvider } from './contexts/StudioContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StudioProvider>
          {children}
        </StudioProvider>
      </body>
    </html>
  );
}
```

## Core Concepts

### Layer Structure
```typescript
interface Layer {
  id: string;                    // Unique identifier
  type: 'text' | 'batch' | 'shape';  // Layer type
  content: string;               // Content or shape name
  style: LayerStyle;             // Styling properties
}

interface LayerStyle {
  x: number;          // X position
  y: number;          // Y position
  width: number;      // Width in pixels
  height: number;     // Height in pixels
  fontSize?: number;  // Font size (for text)
  color?: string;     // Color (hex or named)
  zIndex: number;     // Stacking order
}
```

## API Reference

### Context Methods

#### `addLayer(type, content, style?)`
Adds a new layer to the canvas.

```tsx
const { addLayer } = useStudio();

// Add text layer
addLayer('text', 'Hello World', {
  x: 100,
  y: 100,
  fontSize: 24,
  color: '#4F46E5'
});

// Add shape layer
addLayer('shape', 'circle', {
  x: 200,
  y: 200,
  width: 100,
  height: 100,
  color: '#EF4444'
});

// Add batch layer
addLayer('batch', 'Component Group', {
  x: 300,
  y: 100,
  width: 200,
  height: 150
});
```

#### `updateLayerStyle(layerId, style)`
Updates style properties of a specific layer.

```tsx
const { updateLayerStyle } = useStudio();

updateLayerStyle('layer-123', {
  x: 150,
  y: 200,
  fontSize: 32,
  color: '#10B981'
});
```

#### `updateLayerContent(layerId, content)`
Updates the content of a layer.

```tsx
const { updateLayerContent } = useStudio();

updateLayerContent('layer-123', 'Updated Text');
```

#### `selectLayer(layerId)`
Selects a layer (or deselects if null).

```tsx
const { selectLayer } = useStudio();

selectLayer('layer-123');  // Select layer
selectLayer(null);          // Deselect all
```

#### `deleteLayer(layerId)`
Removes a layer from the canvas.

```tsx
const { deleteLayer } = useStudio();

deleteLayer('layer-123');
```

#### `reorderLayer(layerId, newZIndex)`
Changes the z-index (stacking order) of a layer.

```tsx
const { reorderLayer } = useStudio();

reorderLayer('layer-123', 10); // Bring to front
```

#### `clearLayers()`
Removes all layers from the canvas.

```tsx
const { clearLayers } = useStudio();

clearLayers();
```

#### `getLayer(layerId)`
Retrieves a specific layer by ID.

```tsx
const { getLayer } = useStudio();

const layer = getLayer('layer-123');
console.log(layer?.content);
```

## Example Usage

### Basic Component

```tsx
'use client';

import { useStudio } from '@/app/contexts/StudioContext';

export default function MyStudioComponent() {
  const { layers, addLayer, selectedLayerId, selectLayer } = useStudio();

  return (
    <div>
      <button onClick={() => addLayer('text', 'New Text')}>
        Add Text
      </button>
      
      <div>
        {layers.map(layer => (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer.id)}
            style={{
              position: 'absolute',
              left: layer.style.x,
              top: layer.style.y,
              border: layer.id === selectedLayerId ? '2px solid blue' : 'none'
            }}
          >
            {layer.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Advanced: Drag and Drop

```tsx
const handleDragEnd = (layerId: string, newX: number, newY: number) => {
  updateLayerStyle(layerId, { x: newX, y: newY });
};
```

### Advanced: Layer Properties Panel

```tsx
export function LayerPropertiesPanel() {
  const { layers, selectedLayerId, updateLayerStyle } = useStudio();
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  if (!selectedLayer) return null;

  return (
    <div className="properties-panel">
      <h3>Layer Properties</h3>
      
      <label>
        X Position:
        <input
          type="number"
          value={selectedLayer.style.x}
          onChange={(e) => updateLayerStyle(selectedLayer.id, { 
            x: parseInt(e.target.value) 
          })}
        />
      </label>

      <label>
        Y Position:
        <input
          type="number"
          value={selectedLayer.style.y}
          onChange={(e) => updateLayerStyle(selectedLayer.id, { 
            y: parseInt(e.target.value) 
          })}
        />
      </label>

      <label>
        Color:
        <input
          type="color"
          value={selectedLayer.style.color}
          onChange={(e) => updateLayerStyle(selectedLayer.id, { 
            color: e.target.value 
          })}
        />
      </label>
    </div>
  );
}
```

## Canvas-to-Code Export

### Export Layers as JSON

```tsx
export function ExportButton() {
  const { layers } = useStudio();

  const exportToJSON = () => {
    const json = JSON.stringify(layers, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studio-layers.json';
    a.click();
  };

  return (
    <button onClick={exportToJSON}>
      Export to JSON
    </button>
  );
}
```

### Generate React Code

```tsx
export function generateReactCode(layers: Layer[]): string {
  const components = layers
    .sort((a, b) => a.style.zIndex - b.style.zIndex)
    .map(layer => {
      const style = `style={{
  position: 'absolute',
  left: '${layer.style.x}px',
  top: '${layer.style.y}px',
  width: '${layer.style.width}px',
  height: '${layer.style.height}px',
  ${layer.style.fontSize ? `fontSize: '${layer.style.fontSize}px',` : ''}
  ${layer.style.color ? `color: '${layer.style.color}',` : ''}
  zIndex: ${layer.style.zIndex}
}}`;

      return `<div ${style}>${layer.content}</div>`;
    })
    .join('\n');

  return `export default function GeneratedComponent() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      ${components}
    </div>
  );
}`;
}
```

## Best Practices

1. **Z-Index Management**: Use `reorderLayer` to manage stacking order
2. **Performance**: Avoid updating all layers at once; update individual layers
3. **Selection**: Always check if a layer is selected before performing operations
4. **Persistence**: Consider saving layers to localStorage or a database
5. **Undo/Redo**: Implement state history for better UX

## Next Steps

- Add keyboard shortcuts (Delete, Ctrl+C, Ctrl+V)
- Implement layer grouping
- Add layer locking/unlocking
- Create preset templates
- Build export functionality for different frameworks
