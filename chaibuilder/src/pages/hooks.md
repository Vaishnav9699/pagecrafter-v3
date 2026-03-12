# Hooks in `src/pages`

## Directory Structure

```
hooks/
├── ai/
├── pages/
├── project/
├── user/
├── utils/
├── QUERY_KEYS.ts
├── use-access-token.ts
├── use-chai-auth-tokens.ts
├── use-chai-auth.ts
├── use-chai-collections.ts
├── use-change-page.ts
├── use-fallback-lang.ts
├── use-global-json-ld.ts
├── use-goto-page.ts
├── use-reload-page.ts
├── use-revision-comparison.ts
├── use-revisions-enabled.ts
├── use-revisions.ts
├── use-site-wide-usage.ts
├── use-update-metadata.ts
└── use-website-data.ts
client/components/page-lock/
└── page-lock-hook.ts
digital-asset-manager/
└── use-assets.ts
```

---

## hooks/utils/ — Foundation Hooks

| Hook                | Type     | Description                                                                                |
| ------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `usePagesProps`     | Atom     | Global jotai atom holding all pages props passed from the host app                         |
| `useSearchParams`   | State    | Tracks URL search params, listens to `popstate`                                            |
| `useFetch`          | Callback | Core authenticated fetch wrapper. Uses `getAccessToken` and `onLogout` from `usePagesProp` |
| `useBuilderFetch`   | Callback | Convenience wrapper around `useFetch` with default `apiUrl`                                |
| `useChaiFetch`      | Callback | Alternative fetch using `useChaiAuth` + `useAccessToken`                                   |
| `useChaiUserInfo`   | Query    | Fetches user info by `currentEditor` ID                                                    |
| `useChangePassword` | Mutation | Changes user password                                                                      |
| `usePagesSavePage`  | Callback | Saves page blocks, updates query caches for `GET_LANGUAGE_PAGES` and `GET_WEBSITE_PAGES`   |

### Relations

- **`useFetch`** → `usePagesProp` (for `onLogout`, `getAccessToken`), `useApiUrl`
- **`useBuilderFetch`** → `useFetch`, `useApiUrl`
- **`useChaiFetch`** → `useChaiAuth`, `useAccessToken`
- **`usePagesSavePage`** → `useFetch`, `useApiUrl`, `usePageEditInfo`

---

## hooks/project/ — Project-Level Hooks

| Hook                            | Type           | Description                                                      |
| ------------------------------- | -------------- | ---------------------------------------------------------------- |
| `usePagesProp`                  | Memo           | Reads a single prop from `usePagesProps`                         |
| `useApiUrl`                     | Memo           | Returns `apiUrl` prop (default `/chai/api`)                      |
| `useWebsocket`                  | Memo           | **Deprecated.** Returns Supabase RealtimeClient                  |
| `useRealtimeAdapter`            | Memo           | Returns the realtime adapter for page locking                    |
| `useWebsiteSetting`             | Query          | Fetches draft website settings (languages, theme, etc.)          |
| `useWebsiteData`                | Query          | Fetches full website data bundle and populates individual caches |
| `usePageTypes`                  | Query          | Fetches available page types                                     |
| `usePageType`                   | Memo           | Finds a single page type by key from `usePageTypes`              |
| `useSearchPageTypePages`        | Mutation       | Searches pages by page type                                      |
| `useLibraries`                  | Query          | Fetches all libraries                                            |
| `useLibraryItems`               | Query          | Fetches items for a specific library                             |
| `useLibraryItem`                | Query          | Fetches a single library item                                    |
| `useLibraryGroups`              | Query+Mutation | Fetches library groups and provides `createGroup` mutation       |
| `useTemplatesByType`            | Query          | Fetches templates filtered by page type                          |
| `useTemplatesWithLibraries`     | Memo           | Merges templates with library info, groups by library name       |
| `useUILibraries`                | Query          | Fetches libraries and registers them via `registerChaiLibrary`   |
| `useUnpublishedWebsiteSettings` | Memo           | Checks if theme or design tokens have unpublished changes        |
| `useAppSharedJsonLD`            | Query          | Fetches shared JSON-LD data                                      |
| `useSaveUIBlock`                | Mutation       | Saves/updates a UI block in the library                          |
| `useGetUIBlockDetails`          | Query          | Fetches UI block details by ID                                   |
| `useUploadBlockPreview`         | Mutation       | Uploads a preview image for a block                              |
| `useDeleteUIBlock`              | Mutation       | Deletes a UI block from the library                              |

