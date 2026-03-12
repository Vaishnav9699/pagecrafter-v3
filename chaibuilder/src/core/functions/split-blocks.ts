import { convertToBlocksTree } from "@chaibuilder/core/functions/blocks-fn";
import { ChaiBlock } from "@chaibuilder/types/common";

export function getBlocksTree(blocks: ChaiBlock[]) {
  return convertToBlocksTree(blocks);
}
