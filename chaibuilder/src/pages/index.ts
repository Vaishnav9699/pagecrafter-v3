import "@chaibuilder/index.css";
import { ChaiWebsiteBuilder } from "@chaibuilder/pages/chaibuilder-pages";
import { useCurrentActivePage } from "@chaibuilder/pages/hooks/pages/use-current-page";
import { NestedPathSelector } from "./client/components/nested-path-selector/nested-path-selector";
import { usePageAllData } from "./hooks/pages/use-page-all-data";
import { useBuilderPageData } from "./hooks/pages/use-page-draft-blocks";
import { usePageTypes } from "./hooks/project/use-page-types";
import { useFallbackLang } from "./hooks/use-fallback-lang";
import { useGotoPage } from "./hooks/use-goto-page";
import { useClearAll, useReloadPage } from "./hooks/use-reload-page";
import { useUpdateActivePageMetadata } from "./hooks/use-update-metadata";

if (typeof window === "undefined") {
  throw new Error("@chaibuilder/pages is not available on the server");
}

export { PermissionChecker } from "@chaibuilder/pages/client/components/permission-checker";
export { LanguageSwitcher } from "@chaibuilder/pages/client/components/topbar-left";
export { ImagePicker } from "@chaibuilder/pages/digital-asset-manager/image-picker";
export { SmartJsonInput as ChaiJsonInput } from "./client/components/smart-json-input";
export { ChaiWebsiteBuilder, NestedPathSelector };
export { AiPanelContent as ChaiAiPanel } from "@chaibuilder/pages/panels/ai-panel/ai-panel-content";


/** Hooks */
export { usePrimaryPage as useChaiPrimaryPage } from "@chaibuilder/pages/hooks/pages/use-current-page";
export { useLanguagePages } from "@chaibuilder/pages/hooks/pages/use-language-pages";
export { useWebsitePrimaryPages as useWebsitePages } from "@chaibuilder/pages/hooks/pages/use-project-pages";
export { useApiUrl, useRealtimeAdapter } from "@chaibuilder/pages/hooks/project/use-builder-prop";
export { useWebsiteSetting } from "@chaibuilder/pages/hooks/project/use-website-settings";
export { useChaiAuth } from "@chaibuilder/pages/hooks/use-chai-auth";
export { useCheckUserAccess as useUserPermissions } from "@chaibuilder/pages/hooks/user/use-check-access";
export { useChaiUserInfo } from "@chaibuilder/pages/hooks/utils/use-chai-user-info";
export { useBuilderFetch, useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
export {
  useCurrentActivePage as useActivePage,
  useBuilderPageData,
  useClearAll,
  useFallbackLang,
  useGotoPage,
  usePageAllData,
  usePageTypes,
  useReloadPage,
  useUpdateActivePageMetadata,
};

/** Realtime Adapters */
export { createRealtimeAdapter } from "@chaibuilder/pages/client/components/page-lock/create-realtime-adapter";
export type {
  ChannelStatus,
  PresenceState,
  RealtimeAdapter,
  RealtimeChannelAdapter,
  RealtimeEventPayload,
} from "@chaibuilder/pages/client/components/page-lock/realtime-adapter";
export { SupabaseRealtimeAdapter } from "@chaibuilder/pages/client/components/page-lock/supabase-realtime-adapter";