### Project Mutations (`mutations.ts`)

| Hook                          | Type     | Description                                            |
| ----------------------------- | -------- | ------------------------------------------------------ |
| `useUpdateWebsiteFields`      | Mutation | Updates website fields, invalidates settings + changes |
| `useUpdateAppSharedJsonLD`    | Mutation | Updates shared JSON-LD                                 |
| `useAddGlobalSchema`          | Mutation | Adds a global JSON-LD schema                           |
| `useUpdateGlobalSchema`       | Mutation | Updates a global schema                                |
| `useDeleteGlobalSchema`       | Mutation | Deletes a global schema                                |
| `useTogglePageGlobalSchema`   | Mutation | Toggles a schema on/off for a page                     |
| `useApplySchemaToAllPages`    | Mutation | Applies a schema to all pages                          |
| `useRemoveSchemaFromAllPages` | Mutation | Removes a schema from all pages                        |

### Relations

- **`usePagesProp`** → `usePagesProps`
- **`useApiUrl`** → `usePagesProp`
- **`useWebsiteSetting`** → `useFetch`, `useApiUrl`
- **`useWebsiteData`** (root-level) → `useFetch`, `useApiUrl` — populates caches for `useWebsiteSetting`, `useWebsitePages`, `usePageTypes`, `useGetPageChanges`, `useSiteWideUsage`
- **`useTemplatesWithLibraries`** → `useTemplatesByType` + `useLibraries`
- **`useUnpublishedWebsiteSettings`** → `useGetPageChanges`
- **`usePageType`** → `usePageTypes`
- All mutations → `useFetch`, `useApiUrl`

---

## hooks/pages/ — Page-Level Hooks

