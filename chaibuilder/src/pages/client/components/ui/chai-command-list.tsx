import { CommandList } from "@chaibuilder/components/ui/command";
import React from "react";

interface ChaiCommandListProps extends React.ComponentProps<typeof CommandList> {
  children: React.ReactNode;
}

const ChaiCommandList: React.FC<ChaiCommandListProps> = ({ children, onWheel, ...props }) => {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Apply the default wheel behavior
    try {
      e.preventDefault();
      const container = e.currentTarget;
      container.scrollTop += e.deltaY;
    } catch {
      e.preventDefault();
    }

    // If there's a custom onWheel handler, call it too
    if (onWheel) {
      onWheel(e);
    }
  };

  return (
    <CommandList {...props} onWheel={handleWheel}>
      {children}
    </CommandList>
  );
};

export default ChaiCommandList;
