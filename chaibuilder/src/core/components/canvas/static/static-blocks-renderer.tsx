import { canvasRenderKeyAtom } from "@chaibuilder/core/components/canvas/dnd/drag-and-drop/hooks/use-drag-and-drop";
import { PageBlocksRenderer } from "@chaibuilder/core/components/canvas/static/new-blocks-renderer";
import { useBlocksStore } from "@chaibuilder/hooks/history/use-blocks-store-undoable-actions";
import { useAtom } from "jotai";
import { isEmpty } from "lodash-es";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const [renderKey] = useAtom(canvasRenderKeyAtom);
  const blocksHtml = isEmpty(blocks) ? null : <PageBlocksRenderer key={renderKey} />;
  return <>{blocksHtml}</>;
};