| Hook                             | Type       | Description                                                                                                                                                                    |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useWebsitePages`                | Query      | Fetches all website pages (5 min stale)                                                                                                                                        |
| `useWebsiteLanguagePages`        | Query      | Fetches pages for a specific language, keyed by `primaryPage`                                                                                                                  |
| `useChaiCurrentPage`             | Query+Memo | Gets current page from `useWebsitePages` using `?page=` search param                                                                                                           |
| `useActivePage`                  | Query+Memo | Gets active language page from `useWebsitePages` using `?lang=` param                                                                                                          |
| `usePageEditInfo`                | Atom       | Tracks `lastSaved` timestamp for the page                                                                                                                                      |
| `usePageMetaData`                | Atom       | Stores page metadata in jotai atom                                                                                                                                             |
| `useGetPageFullSlug`             | Memo       | Builds full page URL from `useActivePage` + dynamic slug + `getLiveUrl`                                                                                                        |
| `useCurrentLanguagePage`         | Memo       | Finds the current language page from `useLanguagePages`                                                                                                                        |
| `useLanguagePages`               | Query      | Fetches all language variants for a page                                                                                                                                       |
| `usePageAllData`                 | Query      | **Consolidated fetch** — fetches draft page, builder data, and language pages in one call. Populates caches for `usePageDraftBlocks`, `useBuilderPageData`, `useLanguagePages` |
| `usePageDraftBlocks`             | Query      | Fetches draft blocks for the current page. Sets AI context, edit info, metadata                                                                                                |
| `useBuilderPageData`             | Query      | Fetches builder page data (runtime data for rendering)                                                                                                                         |
| `useExtractPageBlocks`           | Memo       | Filters out `@chai/` internal blocks and syncs with default props                                                                                                              |
| `useGetPageChanges`              | Query      | Fetches list of unpublished changes across all pages                                                                                                                           |
| `useGetUnpublishedPartialBlocks` | Callback   | Checks which partial blocks on the page are unpublished                                                                                                                        |
| `useIsLanguagePageCreated`       | Memo       | Checks if a language page exists for a given lang code                                                                                                                         |
| `useTemplates`                   | Memo       | Filters `useWebsitePages` for template pages                                                                                                                                   |
| `useDuplicatePage`               | Mutation   | Duplicates a page, invalidates `GET_WEBSITE_PAGES`                                                                                                                             |
| `useSelectedDynamicPage`         | Atom       | Jotai atom for the selected dynamic page                                                                                                                                       |
| `useDynamicPageSlug`             | Atom       | Returns slug of the selected dynamic page                                                                                                                                      |
| `useDynamicPageSelector`         | Composite  | Full dynamic page selector logic with search, language switching                                                                                                               |

### Page Mutations (`mutations.ts`)

| Hook                  | Type     | Description                            |
| --------------------- | -------- | -------------------------------------- |
| `useCreatePage`       | Mutation | Creates a new page                     |
| `useUpdatePage`       | Mutation | Updates page properties                |
| `useDeletePage`       | Mutation | Deletes a page                         |
| `useUnpublishPage`    | Mutation | Takes a page offline                   |
| `usePublishPage`      | Mutation | Publishes a single page                |
| `usePublishPages`     | Mutation | Publishes multiple pages (saves first) |
| `useMarkAsTemplate`   | Mutation | Marks a page as a template             |
| `useUnmarkAsTemplate` | Mutation | Unmarks a page as a template           |
| `useChangeSlug`       | Mutation | Changes a page's slug                  |

### Relations

- **`useWebsiteLanguagePages`** → `useFetch`, `useApiUrl`, `useFallbackLang`
- **`useChaiCurrentPage`** → `useWebsitePages`, `useSearchParams`
- **`useActivePage`** → `useWebsitePages`, `useSearchParams`
- **`useGetPageFullSlug`** → `useActivePage`, `useDynamicPageSlug`, `usePagesProp`
- **`useCurrentLanguagePage`** → `useLanguagePages`, `useLanguages`
- **`usePageAllData`** → `useChaiCurrentPage`, `useActivePage`, `useDynamicPageSlug`, `useFallbackLang` — **populates caches** for `usePageDraftBlocks`, `useBuilderPageData`, `useLanguagePages`
- **`usePageDraftBlocks`** → `useAiContext`, `usePageEditInfo`, `usePageMetaData`, `useIsPageLoaded`
- **`useBuilderPageData`** → `useChaiCurrentPage`, `useActivePage`, `useFallbackLang`, `useDynamicPageSlug`
- **`useGetUnpublishedPartialBlocks`** → `useBlocksStore`, `useWebsitePages`
- **`useIsLanguagePageCreated`** → `useLanguagePages`, `useWebsiteSetting`, `useLanguages`
- **`useTemplates`** → `useWebsitePages`
- **`useDynamicPageSelector`** → `useSelectedDynamicPage`, `useGetDynamicPages` (internal), `useChaiCurrentPage`, `useLanguages`
- All page mutations → `useFetch`, `useApiUrl`, `usePageTypes`, `useActivePage`, `useChaiCurrentPage`

---

## hooks/ai/ — AI Hooks

| Hook           | Type           | Description                                        |
| -------------- | -------------- | -------------------------------------------------- |
| `useAiContext` | Query+Callback | Stores/retrieves AI context string via query cache |
| `useAskAi`     | Callback       | Sends AI prompt with blocks and context to the API |

### Relations

- **`useAskAi`** → `useAiContext`, `useApiUrl`, `useFetch`
- **`useAiContext`** is set by `usePageDraftBlocks` when loading a page

---

## hooks/user/

| Hook                 | Type  | Description                                                             |
| -------------------- | ----- | ----------------------------------------------------------------------- |
| `useCheckUserAccess` | Query | Periodically checks user access, role, and permissions. Logs out on 401 |

### Relations

- **`useCheckUserAccess`** → `usePagesProp` (for `onLogout`, `getAccessToken`), `useApiUrl`

---

## Root-Level Hooks (hooks/)

| Hook                          | Type     | Description                                                                                                                                          |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAccessToken`              | Callback | Wraps `getAccessToken` prop with error handling                                                                                                      |
| `useChaiAuthTokens`           | Memo     | Returns `getAccessToken` and `getRefreshToken` from props                                                                                            |
| `useChaiAuth`                 | Memo     | Returns `isLoggedIn`, `user`, `logout` from props                                                                                                    |
| `useChaiCollections`          | Query    | Fetches collections                                                                                                                                  |
| `useGetBlockAysncProps`       | Mutation | Fetches async props for a block with request deduplication                                                                                           |
| `useChangePage`               | Callback | Navigates to a page by updating URL search params                                                                                                    |
| `useGotoPage`                 | Callback | Simplified wrapper around `useChangePage`                                                                                                            |
| `useFallbackLang`             | Memo     | Returns fallback language from website settings                                                                                                      |
| `useGlobalJsonLDItems`        | Query    | Fetches global JSON-LD items                                                                                                                         |
| `useReloadPage`               | Callback | Saves page then invalidates draft + builder data queries                                                                                             |
| `useClearAll`                 | Callback | Clears all query cache                                                                                                                               |
| `useRevisionComparison`       | Query    | Fetches comparison data between two revisions                                                                                                        |
| `useRevisionsEnabled`         | Memo     | Checks if revisions feature flag is enabled                                                                                                          |
| `useRevisions`                | Query    | Fetches page revisions                                                                                                                               |
| `useDeleteRevision`           | Mutation | Deletes a revision                                                                                                                                   |
| `useRestoreRevision`          | Mutation | Restores a revision                                                                                                                                  |
| `useSiteWideUsage`            | Query    | Fetches site-wide usage data (partial blocks, links, design tokens)                                                                                  |
| `useUpdateActivePageMetadata` | Mutation | Updates metadata for the active page                                                                                                                 |
| `useWebsiteData`              | Query    | **Bootstrap hook** — fetches all website data and populates caches for settings, pages, page types, changes, libraries, collections, site-wide usage |

