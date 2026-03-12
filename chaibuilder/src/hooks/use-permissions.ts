import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useCallback } from "react";

export const usePermissions = () => {
  const permissions = useBuilderProp("permissions", null) as string[] | null | undefined;
  const hasPermission = useCallback(
    (permission: string) => {
      if (!permissions) return true;
      return permissions.includes(permission);
    },
    [permissions],
  );

  return { hasPermission };
};
