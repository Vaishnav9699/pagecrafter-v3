import { useFrame } from "@chaibuilder/core/frame";
import { useKeyEventWatcher } from "@chaibuilder/hooks/use-key-event-watcher";

export const KeyboardHandler = () => {
  const { document: iframeDoc } = useFrame();
  useKeyEventWatcher(iframeDoc);
  return null;
};
