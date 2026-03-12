import { Label } from "@chaibuilder/components/ui/label";
import { Switch } from "@chaibuilder/components/ui/switch";
import { AiIcon } from "@chaibuilder/core/components/ai/ai-icon";
import { PERMISSIONS } from "@chaibuilder/core/main";
import { useAiAssistant } from "@chaibuilder/hooks/use-ask-ai";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { usePermissions } from "@chaibuilder/hooks/use-permissions";
import { useRightPanel } from "@chaibuilder/hooks/use-theme";
import { useTranslation } from "react-i18next";

export const AiAssistant = () => {
  const setAiAssistantActive = useAiAssistant();
  const [panel] = useRightPanel();
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  const isAiEnabled = useBuilderProp("flags.ai", false);
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  if (!askAiCallBack || !hasPermission(PERMISSIONS.EDIT_BLOCK) || !isAiEnabled) return null;
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="ai-assistant" className="flex items-center gap-x-1 text-sm text-yellow-600">
        <AiIcon className="h-4 w-4" />
        {t("AI Assistant")}
      </Label>
      <Switch
        className={"scale-90"}
        checked={panel === "ai"}
        onCheckedChange={(state) => {
          setAiAssistantActive(state);
        }}
        id="ai-assistant"
      />
    </div>
  );
};