### Relations

- **`useGotoPage`** → `useChangePage`
- **`useFallbackLang`** → `useWebsiteSetting`
- **`useReloadPage`** → `useSavePage`, `usePageLockStatus`
- **`useGetBlockAysncProps`** → `useChaiCurrentPage`, `useActivePage`, `useWebsiteSetting`, `useFetch`
- **`useUpdateActivePageMetadata`** → `useActivePage`, `useFetch`, `useApiUrl`
- **`useWebsiteData`** → `useFetch`, `useApiUrl` — **populates**: `useWebsiteSetting`, `useWebsitePages`, `usePageTypes`, `useGetPageChanges`, `useSiteWideUsage`, `useChaiCollections`

---

## Page Lock Hooks (`client/components/page-lock/page-lock-hook.ts`)

| Hook                   | Type     | Description                                                                      |
| ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `usePageToUser`        | Atom     | Maps page IDs to their current editor                                            |
| `usePageLockStatus`    | Atom     | Returns page lock status (`EDITING`, `LOCKED`, `ACTIVE_IN_ANOTHER_TAB`)          |
| `usePageLockMeta`      | Atom     | Stores page lock metadata                                                        |
| `useCurrentPageOwner`  | Memo     | Returns the current editor of the active page                                    |
| `useUpdateOnlineUsers` | Callback | Updates online user presence state                                               |
| `usePageLock`          | Effect   | Main page lock orchestrator — manages realtime channel, presence, and lock state |

### Relations

- **`usePageLockStatus`** → `pageStatusAtom`
- **`useCurrentPageOwner`** → `usePageToUser`, `usePageId`
- **`usePageLock`** → `useRealtimeAdapter`, `usePageLockStatus`, `usePageToUser`, `useSavePage`
- **`useReloadPage`** depends on `usePageLockStatus`

---

## Digital Asset Manager (`digital-asset-manager/use-assets.ts`)

| Hook        | Type  | Description                          |
| ----------- | ----- | ------------------------------------ |
| `useAssets` | Query | Fetches paginated assets with search |
| `useAsset`  | Query | Fetches a single asset by ID         |

### Relations

- Both → `useApiUrl`, `useFetch`

---

## Key Dependency Graph

```
usePagesProps (jotai atom — root of all config)
  └─► usePagesProp / useApiUrl / useRealtimeAdapter
        └─► useFetch (core API layer)
              └─► All query/mutation hooks

useWebsiteData (bootstrap)
  ├─► populates useWebsiteSetting cache
  ├─► populates useWebsitePages cache
  ├─► populates usePageTypes cache
  ├─► populates useGetPageChanges cache
  ├─► populates useSiteWideUsage cache
  └─► populates useChaiCollections cache

useWebsitePages
  ├─► useChaiCurrentPage (finds page by ?page= param)
  ├─► useActivePage (finds page by ?lang= param)
  ├─► useTemplates (filters for template pages)
  └─► useGetUnpublishedPartialBlocks

useChaiCurrentPage + useActivePage
  ├─► usePageAllData (consolidated fetch)
  │     ├─► populates usePageDraftBlocks cache
  │     ├─► populates useBuilderPageData cache
  │     └─► populates useLanguagePages cache
  ├─► useBuilderPageData
  ├─► useGetBlockAysncProps
  └─► useGetPageFullSlug

useLanguagePages
  ├─► useCurrentLanguagePage
  └─► useIsLanguagePageCreated

useWebsiteSetting
  └─► useFallbackLang
        ├─► useWebsiteLanguagePages
        ├─► usePageAllData
        └─► useBuilderPageData

useAiContext
  ├─► set by usePageDraftBlocks (on page load)
  └─► read by useAskAi

useChangePage
  └─► useGotoPage
```
