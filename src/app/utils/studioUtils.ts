/**
 * Studio Mode Utility Functions
 * Helper functions for layer manipulation, export, and code generation
 */

import { Layer, LayerStyle, ExportFormat, AlignmentType } from '../types/studio.types';

/**
 * Generate unique layer ID
 */
export function generateLayerId(): string {
    return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clone a layer with a new ID
 */
export function cloneLayer(layer: Layer): Layer {
    return {
        ...layer,
        id: generateLayerId(),
        style: { ...layer.style },
    };
}

/**
 * Calculate bounding box for multiple layers
 */
export function calculateBoundingBox(layers: Layer[]): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    if (layers.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...layers.map(l => l.style.x));
    const minY = Math.min(...layers.map(l => l.style.y));
    const maxX = Math.max(...layers.map(l => l.style.x + l.style.width));
    const maxY = Math.max(...layers.map(l => l.style.y + l.style.height));

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Align layers
 */
export function alignLayers(
    layers: Layer[],
    alignment: AlignmentType
): Layer[] {
    if (layers.length === 0) return layers;

    const bbox = calculateBoundingBox(layers);

    return layers.map(layer => {
        let newStyle: Partial<LayerStyle> = {};

        switch (alignment) {
            case 'left':
                newStyle.x = bbox.x;
                break;
            case 'center':
                newStyle.x = bbox.x + (bbox.width - layer.style.width) / 2;
                break;
            case 'right':
                newStyle.x = bbox.x + bbox.width - layer.style.width;
                break;
            case 'top':
                newStyle.y = bbox.y;
                break;
            case 'middle':
                newStyle.y = bbox.y + (bbox.height - layer.style.height) / 2;
                break;
            case 'bottom':
                newStyle.y = bbox.y + bbox.height - layer.style.height;
                break;
        }

        return {
            ...layer,
            style: { ...layer.style, ...newStyle },
        };
    });
}

/**
 * Distribute layers evenly
 */
export function distributeLayers(
    layers: Layer[],
    direction: 'horizontal' | 'vertical'
): Layer[] {
    if (layers.length < 3) return layers;

    const sorted = [...layers].sort((a, b) =>
        direction === 'horizontal'
            ? a.style.x - b.style.x
            : a.style.y - b.style.y
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const totalSpace =
        direction === 'horizontal'
            ? last.style.x - first.style.x - first.style.width
            : last.style.y - first.style.y - first.style.height;

    const spacing = totalSpace / (sorted.length - 1);

    return sorted.map((layer, index) => {
        if (index === 0 || index === sorted.length - 1) return layer;

        const newStyle: Partial<LayerStyle> =
            direction === 'horizontal'
                ? { x: first.style.x + first.style.width + spacing * index }
                : { y: first.style.y + first.style.height + spacing * index };

        return {
            ...layer,
            style: { ...layer.style, ...newStyle },
        };
    });
}

/**
 * Snap position to grid
 */
export function snapToGrid(
    value: number,
    gridSize: number = 10
): number {
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Export layers to different formats
 */
export function exportLayers(
    layers: Layer[],
    format: ExportFormat
): string {
    switch (format) {
        case 'json':
            return JSON.stringify(layers, null, 2);

        case 'react':
            return generateReactCode(layers);

        case 'html':
            return generateHTMLCode(layers);

        case 'vue':
            return generateVueCode(layers);

        case 'css':
            return generateCSSCode(layers);

        default:
            return JSON.stringify(layers, null, 2);
    }
}

/**
 * Generate React component code
 */
export function generateReactCode(layers: Layer[]): string {
    const sortedLayers = [...layers].sort((a, b) => a.style.zIndex - b.style.zIndex);

    const components = sortedLayers
        .map((layer, index) => {
            const style = generateStyleObject(layer.style);
            const content = escapeJSX(layer.content);

            return `      <div
        key="${layer.id}"
        style={${style}}
        className="layer-${layer.type}"
      >
        ${content}
      </div>`;
        })
        .join('\n\n');

    return `import React from 'react';

export default function GeneratedComponent() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
${components}
    </div>
  );
}`;
}

/**
 * Generate HTML code
 */
export function generateHTMLCode(layers: Layer[]): string {
    const sortedLayers = [...layers].sort((a, b) => a.style.zIndex - b.style.zIndex);

    const elements = sortedLayers
        .map(layer => {
            const style = generateInlineStyle(layer.style);
            const content = escapeHTML(layer.content);

            return `    <div class="layer layer-${layer.type}" style="${style}">
      ${content}
    </div>`;
        })
        .join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Layout</title>
</head>
<body>
  <div class="canvas" style="position: relative; width: 100%; height: 100vh;">
${elements}
  </div>
</body>
</html>`;
}

/**
 * Generate Vue component code
 */
export function generateVueCode(layers: Layer[]): string {
    const sortedLayers = [...layers].sort((a, b) => a.style.zIndex - b.style.zIndex);

    const elements = sortedLayers
        .map(layer => {
            const style = generateStyleObject(layer.style);
            const content = escapeHTML(layer.content);

            return `    <div
      :style="${style}"
      class="layer-${layer.type}"
    >
      ${content}
    </div>`;
        })
        .join('\n\n');

    return `<template>
  <div class="canvas">
${elements}
  </div>
</template>

<script>
export default {
  name: 'GeneratedComponent',
};
</script>

<style scoped>
.canvas {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>`;
}

/**
 * Generate CSS code
 */
export function generateCSSCode(layers: Layer[]): string {
    return layers
        .map(layer => {
            const styles = Object.entries(layer.style)
                .map(([key, value]) => {
                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    const cssValue = typeof value === 'number' ? `${value}px` : value;
                    return `  ${cssKey}: ${cssValue};`;
                })
                .join('\n');

            return `.layer-${layer.id} {
  position: absolute;
${styles}
}`;
        })
        .join('\n\n');
}

/**
 * Helper: Generate style object for React
 */
function generateStyleObject(style: LayerStyle): string {
    const entries = Object.entries(style).map(([key, value]) => {
        const cssValue = typeof value === 'number' && key !== 'zIndex' && key !== 'opacity'
            ? `'${value}px'`
            : typeof value === 'string'
                ? `'${value}'`
                : value;
        return `    ${key}: ${cssValue}`;
    });

    return `{
    position: 'absolute',
${entries.join(',\n')}
  }`;
}

/**
 * Helper: Generate inline style for HTML
 */
function generateInlineStyle(style: LayerStyle): string {
    return Object.entries(style)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssValue = typeof value === 'number' ? `${value}px` : value;
            return `${cssKey}: ${cssValue}`;
        })
        .join('; ');
}

/**
 * Helper: Escape HTML content
 */
function escapeHTML(html: string): string {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Helper: Escape JSX content
 */
function escapeJSX(content: string): string {
    return content.replace(/[{}]/g, match => `{'${match}'}`);
}

/**
 * Download file utility
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
