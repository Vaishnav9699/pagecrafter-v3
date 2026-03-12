"use client";

import { Button } from "@chaibuilder/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@chaibuilder/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@chaibuilder/components/ui/dropdown-menu";
import { ScrollArea } from "@chaibuilder/components/ui/scroll-area";
import { SheetHeader, SheetTitle } from "@chaibuilder/components/ui/sheet";
import { Skeleton } from "@chaibuilder/components/ui/skeleton";
import { useLanguages } from "@chaibuilder/hooks/use-languages";
import { useSavePage } from "@chaibuilder/hooks/use-save-page";
import PermissionChecker from "@chaibuilder/pages/client/components/permission-checker";
import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { PAGES_PERMISSIONS } from "@chaibuilder/pages/constants/PERMISSIONS";
import { usePageEditInfo, usePrimaryPage } from "@chaibuilder/pages/hooks/pages/use-current-page";
import { type Revision, useDeleteRevision, useRestoreRevision, useRevisions } from "@chaibuilder/pages/hooks/use-revisions";
import { useChaiUserInfo } from "@chaibuilder/pages/hooks/utils/use-chai-user-info";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { isEmpty } from "lodash-es";
import { CloudOff, FileJson, MoreHorizontal, Rocket, Save, Trash, Undo2, X } from "lucide-react";
import * as React from "react";
import { lazy, startTransition, Suspense, useEffect, useState } from "react";

// Lazy load the JsonDiffViewer component
const JsonDiffViewer = lazy(() => import("@chaibuilder/pages/client/components/json-diff-viewer"));

const Tags = ({ tag }: { tag: string }) => {
  if (tag === "draft") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        <span className="text-[11px] leading-tight">Draft</span>
      </div>
    );
  } else if (tag === "live") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </span>
        <span className="text-[11px] leading-tight">Live</span>
      </span>
    );
  } else if (tag === "published") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs text-green-600">
        <Rocket className="h-3 w-3" />
        <span className="text-[11px] leading-tight">Published</span>
      </div>
    );
  } else if (tag === "unsaved") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-xs text-red-600">
        <Save className="h-3 w-3" />
        <span className="text-[11px] leading-tight">Unsaved changes</span>
      </div>
    );
  }

  return (
    <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-purple-600">{tag}</span>
  );
};

interface CurrentlyEditingCardProps {
  compare: { uid: string; label: string; item: Revision }[];
  setCompare: (compare: { uid: string; label: string; item: Revision }[]) => void;
}

