import { Alert, AlertDescription } from "@chaibuilder/components/ui/alert";
import { CanvasTopBar } from "@chaibuilder/core/components/canvas/topbar/canvas-top-bar";
import { LanguageButton } from "@chaibuilder/routes/demo/lang-button";
import RightTop from "@chaibuilder/routes/demo/right-top";
import { Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import { startTransition, useEffect, useState } from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-x-2 px-2">
      <span className="text-lg font-bold tracking-tight text-gray-900">PageCrafter</span>
    </div>
  );
};

const DemoAlert = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo-alert-dismissed");
    if (dismissed === "true") {
      startTransition(() => setIsVisible(false));
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("demo-alert-dismissed", "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="fixed bottom-2 left-2 z-50 h-fit max-w-[310px] border-b border-border px-4 py-2 text-blue-600">
      <AlertDescription className="flex flex-col items-start gap-2 text-xs leading-tight">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <InfoCircledIcon className="h-4 w-4" />
            <span className="font-bold">Demo mode</span>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
            aria-label="Dismiss alert">
            <Cross2Icon className="h-3 w-3" />
          </button>
        </div>
        <span>Changes are saved in your browser local storage.</span>
      </AlertDescription>
    </Alert>
  );
};

export default function Topbar() {
  return (
    <div className="flex w-full items-center justify-between px-2">
      <Logo />
      <div>
        <CanvasTopBar />
      </div>
      <div className="flex items-center gap-2">
        <LanguageButton />
        <RightTop />
      </div>
      <DemoAlert />
    </div>
  );
}
