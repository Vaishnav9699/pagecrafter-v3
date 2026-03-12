import { chaiExternalDataAtom } from "@chaibuilder/atoms/builder";
import { useAtom } from "jotai";

export const useChaiExternalData = () => useAtom(chaiExternalDataAtom);
