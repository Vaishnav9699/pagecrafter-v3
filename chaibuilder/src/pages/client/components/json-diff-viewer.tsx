"use client";

import { Badge } from "@chaibuilder/components/ui/badge";
import { Button } from "@chaibuilder/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@chaibuilder/components/ui/dialog";
import { ScrollArea } from "@chaibuilder/components/ui/scroll-area";
import { Switch } from "@chaibuilder/components/ui/switch";
import { formatDate } from "date-fns";
import { isArray, isPlainObject, isString, map, mapValues, startsWith, trim } from "lodash-es";
import { Check, Copy, FileJson, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { Diff, Hunk, parseDiff } from "react-diff-view";
import { useRevisionComparison } from "@chaibuilder/pages/hooks/use-revision-comparison";
import { useChaiUserInfo } from "@chaibuilder/pages/hooks/utils/use-chai-user-info";

const RevisionTag = ({ version }: { version: { uid: string; label: string; item: any } }) => {
  const item = version?.item;
  const { data: user } = useChaiUserInfo(item?.currentEditor);
  const isLive = version.label === "live";
  const isDraft = version.label === "draft";

  return (
    <span
      className={`flex min-h-8 items-center gap-x-2 rounded border bg-white px-2 text-xs shadow-lg ${isLive ? "border-green-500/30" : isDraft ? "border-amber-500/30" : "border-purple-500/30"}`}>
      <div
        className={
          "h-full items-center rounded px-1.5 py-0.5 font-medium capitalize" +
          (isLive
            ? " bg-green-500 text-green-50"
            : isDraft
              ? " bg-amber-500 text-amber-50"
              : " bg-purple-500 text-purple-50")
        }>
        {version.label}
      </div>
      <div className="py-1 text-xs font-light leading-none text-gray-800">
        <div>
          <span className="font-light opacity-90">{isDraft ? "Currently editing" : "Published by"}</span>
          {!isDraft && <span className="pl-1 font-medium">{user?.name || "Unknown"}</span>}
        </div>
        {item?.createdAt && (
          <div className="pt-0.5 text-[10px] leading-tight">{formatDate(item.createdAt, "dd MMM yyyy, h:mm a")}</div>
        )}
      </div>
    </span>
  );
};

// Tags component from page-revisions.tsx
const Tags = ({ version }: { version: { uid: string; label: string; item: any } }) => {
  return <RevisionTag version={version} />;
};

// Function to generate git diff format from JSON objects
function generateGitDiff(oldData: any, newData: any, filename: string = "data.json"): string {
  const oldJson = JSON.stringify(oldData, null, 2);
  const newJson = JSON.stringify(newData, null, 2);

  const oldLines = oldJson.split("\n");
  const newLines = newJson.split("\n");

  let diff = `--- a/${filename}\n`;
  diff += `+++ b/${filename}\n`;

  // Create a more sophisticated diff
  const changes: string[] = [];
  let i = 0,
    j = 0;

  while (i < oldLines.length || j < newLines.length) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[j] || "";

    if (oldLine === newLine) {
      changes.push(` ${oldLine}`);
      i++;
      j++;
    } else {
      // Find the next matching line
      let oldMatch = -1,
        newMatch = -1;

      // Look ahead in old lines
      for (let k = i + 1; k < oldLines.length; k++) {
        if (newLines[j] === oldLines[k]) {
          oldMatch = k;
          break;
        }
      }

      // Look ahead in new lines
      for (let k = j + 1; k < newLines.length; k++) {
        if (oldLines[i] === newLines[k]) {
          newMatch = k;
          break;
        }
      }

      if (oldMatch !== -1 && (newMatch === -1 || oldMatch - i <= newMatch - j)) {
        // Remove lines from old
        for (let k = i; k < oldMatch; k++) {
          changes.push(`-${oldLines[k]}`);
        }
        i = oldMatch;
      } else if (newMatch !== -1) {
        // Add lines to new
        for (let k = j; k < newMatch; k++) {
          changes.push(`+${newLines[k]}`);
        }
        j = newMatch;
      } else {
        // No match found, replace current line
        if (oldLine) changes.push(`-${oldLine}`);
        if (newLine) changes.push(`+${newLine}`);
        i++;
        j++;
      }
    }
  }

  // Add hunk header
  const oldCount = oldLines.length;
  const newCount = newLines.length;
  diff += `@@ -1,${oldCount} +1,${newCount} @@\n`;

  // Add all changes
  diff += changes.join("\n") + "\n";

  return diff;
}

