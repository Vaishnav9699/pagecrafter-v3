"use client";

import { Button } from "@chaibuilder/components/ui/button";
import { useBlocksHtmlForAi } from "@chaibuilder/hooks/use-blocks-html-for-ai";
import { useHtmlToBlocks } from "@chaibuilder/hooks/use-html-to-blocks";
import { useI18nBlocks } from "@chaibuilder/hooks/use-i18n-blocks";
import { useReplaceBlock } from "@chaibuilder/hooks/use-replace-block";
import { useSelectedBlock } from "@chaibuilder/hooks/use-selected-blockIds";
import { useState } from "react";

export default function AIChatPanel() {
  const selectedBlock = useSelectedBlock();
  const blocksHtmlForAi = useBlocksHtmlForAi();
  const htmlToBlocks = useHtmlToBlocks();
  const i18nBlocks = useI18nBlocks();
  const [html, setHtml] = useState("");
  const replaceBlock = useReplaceBlock();
  const add = () => {
    const blocks = htmlToBlocks(html);
    replaceBlock(selectedBlock?._id, blocks);
  };
  return (
    <div>
      <textarea className="mt-10" rows={5} value={html} onChange={(e) => setHtml(e.target.value)}></textarea>
      <Button onClick={add}>Import HTML</Button>
      <Button onClick={() => console.log(blocksHtmlForAi({ blockId: selectedBlock?._id }))}>Get Blocks HTML</Button>
      <Button onClick={() => console.log(i18nBlocks("fr"))}>Get I18n Blocks</Button>
    </div>
  );
}