function CurrentlyEditingCard({ compare, setCompare }: CurrentlyEditingCardProps) {
  const { data: primaryPage } = usePrimaryPage();
  const { saveState } = useSavePage();
  const [pageEditInfo] = usePageEditInfo();
  if (!primaryPage) return null;

  const checked = !!compare.find((item) => item?.uid?.startsWith("draft:"));
  const disabled = compare.length >= 2 && !checked;
  const isUnsaved = saveState === "UNSAVED";

  return (
    <div className="relative flex items-start gap-3 rounded-md border bg-primary/5 p-2 hover:bg-accent/50">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-medium leading-none">
            <Tags tag="draft" />
            <span className="text-xs font-bold">Currently editing</span>
          </div>
        </div>

        <div className="flex items-center pl-2 text-[11px] text-muted-foreground">
          {!isEmpty(pageEditInfo.lastSaved) && (
            <span>
              Last updated{" "}
              {formatDistanceToNow(new Date(pageEditInfo.lastSaved as string), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">{isUnsaved ? <Tags tag="unsaved" /> : null}</div>
      </div>
      <CompareCheckbox
        checked={checked}
        disabled={disabled}
        onChange={() => {
          if (checked) {
            setCompare(compare.filter((item) => item.uid !== `draft:${primaryPage?.id}`));
          } else {
            setCompare([
              ...compare,
              { uid: `draft:${primaryPage?.id}`, label: "draft", item: { createdAt: Date.now() } as any },
            ]);
          }
        }}
      />
    </div>
  );
}

function RevisionsLoading() {
  return (
    <div className="mt-2 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-md border p-2">
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-1 h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface RevisionItemProps {
  revision: Revision;
  isLatest: boolean;
  onRestore: () => void;
  onDelete: () => void;
  revisionNumber: number;
  compare: { uid: string; label: string; item: Revision }[];
  setCompare: (compare: { uid: string; label: string; item: Revision }[]) => void;
  pageId: string;
}

function RevisionItem({
  revision,
  isLatest,
  onRestore,
  onDelete,
  revisionNumber,
  compare,
  setCompare,
  pageId,
}: RevisionItemProps) {
  const { data: editorInfo } = useChaiUserInfo(revision.currentEditor);
  const editorName = editorInfo?.name || "Unknown";

  const checked = !!compare.find((item) => (isLatest ? item?.uid?.startsWith("live") : item?.uid === revision.uid));
  const disabled = compare.length >= 2 && !checked;
  return (
    <div className="relative flex items-start gap-3 rounded-md border p-2 hover:bg-accent/50">
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs leading-none">
            <Tags tag={isLatest ? "live" : `#${revisionNumber}`} />
            {revision.type === "published" ? "Published" : "Draft"}
            &nbsp;by <span className="text-xs font-bold">{editorName}</span>
          </p>
        </div>

        <div className="flex items-center gap-x-3">
          <div className="flex items-center gap-2">
            {revision.type === "published" ? <Tags tag="published" /> : <Tags tag="draft" />}
          </div>
          <div className="flex items-center text-[10px] text-muted-foreground">
            <span className="leading-tight">{format(revision.createdAt, "MMM d, yyyy, h:mm a")}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PermissionChecker permissions={[PAGES_PERMISSIONS.RESTORE_REVISION, PAGES_PERMISSIONS.DELETE_REVISION]}>
          <RevisionActions revision={revision} onRestore={onRestore} onDelete={onDelete} />
        </PermissionChecker>
      </div>
      <CompareCheckbox
        checked={checked}
        disabled={disabled}
        onChange={() => {
          if (checked) {
            setCompare(
              compare.filter((item) => (isLatest ? item.uid !== `live:${pageId}` : item.uid !== revision.uid)),
            );
          } else {
            setCompare(
              [
                ...compare,
                {
                  uid: isLatest ? `live:${pageId}` : revision.uid,
                  label: isLatest ? "live" : `#${revisionNumber}`,
                  item: revision,
                },
              ].sort((a, b) => new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime()),
            );
          }
        }}
      />
    </div>
  );
}

// SelectedItem: displays a selected revision tab with remove button
function SelectedItem({ tab, onRemove }: { tab: { uid: string; label: string }; onRemove: (uid: string) => void }) {
  return (
    <span className="flex items-center justify-between rounded border border-blue-100 p-1 font-medium">
      <Tags tag={tab.label} />
      <button
        className="z-0 flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:text-red-500"
        style={{ lineHeight: 1 }}
        onClick={() => onRemove(tab.uid)}
        aria-label="Remove selection">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// CompareCard: shows selected items, allows removal, clear all, and compare
interface CompareCardProps {
  compare: { uid: string; label: string; item: Revision }[];
  setCompare: (compare: { uid: string; label: string; item: Revision }[]) => void;
  lang: string;
  pageId?: string;
}

function CompareCard({ compare, setCompare, pageId }: CompareCardProps) {
  const [showJsonDiff, setShowJsonDiff] = useState(false);
  const [tab1, tab2] = compare;

  if (compare.length === 0) return null;

  const handleRemove = (uid: string) => setCompare(compare.filter((item) => item.uid !== uid));

  return (
    <div className="mb-2 flex w-full max-w-md flex-col gap-1 rounded border bg-accent/60 p-2 shadow-sm">
      <div className="flex items-center gap-x-2 text-xs">
        <span className="font-medium leading-tight text-gray-600">Compare</span>
        {tab1 && <SelectedItem tab={tab1} onRemove={handleRemove} />}
        <span className="font-medium leading-tight text-gray-600">with</span>
        {tab2 ? (
          <SelectedItem tab={tab2} onRemove={handleRemove} />
        ) : (
          <span className="rounded border px-1 text-xs text-muted-foreground">Choose another</span>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 pb-0.5 pt-2">
        <Button
          size="sm"
          className="h-6 gap-1 rounded px-2 text-xs leading-none text-gray-500"
          variant="outline"
          onClick={() => setCompare([])}>
          <span> Clear</span>
        </Button>
        <Button
          size="sm"
          className="h-6 gap-1 rounded px-2 text-xs leading-none"
          variant="default"
          onClick={() => setShowJsonDiff(true)}
          disabled={compare.length < 2}>
          <FileJson className="h-2.5 w-2.5" />
          <span className="pt-0.5">Show JSON Diff</span>
        </Button>
      </div>

      {/* JSON Diff Viewer Dialog */}
      {showJsonDiff && compare?.length > 1 && pageId && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-4">
              <span className="text-sm">Loading diff viewer...</span>
            </div>
          }>
          <JsonDiffViewer open={showJsonDiff} onOpenChange={setShowJsonDiff} compare={compare} />
        </Suspense>
      )}
    </div>
  );
}

// Reusable CompareCheckbox component
interface CompareCheckboxProps {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label?: string;
}

function CompareCheckbox({ checked, disabled, onChange, label = "Compare" }: CompareCheckboxProps) {
  return (
    <div className="absolute bottom-2 right-2">
      <label className={`flex cursor-pointer items-center gap-x-1 text-[11px] ${disabled ? "opacity-50" : ""}`}>
        <input
          type="checkbox"
          className="h-3 w-3 cursor-pointer rounded focus:ring-0 focus:ring-offset-0"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <span className="select-none leading-tight">{label}</span>
      </label>
    </div>
  );
}

interface RevisionActionsProps {
  revision: Revision;
  onRestore: () => void;
  onDelete: () => void;
}

function RevisionActions({ revision, onRestore, onDelete }: RevisionActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        <PermissionChecker permission={PAGES_PERMISSIONS.RESTORE_REVISION}>
          <DropdownMenuItem onClick={onRestore} className="cursor-pointer text-sm">
            <Undo2 className="mr-2 h-4 w-4" />
            <span>Restore this version</span>
          </DropdownMenuItem>
        </PermissionChecker>

        <PermissionChecker permission={PAGES_PERMISSIONS.DELETE_REVISION}>
          {revision.uid !== "current" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete this version</span>
              </DropdownMenuItem>
            </>
          )}
        </PermissionChecker>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RestoreConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revision: Revision | null;
  onRestore: (discardCurrent: boolean) => void;
  isRestoring: boolean;
}

function RestoreConfirmationDialog({
  open,
  onOpenChange,
  revision,
  onRestore,
  isRestoring,
}: RestoreConfirmationDialogProps) {
  const { data: editorInfo } = useChaiUserInfo(revision?.currentEditor || "");
  const editorName = editorInfo?.name || "Unknown";

  if (!revision) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isRestoring) {
          onOpenChange(value);
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore Revision</DialogTitle>
          <DialogDescription>
            You are about to restore to revision {revision.uid.substring(0, 8)} from{" "}
            {format(revision.createdAt, "MMM d, yyyy 'at' h:mm a")} by {editorName}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground">How would you like to handle your current edits?</p>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="sm:flex-1" onClick={() => onRestore(false)} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving as draft...
              </>
            ) : (
              <>
                <CloudOff className="mr-2 h-4 w-4" />
                Save as draft
              </>
            )}
          </Button>
          <Button variant="default" className="sm:flex-1" onClick={() => onRestore(true)} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Discarding current...
              </>
            ) : (
              <>
                <Undo2 className="mr-2 h-4 w-4" />
                Discard current
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revision: Revision | null;
  onDelete: () => void;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({
  open,
  onOpenChange,
  revision,
  onDelete,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  const { data: editorInfo } = useChaiUserInfo(revision?.currentEditor || "");
  const editorName = editorInfo?.name || "Unknown";

  if (!revision) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isDeleting) {
          onOpenChange(value);
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Revision</DialogTitle>
          <DialogDescription>
            You are about to delete revision {revision.uid.substring(0, 8)} from{" "}
            {format(revision.createdAt, "MMM d, yyyy 'at' h:mm a")} by {editorName}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Are you sure you want to proceed?
          </p>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="sm:flex-1" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" className="sm:flex-1" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete Revision
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface PageRevisionsContentProps {
  isOpen: boolean;
}

export default function PageRevisionsContent({ isOpen }: PageRevisionsContentProps) {
  const [compare, setCompare] = React.useState<{ uid: string; label: string; item: Revision }[]>([]);
  const [selectedRevision, setSelectedRevision] = React.useState<Revision | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { data: currentPage } = usePrimaryPage();
  const { data: revisions, isFetching: isFetchingRevisions, error, refetch } = useRevisions(currentPage?.id);
  const { mutate: deleteRevision, isPending: isDeleting } = useDeleteRevision();
  const { mutate: restoreRevision, isPending: isRestoring } = useRestoreRevision();
  const queryClient = useQueryClient();
  const { selectedLang, fallbackLang } = useLanguages();
  const lang = selectedLang || fallbackLang;

  useEffect(() => {
    startTransition(() => setCompare([]));
  }, [currentPage?.id]);

  const handleRestore = (discardCurrent: boolean) => {
    if (!selectedRevision) return;

    restoreRevision(
      {
        revisionId: selectedRevision.uid,
        discardCurrent,
        ...(selectedRevision.uid === "current" && currentPage?.id && { pageId: currentPage.id }),
      },
      {
        onSuccess: () => {
          setRestoreDialogOpen(false);
          setSelectedRevision(null);
          queryClient.invalidateQueries({
            queryKey: [ACTIONS.GET_DRAFT_PAGE],
          });
        },
      },
    );
  };

  const openRestoreDialog = (revision: Revision) => {
    setSelectedRevision(revision);
    setRestoreDialogOpen(true);
  };

  const openDeleteDialog = (revision: Revision) => {
    setSelectedRevision(revision);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedRevision) return;
    deleteRevision(selectedRevision.uid, {
      /**
       * Callback for when deletion of a revision is successful. Closes the
       * delete dialog and resets the selected revision to null.
       */
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedRevision(null);
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Revision History</SheetTitle>
        {currentPage?.createdAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Page created on {format(new Date(currentPage.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </SheetHeader>
      {isFetchingRevisions ? (
        <RevisionsLoading />
      ) : error ? (
        <div className="p-4 text-center text-sm text-muted-foreground">Failed to load revisions. Please try again.</div>
      ) : (
        <div className="mt-2 flex h-full min-h-0 flex-1 flex-col space-y-2">
          <CompareCard lang={lang} compare={compare} setCompare={setCompare} pageId={currentPage?.id} />
          <CurrentlyEditingCard compare={compare} setCompare={setCompare} />
          {revisions
            ?.filter((revision) => revision.uid === "current")
            ?.map((revision, index) => (
              <RevisionItem
                key={revision.uid}
                pageId={currentPage?.id}
                revision={revision}
                isLatest={true}
                onRestore={() => openRestoreDialog(revision)}
                onDelete={() => openDeleteDialog(revision)}
                revisionNumber={index}
                compare={compare}
                setCompare={setCompare}
              />
            ))}
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2">
              {[...(revisions ?? [])]
                .filter((revision) => revision.uid !== "current")
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((revision, index) => (
                  <RevisionItem
                    key={revision.uid}
                    pageId={currentPage?.id}
                    revision={revision}
                    isLatest={revision.uid === "current"}
                    onRestore={() => openRestoreDialog(revision)}
                    onDelete={() => openDeleteDialog(revision)}
                    revisionNumber={index + 1}
                    compare={compare}
                    setCompare={setCompare}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <RestoreConfirmationDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        revision={selectedRevision}
        onRestore={handleRestore}
        isRestoring={isRestoring}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        revision={selectedRevision}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
