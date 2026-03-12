import { CHAI_BUILDER_EVENTS } from "@chaibuilder/core/events";
import { pubsub } from "@chaibuilder/core/pubsub";
import { GearIcon } from "@radix-ui/react-icons";

interface GotoSettingsIconProps {
  blockId?: string;
  className?: string;
}

export const GotoSettingsIcon = ({ blockId, className }: GotoSettingsIconProps) => {
  const handleClick = () => {
    if (blockId) {
      pubsub.publish(CHAI_BUILDER_EVENTS.GOTO_BLOCK_SETTINGS, blockId);
    }
  };

  return <GearIcon className={className} onClick={handleClick} />;
};
