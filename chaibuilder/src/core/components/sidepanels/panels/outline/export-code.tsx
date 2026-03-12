import { DropdownMenuItem } from "@chaibuilder/components/ui/dropdown-menu";
import { CHAI_BUILDER_EVENTS } from "@chaibuilder/core/events";
import { pubsub } from "@chaibuilder/core/pubsub";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useSelectedBlockIds } from "@chaibuilder/hooks/use-selected-blockIds";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const ExportCode = () => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  const exportCodeEnabled = useBuilderProp("flags.exportCode", false);

  if (!exportCodeEnabled) {
    return null;
  }

  return (
    <DropdownMenuItem
      className="flex items-center gap-x-4 text-xs"
      onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, selectedIds)}>
      <DownloadIcon /> {t("Export")}
    </DropdownMenuItem>
  );
};
