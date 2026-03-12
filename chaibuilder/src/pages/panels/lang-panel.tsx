import { Button } from "@chaibuilder/components/ui/button";
import { useWebsiteSetting } from "@chaibuilder/pages/hooks/project/use-website-settings";
import { get, has } from "lodash-es";
import { LanguagesIcon } from "lucide-react";
import { lazy } from "react";
const LangPanel = lazy(() => import("../client/components/lang-panel"));

export const LangButton = ({ isActive, show }: { isActive: boolean; show: () => void }) => {
  const { data: websiteSetting } = useWebsiteSetting();

  if (!has(websiteSetting, "languages") || !get(websiteSetting, "languages", []).length) return null;

  return (
    <Button size="sm" onClick={show} variant={isActive ? "default" : "ghost"}>
      <LanguagesIcon className="h-4 w-4" />
    </Button>
  );
};

export const langPanelId = "lang";
export const langPanel = {
  id: langPanelId,
  label: "Languages",
  position: "top" as const,
  panel: LangPanel,
  button: LangButton,
  view: "modal" as const,
  width: 400,
};
