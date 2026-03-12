import { Button } from "@chaibuilder/components/ui/button";
import { useSavePage } from "@chaibuilder/hooks/use-save-page";
import { useRightPanel } from "@chaibuilder/hooks/use-theme";
import { usePreviewMode } from "@chaibuilder/hooks/use-preview-mode";
import { CheckIcon, CodeIcon, ExternalLinkIcon, EyeOpenIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { pubsub } from "@chaibuilder/core/pubsub";
import { CHAI_BUILDER_EVENTS } from "@chaibuilder/core/events";

export default function RightTop() {
  const [panel, setRightPanel] = useRightPanel();
  const [, setPreviewMode] = usePreviewMode();
  const { savePage, saveState } = useSavePage();
  return (
    <div className="flex items-center gap-2 rounded-lg p-2">
      <Button
        variant={panel === "theme" ? "secondary" : "ghost"}
        size="sm"
        className="gap-2"
        onClick={() => setRightPanel(panel !== "theme" ? "theme" : "block")}>
        <MixerHorizontalIcon className="h-4 w-4" />
        Theme
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE)}>
        <CodeIcon className="h-4 w-4" />
        Code
      </Button>
      <div className="flex items-center -space-x-px">
        <Button variant="outline" size="sm" className="z-10 gap-2 rounded-r-none border-r-0" onClick={() => setPreviewMode(true)}>
          <EyeOpenIcon className="h-4 w-4" />
          Preview
        </Button>
        <a href="/preview" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="rounded-l-none px-2 hover:bg-gray-100">
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
        </a>
      </div>
      <Button variant="default" size="sm" className="gap-2" onClick={() => savePage(false)}>
        <CheckIcon className="h-4 w-4" />
        {saveState === "UNSAVED" ? "Draft" : "Saved"}
      </Button>
    </div>
  );
}
