'use client';

import React, { useEffect, useState } from 'react';
import { RenderChaiBlocks, applyDesignTokens, getChaiThemeCssVariables } from '@chaibuilder/render';
import { loadWebBlocks } from '@chaibuilder/web-blocks';
import { registerChaiFont } from "@chaibuilder/runtime";
import { registerChaiLibrary } from "@chaibuilder/runtime/client";
import { defaultChaiLibrary } from "@chaibuilder/core/library-blocks/default-chai-library";
import { EXTERNAL_DATA } from "@chaibuilder/routes/demo/EXTERNAL_DATA";
import '@chaibuilder/index.css';

export default function PreviewPage() {
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState(null);
  const [designTokens, setDesignTokens] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadWebBlocks();
    registerChaiLibrary("chai", defaultChaiLibrary());
    registerChaiFont("Bungee", {
      src: [{ url: "/fonts/bungee/Bungee-Regular.woff2", format: "woff2" }],
      fallback: "serif",
    });
    
    // Load initial data
    const lsBlocks = localStorage.getItem('chai-builder-blocks');
    if (lsBlocks) setBlocks(JSON.parse(lsBlocks));
    
    const lsTheme = localStorage.getItem('chai-builder-theme');
    if (lsTheme) setTheme(JSON.parse(lsTheme));
    
    const lsDesignTokens = localStorage.getItem('chai-builder-design-tokens');
    if (lsDesignTokens) setDesignTokens(JSON.parse(lsDesignTokens));

    const channel = new BroadcastChannel('chaibuilder');
    channel.onmessage = (event) => {
      if (event.data.type === 'blocks-updated') {
        setBlocks(event.data.blocks);
      }
      if (event.data.type === 'theme-updated') {
        setTheme(event.data.theme);
      }
      if (event.data.type === 'design-tokens-updated') {
        setDesignTokens(event.data.designTokens);
      }
    };

    return () => channel.close();
  }, []);

  if (!mounted) return null;

  const themeVariables = theme ? getChaiThemeCssVariables({ theme }) : '';
  // Important: applyDesignTokens creates a new array with resolved styles
  const blocksWithTokens = designTokens ? applyDesignTokens(blocks, designTokens) : blocks;

  return (
    <div className="min-h-screen bg-white">
      {themeVariables && <style dangerouslySetInnerHTML={{ __html: themeVariables }} />}
      <RenderChaiBlocks blocks={blocksWithTokens} externalData={EXTERNAL_DATA} />
    </div>
  );
}
