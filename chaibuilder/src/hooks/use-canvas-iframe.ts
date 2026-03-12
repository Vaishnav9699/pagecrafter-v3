import { canvasIframeAtom } from "@chaibuilder/atoms/ui";
import { useAtom } from "jotai";

export const useCanvasIframe = () => useAtom(canvasIframeAtom);
