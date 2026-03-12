import { cn } from "@chaibuilder/core/functions/common-functions";
import { ChaiStyles } from "@chaibuilder/types/blocks";

export const addForcedClasses = (styles: ChaiStyles, ...classes: string[]) => {
  // get all the classes from the blockStateClasses if the value is true
  return {
    ...styles,
    className: cn(styles.className, ...classes),
  };
};