// * Deep parse JSON
function deepParseJSON(input: any, allowPrimitives = true, strict = false): any {
  // * If it's a string, check if it "looks" like JSON
  if (isString(input)) {
    const str = trim(input);

    const looksLikeJSON =
      startsWith(str, "{") ||
      startsWith(str, "[") ||
      (allowPrimitives &&
        (str === "true" || str === "false" || str === "null" || /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str)));

    if (looksLikeJSON) {
      try {
        const parsed = JSON.parse(str);
        return deepParseJSON(parsed, allowPrimitives, strict);
      } catch {
        if (strict) {
          throw new Error(`Invalid JSON string: ${str}`);
        }
        return {};
      }
    }

    return input;
  }

  // * If it's an array, recurse into each item
  if (isArray(input)) {
    return map(input, (item) => deepParseJSON(item, allowPrimitives, strict));
  }

  // * If it's a plain object, recurse into its values
  if (isPlainObject(input)) {
    return mapValues(input, (val) => deepParseJSON(val, allowPrimitives, strict));
  }

  // * Return any other values as-is
  return input;
}

/**
 *
 * @param key
 * Returns a human-readable label for a given comparison type key.
 *
 * @param key - The key representing a comparison type (e.g., "blocks", "seo", "tracking").
 * @returns The label to display for the given comparison type key.
 */
const getCompareTypeOptionLabel = (key: string): string => {
  switch (key) {
    case "blocks":
      return "Blocks";
    case "seo":
      return "SEO";
    case "tracking":
      return "Tracking";
    default:
      return key;
  }
};

/**
 *
 * @param leftData
 * @param rightData
 * @returns Compare Options
 */
const getCompareOptions = (leftData: any, rightData: any) => {
  if (!leftData || !rightData) return [{ key: "blocks", label: "Blocks" }];

  const leftKeys = Object.keys(leftData);
  const rightKeys = Object.keys(rightData);
  const commonKeys = leftKeys.filter((key) => rightKeys.includes(key));

  const options = commonKeys
    .map((key) => ({ key: key, label: getCompareTypeOptionLabel(key) }))
    .filter((item) => item.key.length > 0);

  return options;
};

/**
 *
 * @param changes
 * @returns Data without common data
 */
const withHiddenCommonData = (changes: any[], contextLines: number = 3): any[] => {
  const keepIndexes = new Set<number>();

  // Find indexes of non-normal lines (real changes)
  const changeIndexes = changes
    .map((change, index) => ({ change, index }))
    .filter(({ change }) => change.type !== "normal")
    .map(({ index }) => index);

  // Add context lines around each change
  changeIndexes.forEach((i) => {
    const start = Math.max(0, i - contextLines);
    const end = Math.min(changes.length - 1, i + contextLines);
    for (let j = start; j <= end; j++) {
      keepIndexes.add(j);
    }
  });

  // Collect filtered changes and detect gaps for hidden lines
  const result: any[] = [];
  let prevIndex = -1;

  changes.forEach((change, index) => {
    if (keepIndexes.has(index)) {
      // If there's a gap from prevIndex to current index, insert hidden entry
      if (prevIndex !== -1 && index - prevIndex > 1) {
        const hiddenFrom = changes[prevIndex].lineNumber != null ? changes[prevIndex].lineNumber + 1 : prevIndex + 2;
        const hiddenTo = changes[index].lineNumber != null ? changes[index].lineNumber - 1 : index;
        result.push({
          content: (
            <Badge className="pointer-events-none w-60 -translate-x-1/2 cursor-default border-none bg-transparent py-1 shadow-none">
              <span className="rounded border border-border bg-muted px-3 py-1 text-xs font-light leading-none text-muted-foreground">
                No changes from {hiddenFrom} to {hiddenTo} line
              </span>
            </Badge>
          ),
        });
      }
      result.push(change);
      prevIndex = index;
    }
  });

  return result;
};

interface JsonDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compare: { uid: string; label: string; item: any }[];
}

