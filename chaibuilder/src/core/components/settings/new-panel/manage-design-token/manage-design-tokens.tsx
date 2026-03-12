import { chaiDesignTokensAtom } from "@chaibuilder/atoms/builder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@chaibuilder/components/ui/alert-dialog";
import { Button } from "@chaibuilder/components/ui/button";
import { Input } from "@chaibuilder/components/ui/input";
import { Label } from "@chaibuilder/components/ui/label";
import { ScrollArea } from "@chaibuilder/components/ui/scroll-area";
import { ManualClasses } from "@chaibuilder/core/components/settings/new-panel/manual-classes";
import { useIncrementActionsCount } from "@chaibuilder/core/components/use-auto-save";
import { DESIGN_TOKEN_PREFIX } from "@chaibuilder/core/constants/STRINGS";
import { orderClassesByBreakpoint } from "@chaibuilder/core/functions/order-classes-by-breakpoint";
import { removeDuplicateClasses } from "@chaibuilder/core/functions/remove-duplicate-classes";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useSaveWebsiteData } from "@chaibuilder/hooks/use-save-website-data";
import {
  ArrowLeftIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { convertTokenNameInput, getTokenNameError, validateTokenName } from "./design-token-utils";

const DesignTokenUsage = lazy(() => import("./design-token-usage"));

type ViewMode = "view" | "add" | "edit";

interface SingleDesignTokenProps {
  tokenId: string;
  token: { name: string; value: string; archived?: boolean };
  isDisabled: boolean;
  isSelected: boolean;
  isArchived?: boolean;
  onSelect: (tokenId: string) => void;
  onEdit: (tokenId: string) => void;
  onArchive: (tokenId: string) => void;
  onUnarchive?: (tokenId: string) => void;
}

const SingleDesignToken = ({
  tokenId,
  token,
  isDisabled,
  isSelected,
  isArchived = false,
  onSelect,
  onEdit,
  onUnarchive,
}: SingleDesignTokenProps) => {
  return (
    <div
      onClick={() => onSelect(tokenId)}
      className={`group relative flex cursor-pointer items-center justify-between overflow-hidden rounded border p-2 transition-all duration-150 ${
        isArchived
          ? "border-muted bg-muted/30 opacity-60"
          : isSelected
            ? "border-primary bg-primary/10"
            : "hover:bg-muted/90"
      }`}>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className={`text-xs font-semibold ${isArchived ? "text-muted-foreground" : ""}`}>{token.name}</div>
        <div className={`w-full max-w-52 truncate text-[10px] font-light ${isArchived ? "text-muted-foreground" : ""}`}>
          {token.value}
        </div>
      </div>
      <div className="absolute right-1 top-1 flex flex-shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {!isArchived && (
          <>
            <Suspense fallback={null}>
              <DesignTokenUsage tokenId={tokenId} tokenName={token.name}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0 hover:bg-primary/10 hover:text-primary">
                  <EyeOpenIcon className="h-3 w-3" />
                </Button>
              </DesignTokenUsage>
            </Suspense>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tokenId);
              }}
              disabled={isDisabled}
              className="h-6 w-6 rounded-full p-0 hover:bg-primary/10 hover:text-primary">
              <Pencil1Icon className="h-3 w-3" />
            </Button>
          </>
        )}
        {isArchived && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUnarchive?.(tokenId);
            }}
            disabled={isDisabled}
            className="h-6 w-6 rounded-full p-0 hover:bg-primary/10 hover:text-primary">
            <EyeOpenIcon className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface ManageDesignTokensProps {
  onActiveTokenChange?: (token: { name: string; value: string; id?: string } | null) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

const ManageDesignTokens = ({ onActiveTokenChange, onDirtyStateChange }: ManageDesignTokensProps) => {
  const { t } = useTranslation();
  const [designTokens, setDesignTokens] = useAtom(chaiDesignTokensAtom);
  const incrementActionsCount = useIncrementActionsCount();
  const { saveDesignTokens, debouncedSaveDesignTokens } = useSaveWebsiteData();
  const currentPageId = useBuilderProp("pageId", "");
  const siteWideUsage = useBuilderProp("siteWideUsage", {});

  // Unified view state
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Form state
  const [tokenName, setTokenName] = useState("");
  const [classes, setClasses] = useState("");
  const [tokenNameError, setTokenNameError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Archive confirmation state
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [archiveConfirmation, setArchiveConfirmation] = useState<{
    isOpen: boolean;
    tokenId: string | null;
    tokenName: string;
    pageCount: number;
    partialCount: number;
  }>({
    isOpen: false,
    tokenId: null,
    tokenName: "",
    pageCount: 0,
    partialCount: 0,
  });
  const pendingArchiveTokenIdRef = useRef<string | null>(null);

  const getTokenUsageCount = useCallback(
    (tokenId: string) => {
      if (!siteWideUsage) return { pageCount: 0, partialCount: 0 };

      let pageCount = 0;
      let partialCount = 0;

      Object.entries(siteWideUsage).forEach(([pageId, pageUsage]: [string, any]) => {
        if (pageId === currentPageId || !pageUsage?.designTokens) return;

        const hasToken = Object.keys(pageUsage.designTokens).some((tokenKey) => tokenKey === tokenId);

        if (hasToken) {
          if (pageUsage.isPartial) {
            partialCount++;
          } else {
            pageCount++;
          }
        }
      });

      return { pageCount, partialCount };
    },
    [siteWideUsage, currentPageId],
  );

  const filteredTokens = useMemo(() => {
    return Object.entries(designTokens).filter(
      ([, token]) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [designTokens, searchQuery]);

  // Notify parent of dirty state changes
  useEffect(() => {
    if (!onDirtyStateChange) {
      return;
    }

    // Consider the modal "dirty" only when there are actual unsaved add-form changes.
    // Edits are auto-saved, so merely being in "edit" mode should not mark the modal as dirty.
    const hasAddFormChanges =
      viewMode === "add" && ((tokenName && tokenName.trim().length > 0) || (classes && classes.trim().length > 0));

    onDirtyStateChange(hasAddFormChanges as boolean);
  }, [viewMode, tokenName, classes, onDirtyStateChange]);

  // Notify parent of active token changes
  useEffect(() => {
    if (onActiveTokenChange) {
      // If editing or adding, show the current form state
      if (viewMode === "edit" || viewMode === "add") {
        if (tokenName && classes) {
          onActiveTokenChange({
            name: tokenName,
            value: classes,
            id: editingTokenId || undefined,
          });
        } else {
          onActiveTokenChange(null);
        }
      }
      // If viewing and a token is selected, show that token
      else if (viewMode === "view" && selectedTokenId && designTokens[selectedTokenId]) {
        const token = designTokens[selectedTokenId];
        onActiveTokenChange({
          name: token.name,
          value: token.value,
          id: selectedTokenId,
        });
      }
      // Otherwise clear the preview
      else {
        onActiveTokenChange(null);
      }
    }
  }, [viewMode, tokenName, classes, editingTokenId, selectedTokenId, designTokens, onActiveTokenChange]);

  const handleSaveToken = () => {
    if (!tokenName.trim() || !classes.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(tokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    // Check for duplicate names (excluding current token)
    const existingToken = Object.entries(designTokens).find(
      ([id, token]) => token.name === tokenName.trim() && id !== editingTokenId,
    );
    if (existingToken) {
      toast.error(t("Token already exists"));
      return;
    }

    if (!editingTokenId) return;

    debouncedUpdateToken(tokenName, classes);
  };

  const resetAndGoToView = useCallback(() => {
    setEditingTokenId(null);
    setTokenName("");
    setClasses("");
    setTokenNameError("");
    setIsSaving(false);
    setViewMode("view");
  }, []);

  // Real-time update for editing (debounced)
  const debouncedUpdateToken = useCallback(
    (name: string, value: string) => {
      if (!editingTokenId || viewMode !== "edit") return;

      // Validate before updating
      if (!name.trim() || !value.trim()) return;
      if (!validateTokenName(name)) return;

      // Check for duplicate names (excluding current token)
      const existingToken = Object.entries(designTokens).find(
        ([id, token]) => token.name === name.trim() && id !== editingTokenId,
      );
      if (existingToken) return;

      setIsSaving(true);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const newTokens = {
          ...designTokens,
          [editingTokenId]: {
            name: name.trim(),
            value: value.trim(),
          },
        };
        setDesignTokens(newTokens);
        incrementActionsCount();
        debouncedSaveDesignTokens();
        setIsSaving(false);
        toast.success(t("Token updated successfully"));
        resetAndGoToView();
      }, 10);
    },
    [
      editingTokenId,
      viewMode,
      designTokens,
      setDesignTokens,
      incrementActionsCount,
      debouncedSaveDesignTokens,
      t,
      resetAndGoToView,
    ],
  );

  const handleAddToken = () => {
    if (!tokenName.trim() || !classes.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(tokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    const existingTokenWithName = Object.values(designTokens).find((token) => token.name === tokenName.trim());
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }

    const tokenId = `${DESIGN_TOKEN_PREFIX}${nanoid(12)}`;
    const newTokens = {
      ...designTokens,
      [tokenId]: {
        name: tokenName.trim(),
        value: classes.trim(),
      },
    };
    setDesignTokens(newTokens);
    incrementActionsCount();
    saveDesignTokens();
    toast.success(t("Token added successfully"));
    resetAndGoToView();
  };

  const handleArchiveToken = (tokenId: string) => {
    const token = designTokens[tokenId];
    if (!token) return;

    const { pageCount, partialCount } = getTokenUsageCount(tokenId);

    // Always show confirmation dialog
    setArchiveConfirmation({
      isOpen: true,
      tokenId,
      tokenName: token.name,
      pageCount,
      partialCount,
    });
    pendingArchiveTokenIdRef.current = tokenId;
  };

  const confirmArchiveToken = () => {
    const tokenId = pendingArchiveTokenIdRef.current;
    if (!tokenId) return;

    const newTokens = {
      ...designTokens,
      [tokenId]: {
        ...designTokens[tokenId],
        archived: true,
      },
    };
    setDesignTokens(newTokens);
    incrementActionsCount();
    saveDesignTokens();
    toast.success(t("Token archived successfully"));
    setArchiveConfirmation({
      isOpen: false,
      tokenId: null,
      tokenName: "",
      pageCount: 0,
      partialCount: 0,
    });
    pendingArchiveTokenIdRef.current = null;
  };

  const handleUnarchiveToken = (tokenId: string) => {
    const newTokens = {
      ...designTokens,
      [tokenId]: {
        name: designTokens[tokenId].name,
        value: designTokens[tokenId].value,
      },
    };
    setDesignTokens(newTokens);
    incrementActionsCount();
    toast.success(t("Token unarchived successfully"));
  };

  const startEdit = (tokenId: string) => {
    const token = designTokens[tokenId];
    if (!token) return;

    setEditingTokenId(tokenId);
    setTokenName(token.name);
    setClasses(token.value);
    setTokenNameError("");
    setViewMode("edit");
  };

  const startAdd = () => {
    setEditingTokenId(null);
    setTokenName("");
    setClasses("");
    setTokenNameError("");
    setViewMode("add");
  };

  const handleTokenNameChange = (value: string) => {
    const convertedValue = convertTokenNameInput(value);
    setTokenName(convertedValue);
    const error = getTokenNameError(convertedValue, designTokens, t, viewMode === "edit", editingTokenId || undefined);
    setTokenNameError(error);
  };

  const handleClassesChange = (newClasses: string) => {
    setClasses(newClasses);
  };

  const handleAddClass = (cls: string) => {
    const newCls = orderClassesByBreakpoint(removeDuplicateClasses(twMerge(classes, cls)));
    handleClassesChange(newCls);
  };

  const handleRemoveClass = (cls: string) => {
    const updatedClasses = classes
      .split(" ")
      .filter((c) => c !== cls)
      .join(" ");
    handleClassesChange(updatedClasses);
  };

  // Render Add/Edit Form
  const renderForm = () => {
    const isEditMode = viewMode === "edit";
    const title = isEditMode ? t("Edit Design Token") : t("Add Design Token");
    const description = isEditMode ? t("Update design token") : t("Create a reusable design token");

    return (
      <div className="flex h-full flex-col">
        {/* Header with back button */}
        <div className="mb-3 flex items-center gap-2 rounded-md border border-border/50 bg-muted p-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAndGoToView}
            className="h-6 w-6 rounded-full p-0 hover:bg-muted">
            <ArrowLeftIcon className="h-3 w-3" />
          </Button>
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-foreground">{title}</h3>
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
          {isEditMode && isSaving && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="token-name" className="text-xs font-medium">
              {t("Token Name")}
            </Label>
            <Input
              id="token-name"
              placeholder="Button-Primary"
              value={tokenName}
              onChange={(e) => handleTokenNameChange(e.target.value)}
              className="h-7 text-xs"
            />
            {tokenNameError ? (
              <span className="text-[10px] text-destructive">{tokenNameError}</span>
            ) : (
              <span className="text-[10px] font-light text-muted-foreground">
                {t("Button-Primary, Card-Header, Text-Large etc.")}
              </span>
            )}
          </div>

          <ManualClasses
            from="designToken"
            classFromProps={classes}
            onAddNew={handleAddClass}
            onRemove={handleRemoveClass}
            showDesignTokenSuggestions={false}
          />

          {/* Footer - show Add button for add mode, Save button for edit mode */}
          <div className="mt-3 flex items-center justify-end gap-2 pt-3">
            <Button variant="outline" onClick={resetAndGoToView} className="h-7 text-xs">
              {t("Cancel")}
            </Button>
            {isEditMode ? (
              <Button
                onClick={handleSaveToken}
                disabled={!tokenName.trim() || !classes.trim() || !!tokenNameError}
                className="h-7 text-xs">
                {t("Save Token")}
              </Button>
            ) : (
              <Button
                onClick={handleAddToken}
                disabled={!tokenName.trim() || !classes.trim() || !!tokenNameError}
                className="h-7 text-xs">
                {t("Add Token")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Token List View
  const renderTokenList = () => {
    const activeTokens = filteredTokens.filter(([, token]) => !token.archived);
    const archivedTokens = filteredTokens.filter(([, token]) => token.archived);

    return (
      <>
        {/* Header */}
        {Object.entries(designTokens).length > 0 && (
          <div className="flex items-center justify-between gap-x-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("Search tokens")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-6 pl-7 text-xs"
              />
            </div>
            <Button
              variant="outline"
              onClick={startAdd}
              size="sm"
              className="h-6 border-primary text-xs text-primary hover:bg-primary/10 hover:text-primary">
              <PlusIcon className="h-3 w-3" />
              {t("Add")}
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="no-scrollbar flex flex-1 flex-col overflow-hidden pt-2">
          <ScrollArea className="flex h-full flex-1 items-center justify-center">
            <div className="space-y-1">
              {Object.entries(designTokens).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/20 py-8">
                  <div className="mb-2 text-3xl">
                    <TokensIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">{t("No design tokens yet")}</p>
                  <p className="text-center text-xs text-muted-foreground">
                    {t("Create reusable design tokens to streamline your styling")}
                  </p>
                  <Button variant="default" onClick={startAdd} size="sm" className="mt-4 h-7 text-xs leading-tight">
                    <PlusIcon className="mr-1 h-3 w-3" />
                    {t("Add first design token")}
                  </Button>
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/20 py-8">
                  <div className="mb-2">
                    <MagnifyingGlassIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">{t("No tokens found")}</p>
                  <p className="text-center text-xs text-muted-foreground">{t("No design tokens match your search")}</p>
                </div>
              ) : (
                <>
                  {/* Active Tokens */}
                  {activeTokens.length > 0 && (
                    <div className="space-y-1">
                      {activeTokens.map(([tokenId, token]) => (
                        <SingleDesignToken
                          key={tokenId}
                          token={token}
                          tokenId={tokenId}
                          isSelected={selectedTokenId === tokenId}
                          isArchived={false}
                          onSelect={setSelectedTokenId}
                          onEdit={startEdit}
                          onArchive={handleArchiveToken}
                          onUnarchive={handleUnarchiveToken}
                          isDisabled={false}
                        />
                      ))}
                    </div>
                  )}

                  {/* Archived Tokens */}
                  {archivedTokens.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">{t("Archived")}</div>
                      {archivedTokens.map(([tokenId, token]) => (
                        <SingleDesignToken
                          key={tokenId}
                          token={token}
                          tokenId={tokenId}
                          isSelected={selectedTokenId === tokenId}
                          isArchived={true}
                          onSelect={setSelectedTokenId}
                          onEdit={startEdit}
                          onArchive={handleArchiveToken}
                          onUnarchive={handleUnarchiveToken}
                          isDisabled={false}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="h-44" />
            </div>
          </ScrollArea>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex h-full w-full flex-col">{viewMode === "view" ? renderTokenList() : renderForm()}</div>

      <AlertDialog
        open={archiveConfirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveConfirmation({
              isOpen: false,
              tokenId: null,
              tokenName: "",
              pageCount: 0,
              partialCount: 0,
            });
            pendingArchiveTokenIdRef.current = null;
          }
        }}>
        <AlertDialogContent>
          <AlertDialogTitle>{t("Archive Design Token")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              {t("This token is used on")} <span className="font-semibold">{archiveConfirmation.pageCount}</span>{" "}
              {t("pages")}
              {archiveConfirmation.partialCount > 0 && (
                <>
                  {" "}
                  {t("and")} <span className="font-semibold">{archiveConfirmation.partialCount}</span> {t("partials")}
                </>
              )}
              .
            </p>
            <p className="text-sm text-destructive">
              {t("Archiving this token will remove the styling for those blocks.")}
            </p>
            <p>{t("Do you wish to continue?")}</p>
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveToken}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("Archive")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageDesignTokens;
