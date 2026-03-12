import { PartialBlockEntry, PartialBlockList } from "@chaibuilder/types/partial-blocks";
import { atom } from "jotai";

/**
 * Consolidated atom storing all partial block data
 */
export const partialBlocksAtom = atom<Record<string, PartialBlockEntry>>({});

/**
 * Atom for storing the list of available partial blocks
 */
export const partialBlocksListAtom = atom<PartialBlockList>({});