export default function JsonDiffViewer({ open, compare, onOpenChange }: JsonDiffViewerProps) {
  const version1 = compare[0];
  const version2 = compare[1];

  const [copiedSide, setCopiedSide] = useState<"left" | "right" | null>(null);
  const [viewType, setViewType] = useState<"split" | "unified">("split");
  const [showRawData, setShowRawData] = useState(false);
  const [hideCommonData, setHideCommonData] = useState(true);
  const [compareType, setCompareType] = useState("blocks");

  const { data: comparisonData, isLoading } = useRevisionComparison(version1, version2);

  const { leftData, rightData, options } = useMemo(() => {
    const _leftData = comparisonData?.version1?.[compareType];
    const _rightData = comparisonData?.version2?.[compareType];
    const leftData = deepParseJSON(_leftData);
    const rightData = deepParseJSON(_rightData);
    const options = getCompareOptions(comparisonData?.version1, comparisonData?.version2);
    return { leftData, rightData, options };
  }, [comparisonData, compareType]);

  const gitDiffText = useMemo(() => {
    if (!leftData || !rightData) return "";
    return generateGitDiff(leftData, rightData);
  }, [leftData, rightData]);

  const parsedDiff = useMemo(() => {
    if (!gitDiffText) return [];
    try {
      return parseDiff(gitDiffText);
    } catch (error) {
      console.error("Failed to parse diff:", error);
      return [];
    }
  }, [gitDiffText]);

  const copyToClipboard = async (data: any, side: "left" | "right") => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[1900px] flex-col p-6">
        <DialogHeader className="pb-4 pt-0">
          <DialogTitle className="flex items-center justify-between gap-2 leading-none">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Compare{""}
              {options.map((option) => (
                <div
                  key={option.key}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs leading-none ${compareType === option.key ? "border-blue-500 bg-blue-500 text-white" : "border-gray-600 text-gray-600 hover:bg-gray-200"}`}
                  onClick={() => setCompareType(option.key)}>
                  {option.label}
                </div>
              ))}
            </div>

            <div className="flex flex-1 items-center justify-end pr-8">
              <div className="flex w-max items-center justify-end gap-2 rounded-md border px-1.5 py-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Switch
                    disabled={showRawData}
                    checked={showRawData ? true : viewType === "split"}
                    onCheckedChange={(checked) => setViewType(checked ? "split" : "unified")}
                  />
                  <label className="text-sm">Split View</label>
                </div>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Switch checked={showRawData} onCheckedChange={(checked) => setShowRawData(checked)} />
                  <label className="text-sm">Show Raw Data</label>
                </div>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Switch checked={hideCommonData} onCheckedChange={(checked) => setHideCommonData(checked)} />
                  <label className="text-sm">Hide Common Data</label>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              <div className="absolute -top-5 z-50 mt-0.5 flex w-full items-center justify-between gap-2">
                <div className="flex w-1/2 items-center justify-center gap-2">
                  <Tags version={version1} />
                </div>
                <div className="flex w-1/2 items-center justify-center gap-2">
                  <Tags version={version2} />
                </div>
              </div>
              {!showRawData ? (
                <ScrollArea className="h-full overflow-y-auto rounded-lg border bg-slate-50 text-xs dark:bg-slate-900">
                  {parsedDiff.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-6">
                      <div className="text-center text-muted-foreground">
                        <FileJson className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>No differences found or unable to parse diff</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {parsedDiff.map((file, index) => (
                        <div key={index} className="relative mb-4">
                          <Diff
                            key={hideCommonData ? "hide-common-data" : "show-common-data"}
                            viewType={viewType}
                            diffType={file.type}
                            hunks={file.hunks}
                            className="rounded-lg text-xs">
                            {(hunks) =>
                              hunks.map((hunk, hunkIndex) => {
                                const changes = hideCommonData ? withHiddenCommonData(hunk.changes) : hunk.changes;
                                if (changes?.length === 0)
                                  return (
                                    <div className="absolute h-full w-full border-l pt-64 text-center font-sans text-sm">
                                      <span>No difference found</span>
                                    </div>
                                  );
                                return <Hunk key={hunkIndex} hunk={{ ...hunk, changes }} />;
                              })
                            }
                          </Diff>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <div className="grid h-full grid-cols-2 gap-3 rounded-lg border">
                  <div className="relative flex min-h-0 flex-col border-r">
                    <div className="absolute -top-4 right-4 z-50">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(leftData, "left")}>
                        {copiedSide === "left" ? <Check className="text-green-500" /> : <Copy />}
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                      <pre className="whitespace-pre-wrap font-mono text-xs">{formatJson(leftData)}</pre>
                    </ScrollArea>
                  </div>

                  <div className="relative flex min-h-0 flex-col">
                    <div className="absolute -top-4 right-4 z-50">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(rightData, "right")}>
                        {copiedSide === "right" ? <Check className="text-green-500" /> : <Copy />}
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                      <pre className="whitespace-pre-wrap font-mono text-xs">{formatJson(rightData)}</pre>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
