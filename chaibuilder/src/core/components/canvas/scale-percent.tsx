import { useCanvasZoom } from "@chaibuilder/hooks/use-canvas-zoom";
import { ZoomInIcon } from "@radix-ui/react-icons";
import { round } from "lodash-es";

export const ScalePercent = () => {
  const [zoom] = useCanvasZoom();
  return (
    <div className="flex w-12 cursor-not-allowed items-center justify-center gap-x-1 space-x-0 font-medium text-gray-400">
      <ZoomInIcon className="h-3.5 w-3.5 flex-shrink-0" /> <div className="text-xs leading-3">{round(zoom, 0)}%</div>
    </div>
  );
};
