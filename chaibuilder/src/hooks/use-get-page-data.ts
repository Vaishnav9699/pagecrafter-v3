import { useBlocksStore } from "@chaibuilder/hooks/history/use-blocks-store-undoable-actions";
import { useBrandingOptions } from "@chaibuilder/hooks/use-branding-options";
import { useCurrentPage } from "@chaibuilder/hooks/use-current-page";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { ChaiBlock } from "@chaibuilder/types/common";
import { compact, get, map, memoize, omit } from "lodash-es";
import { useCallback } from "react";

/**
 * Get the builder props for a block
 * @param type - The type of the block
 * @returns The builder props for the block
 */
const getBlockBuilderProps = memoize((type: string) => {
  const registeredBlock = getRegisteredChaiBlock(type);
  const props = get(registeredBlock, "schema.properties", {}) as Record<string, unknown>;
  return compact(
    Object.keys(props).map((key) => {
      return get(props[key], "builderProp", false) || get(props[key], "runtime", false) ? key : null;
    }),
  );
});

export const useGetPageData = () => {
  const [projectOptions] = useBrandingOptions();
  const { currentPage } = useCurrentPage();
  const [presentBlocks] = useBlocksStore();

  return useCallback(() => {
    // omit the builder props from the blocks as they are not needed for the page data
    // and only used inside the builder
    const blocks = map<ChaiBlock>(presentBlocks, (block: ChaiBlock) => {
      return omit(block, getBlockBuilderProps(block._type));
    });
    return {
      currentPage,
      blocks,
    };
  }, [projectOptions, currentPage, presentBlocks]);
};
