import { Button } from "@chaibuilder/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@chaibuilder/components/ui/sheet";
import { Skeleton } from "@chaibuilder/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@chaibuilder/components/ui/tooltip";
import { History } from "lucide-react";
import * as React from "react";
import { Suspense } from "react";

// Loading skeleton for the lazy loaded component
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

// True lazy loading - imports from separate file in same folder
const LazyPageRevisionsContent = React.lazy(() => import("./page-revisions-content"));

export default function PageRevisionsTrigger() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="h-4 w-4" />
                  <span className="sr-only">View revision history</span>
                </Button>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              </span>
            </TooltipTrigger>
          </SheetTrigger>
          <SheetContent className="flex h-[100vh] flex-col">
            {isOpen && (
              <Suspense fallback={<RevisionsLoading />}>
                <LazyPageRevisionsContent isOpen={isOpen} />
              </Suspense>
            )}
          </SheetContent>
        </Sheet>
        <TooltipContent side="bottom">
          <p>Revision history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
