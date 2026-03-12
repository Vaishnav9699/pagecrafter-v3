import { ScrollArea } from "@chaibuilder/components/ui/scroll-area";
import { TailwindPreviewIframe } from "@chaibuilder/core/components/canvas/tailwind-preview-iframe";
import { sanitizeClasses } from "@chaibuilder/core/functions/SanitizeClasses";
import { useTranslation } from "react-i18next";

interface DesignTokenPreviewProps {
  activeToken?: {
    name: string;
    value: string;
    id?: string;
  } | null;
}

export const DesignTokenPreview = ({ activeToken }: DesignTokenPreviewProps) => {
  const { t } = useTranslation();

  // Sanitize token value to prevent XSS attacks
  const safeTokenValue = activeToken?.value ? sanitizeClasses(activeToken.value) : "";
  const hasToken = activeToken && activeToken.name && activeToken.value;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        <div className="space-y-2 rounded-lg border bg-card p-4">
          {hasToken && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{activeToken.name}</span>
                {activeToken.id && (
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                    {activeToken.id}
                  </span>
                )}
              </div>
            </>
          )}

          <div>
            <div className="mb-2 text-[10px] font-medium text-muted-foreground">{t("Preview:")}</div>
            <TailwindPreviewIframe
              content={t("Sample text with token styles applied")}
              classes={safeTokenValue}
              style={{ minHeight: 80 }}
              title={t("Token Preview")}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
