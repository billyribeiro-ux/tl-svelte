# dotcom client: Svelte contract for `src/tla/components`

Written by the shell agent for the agent that ports `src/tla/components/**` (77 `.tsx`). It
lists every context, hook, provider and helper the components consume, with its Svelte name, file,
and reactive shape, plus what the shell expects from the components. Paths are relative to
`apps/dotcom/client/src`. Import without a file extension (`'../hooks/useAppState.svelte'`), the way
`packages/svelte-draw` does.

Status legend: **done** = exists and was checked with `svelte-check`; **planned** = being written by
the shell agent, signature fixed here; nothing marked planned will change shape.

## Conventions

- `use*` readers become `get*` (they call `getContext`, so call them during component
  initialisation, at the top of `<script>`), and `use*` hooks with effects become `setup*`. Same rule as
  `packages/svelte-draw/src/lib/ui/context/index.ts`.
- A value that changes over time is returned as a holder `{ readonly current: T }`. Read `.current`
  in a template, `$derived`, `$effect`. Holders also work **inside `fromComputed` / `react` callbacks**
  where they are tracked as signal dependencies (see `signalHolder` in `useAppState.svelte.ts`).
- Reactive arguments are passed as getters: `getIsFilePinned(() => fileId, () => workspaceId)`.
- File basenames are kept. `X.tsx` with a component becomes `X.svelte`; `useX.tsx` becomes
  `useX.svelte.ts` (runes) or `useX.ts` (no runes needed). A component file that also exported
  values keeps them in `<script module>` (e.g. `components` from `TlaEditor.svelte`).
- Dialogs: the SDK renders `addDialog({ component })` with `{ onClose }` only. To give a dialog more
  props use `withDialogProps(Dialog, { fileId })` from `utils/withDialogProps.ts`.
- Errors: to show the error UI of the route, `throw` while rendering or in an effect (a
  `<svelte:boundary>` in the page catches it; see "Errors" below). Async errors are not caught
  by boundaries, same as React.
- `React.memo`/`useMemo`/`useCallback` have no equivalent and are not needed.
- Event delegation gotcha (see AGENT-BRIEF.md): `onpointerdown`/`onclick`/... attributes are
  delegated to the app root and run after the editor container's native listeners.

## Routing (`utils/router.svelte.ts`, done)

| React Router                        | Svelte                                                                                                                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `const navigate = useNavigate()`    | `import { navigate }`: `navigate(to, { replace?, state? })`, `navigate(-1)`; `'.'` means the current pathname                                                                                                                          |
| `useLocation()`                     | `import { location }`: `location.pathname / .search / .hash / .href / .state` (reactive getters; `.state` is never null)                                                                                                               |
| `useParams()`                       | `import { params }`: `params.fileSlug`, `params.roomId`, ... (`string \| undefined`)                                                                                                                                                   |
| `useSearchParams()`                 | `import { searchParams, setSearchParams }`: `searchParams.get('x')`, `searchParams.current`, `setSearchParams(fn \| URLSearchParams, { replace })`                                                                                     |
| `<Link to>` / `<NavLink>`           | plain `<a href>`; SvelteKit intercepts same-origin clicks. Use absolute paths (`routes.tlaFile(id)`): a relative `href` resolves against the URL, not the route, so `./x` on `/f/a/history` is `/f/a/x`. Keep `target`/`rel` as before |
| `<Navigate to replace />`           | `navigate(to, { replace: true })` from an `$effect`                                                                                                                                                                                    |
| `location.state`                    | `location.state`. Typed `App.PageState` (`src/app.d.ts`); it is stored in `history.state` and survives reload                                                                                                                          |
| `routeDefs.ts` (`ROUTES`, `routes`) | unchanged: `routes.tlaFile('abc')` etc.                                                                                                                                                                                                |

SvelteKit routing is case-sensitive where React Router was not; `src/hooks.ts` `reroute` restores it.

## Clerk (`utils/clerk.svelte.ts`, done, UNVERIFIED against a live Clerk)

`@clerk/react` hooks over `@clerk/clerk-js`. `initClerk()` is called once by the root layout.

| `@clerk/react`                                            | Svelte                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useAuth()`                                               | `const auth = getAuth()`; `auth.current.{isLoaded,isSignedIn,userId,sessionId,getToken,signOut,has,...}`                                                                                                                                   |
| `useUser()`                                               | `const clerkUser = getUser()`; `clerkUser.current.{isLoaded,isSignedIn,user}` (`user`: `UserResource \| null \| undefined`)                                                                                                                |
| `useClerk()`                                              | `const clerk = getClerk()` (no `.current`; a shared object): `clerk.signOut()`, `clerk.setActive()`, `clerk.client`, `clerk.isSignedIn`, `clerk.buildSignInUrl()`, `clerk.instance` (the raw `Clerk`, `null` until booted), `clerk.loaded` |
| `useSignIn()` from `@clerk/react/legacy`                  | `const signInState = getSignIn()`; `signInState.current.{isLoaded,signIn,setActive}`                                                                                                                                                       |
| `import type { UserResource } from '@clerk/react/types'`  | `import type { UserResource } from '@clerk/shared/types'`                                                                                                                                                                                  |
| `import { ClerkOfflineError } from '@clerk/react/errors'` | `from '@clerk/shared/error'`                                                                                                                                                                                                               |

`getAuth().current` is rebuilt only when Clerk emits new resources. `auth.current.getToken` and
`signOut` keep their identity.

## App (Zero) (`tla/hooks/useAppState.svelte.ts` + `AppStateProvider.svelte`, done)

| React                                             | Svelte                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `useMaybeApp()`                                   | `const app = getMaybeApp()`; `app.current: SvelteDrawApp \| null`                                                       |
| `useApp()`                                        | `const app = getApp()`; `app.current: SvelteDrawApp` (throws if read while null)                                        |
| `useIsAppLoading()`                               | `const loading = getIsAppLoading()`; `loading.current`                                                                  |
| `isClientTooOld$`, `currentApp$`                  | unchanged exports (atoms)                                                                                               |
| `useValue('x', () => app.getFile(id), [app, id])` | `const file = fromComputed('x', () => app.current.getFile(id))` then `file.current` (`fromComputed` from `svelte-draw`) |

`SvelteDrawApp` (`tla/app/SvelteDrawApp.ts`) keeps its API. `navigate` passed to
`SvelteDrawApp.create` is the `navigate` function above.

## Other hooks (`tla/hooks/*`)

| React (old file)                                                                               | Svelte (new file)                                                                                                                                                |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useUser.tsx`: `useSvelteDrawCurrentUser()`, `getIsSvelteDrawStaff(clerkUser)`, `UserProvider` | `useUser.svelte.ts`: `getSvelteDrawCurrentUser(): { current: SvelteDrawUser \| null }`, `getIsSvelteDrawStaff` (same), `UserProvider.svelte` (shell)             |
| `useActiveWorkspaceId()`                                                                       | `useActiveWorkspaceId.svelte.ts`: `getActiveWorkspaceId(): { current: string }`                                                                                  |
| `useCurrentFileId()`                                                                           | `useCurrentFileId.svelte.ts`: `getCurrentFileId(): { current: string \| undefined }`                                                                             |
| `useAnalyticsConsent()` returned `[consent, update]`                                           | `useAnalyticsConsent.svelte.ts`: `getAnalyticsConsent(): { readonly current: boolean \| null; update(consent: boolean): void }`                                  |
| `useEditorDeepLink()`                                                                          | `useDeepLink.svelte.ts`: `getEditorDeepLink(): { current: string \| null }`                                                                                      |
| `useFetchJson<T>(url)`                                                                         | `useFetchJson.svelte.ts`: `getFetchJson<T>(url: () => string): { current: T \| null \| undefined }`                                                              |
| `useIsCommentingEnabled()`                                                                     | `useIsCommentingEnabled.svelte.ts`: `getIsCommentingEnabled(): { current: boolean }`                                                                             |
| `useHasFileAdminRights(fileId?)`                                                               | `useIsFileOwner.svelte.ts`: `getHasFileAdminRights(fileId: () => string \| undefined): { current: boolean }`                                                     |
| `useIsFilePinned(fileId, wsId)`                                                                | `useIsFilePinned.svelte.ts`: `getIsFilePinned(fileId: () => string, workspaceId: () => string): { current: boolean }`                                            |
| `useNewRoomCreationTracking()` returns a fn                                                    | `useNewRoomCreationTracking.ts`: `getNewRoomCreationTracking(): (app, fileId) => void` (same fn)                                                                 |
| `useShareLinkOpenTracking()` returns a fn                                                      | `useShareLinkOpenTracking.ts`: `getShareLinkOpenTracking(): (app, fileId, isEmbed) => void`                                                                      |
| `useCommentTracking()`                                                                         | `useCommentTracking.svelte.ts`: `getCommentTracking()` (returns what the hook returned)                                                                          |
| `usePreventAccidentalDrops()`                                                                  | `usePreventAccidentalDrops.svelte.ts`: `setupPreventAccidentalDrops()`                                                                                           |
| `useSignUpTracking()`                                                                          | `useSignUpTracking.svelte.ts`: `setupSignUpTracking()`; `isNewSignUp`, `getSignUpMethod`, `NEW_ACCOUNT_WINDOW_MS` unchanged                                      |
| `useTldrFileDrop()`                                                                            | `useTldrFileDrop.svelte.ts`: `getTldrFileDrop(): { onDrop, onDragOver, onDragEnter, onDragLeave }` (spread onto the element: `ondrop={drop.onDrop}` ...)         |
| `useUITheme()`                                                                                 | `useUITheme.svelte.ts`: `setupUITheme()`                                                                                                                         |
| `useIsReady()` / `useSetIsReady()` / `<ReadyWrapper>`                                          | `useIsReady.svelte.ts`: `getIsReady(): { current: boolean }`, `getSetIsReady(): () => void`; `ReadyWrapper.svelte` (`children` snippet, same CSS module)         |
| `useRejectSvelteDrawOfflineFiles()` (`utils/svelteDrawOfflineFiles.ts`)                        | `svelteDrawOfflineFiles.svelte.ts`: `getRejectSvelteDrawOfflineFiles(): (files: File[]) => File[]`; `isTldrFile`, `SVELTE_DRAW_OFFLINE_FILE_EXTENSION` unchanged |
| `useSvelteDrawAppUiEvents()` (`utils/app-ui-events.tsx`)                                       | `utils/app-ui-events.ts`: `getSvelteDrawAppUiEvents(): TLAppUiContextType` (a plain function, safe anywhere)                                                     |
| `useIsSidebarOpen()`, `useIsSidebarOpenMobile()` (`utils/local-session-state.ts`)              | `utils/local-session-state.ts`: exported holders `isSidebarOpen`, `isSidebarOpenMobile` (`.current`); `getIsSidebarOpen()` etc. unchanged                        |
| `useGlobalEditor()` (`utils/globalEditor.ts`)                                                  | `getGlobalEditor(): { current: Editor \| null }`; `globalEditor` atom unchanged                                                                                  |
| `useOpenUrlAndTrack(source)` (`hooks/`)                                                        | `hooks/useOpenUrlAndTrack.ts`: `getOpenUrlAndTrack(source)` (same returned fn)                                                                                   |
| `useRoomLoadTracking()` (`hooks/`)                                                             | `hooks/useRoomLoadTracking.ts`: `getRoomLoadTracking(): (editor) => void`                                                                                        |
| `usePerformanceTracking()` (`hooks/`)                                                          | `hooks/usePerformanceTracking.svelte.ts`: `setupPerformanceTracking()`                                                                                           |
| `useLegacyUrlParams()` (`hooks/`)                                                              | `hooks/useLegacyUrlParams.ts`: `setupLegacyUrlParams()` (call in `onMount`-time, i.e. top of `<script>`: it runs synchronously, like a layout effect)            |
| `useUrl()` (`hooks/`)                                                                          | `hooks/useUrl.svelte.ts`: `getUrl(): { current: string }`                                                                                                        |

## Utilities

- `utils/analytics.ts`: `trackEvent(name, data?)`, `analyticsConsent` (holder `{ current: boolean \| null }`, was
  `useAnalyticsConsentValue()`), `configureAnalytics`, `setStoredAnalyticsConsent`,
  `getHandleUiEvents()` (was `useHandleUiEvents()`; returns `trackEvent`), `signoutAnalytics`,
  `cookieConsent`, `COOKIE_CONSENT_KEY`. **done.**
- Intl, replacing `react-intl` (`utils/intl.ts`, **done**): `getIntl(): { current: Intl }`, then
  `intl.current.formatMessage(messages.x, values?)`, `.formatDate`, `.formatNumber`,
  `.formatRelativeTime`. Components: `utils/FormattedMessage.svelte` (`id`, `defaultMessage`, `values`),
  `utils/FormattedRelativeTime.svelte` (`value`, `unit`, `updateIntervalInSeconds`, `numeric`),
  `utils/IntlProvider.svelte`. `defineMessages` still comes from `svelte-draw`; the build plugin
  `scripts/vite-formatjs-svelte-plugin.ts` adds the md5 ids to `.svelte` files too, so write
  `defineMessages({ ... })` in `<script module>` and `<F defaultMessage="..." />` in markup exactly as before
  (no `id`). For text with markup use the SDK's `<F tags={...} elements={...}>`.
- `tla/utils/dates.ts`: `getDateFormat(date): Intl.DateTimeFormatOptions` (the `react-intl` type import is gone).
- `utils/ga4.ts`: `ga4.gtag/set/event/initialize/reset` (the `react-ga4` replacement; shell-only).
- `utils/withDialogProps.ts`: see Conventions.
- `utils/shouldOverrideDocument.ts` + `ConfirmOpenDialog.svelte`: unchanged signature
  `shouldOverrideDocument(addDialog): Promise<boolean>`.
- `tla/utils/slurping.ts`: `maybeSlurp`, `Slurper`, `getShouldSlurpFile`... unchanged. Its
  `showFailureDialog` renders the component `tla/components/TlaEditor/SlurpFailure.svelte`
  (props `{ slurpPersistenceKey, onTryAgain, onClose }`).
- `tla/utils/getIsCoarsePointer.ts`, `redirect.ts`, `copy.ts`, `auth.ts`, `cachedFileVisit.ts`,
  `featureFlags.ts`, `local-session-state.ts`, `session-storage.ts`, `qrcode.ts`: same exports. `auth.ts`
  now takes `UserResource` from `@clerk/shared/types`.

## Shell components the components import (all in `src/components`, shell-owned)

| Import                                                        | Notes                                                                                                                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ErrorPage/ErrorPage.svelte`                       | props `messages: { header, para1, para2? }`, optional `cta?: Snippet` (default: "Back to svelte-draw" link; pass an empty snippet for no CTA) |
| `components/ErrorPage/RefreshErrorBoundary.svelte`            | `messages: { header, para1, cta }`, `children` snippet                                                                                        |
| `components/ErrorPage/SadFaceIcon.svelte`                     | was the `sadFaceIcon` constant                                                                                                                |
| `components/ThemeUpdater/ThemeUpdater.svelte`                 | no props; needs `getEditor()` context                                                                                                         |
| `components/StoreErrorScreen.svelte`                          | prop `error: Error`                                                                                                                           |
| `components/LoginRedirectPage/LoginRedirectPage.svelte`       | no props                                                                                                                                      |
| `components/SneakyMermaidHandler/SneakyMermaidHandler.svelte` | no props; renders nothing                                                                                                                     |
| `components/SneakyOnDropOverride.svelte`                      | prop `isMultiplayer: boolean`                                                                                                                 |
| `components/IFrameProtector.svelte`                           | props `slug`, `context`, `children`; `ROOM_CONTEXT` exported from `<script module>`                                                           |
| `components/LocalEditor.svelte`                               | props `components`, `onMount?`, `children?: Snippet`, `persistenceKey?`, `data-testid?`, `options?`, `overrides?`                             |
| `components/BoardHistoryLog/BoardHistoryLog.svelte`           | props `data: {timestamp, href?}[]`, `hasMore?`, `onLoadMore?`, `isLoading?`; `href` must be absolute                                          |
| `tla/layouts/TlaAnonLayout/TlaAnonLayout.svelte`              | `children` snippet                                                                                                                            |
| `tla/layouts/TlaSidebarLayout/TlaSidebarLayout.svelte`        | props `isEmbed?`, `collapsible?`, `children` snippet                                                                                          |

## What the shell imports from `src/tla/components` (must exist with these exports)

Names are the React basenames with `.svelte`; `export const` values come from `<script module>`.

| Used by                                      | Import                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `routes/(app)/(tla)/+layout.svelte`          | `dialogs/TlaCookieConsent.svelte` (no props, rendered only once a global editor exists), `dialogs/TlaLegalAcceptance.svelte` (dialog component, `onClose`), `MaybeForceUserRefresh/MaybeForceUserRefresh.svelte` (`children` snippet), `TlaEditor/TlaEditor.svelte` exporting `components: TLComponents` from `<script module>`, `WorkspaceInviteHandler.svelte` (no props) and `WORKSPACE_INVITE_QUERY_PARAM` from its `<script module>`  |
| `tla/pages/FilePage.svelte`                  | `TlaEditor/TlaEditor.svelte` (props `fileSlug`, `deepLinks?`, `isEmbed?`), `TlaEditor/TlaFileSyncHost.svelte` (props `fileSlug`, `children` snippet; the shell wraps it in `{#key fileSlug}`), `TlaFileError/TlaFileError.svelte` (prop `error: unknown`)                                                                                                                                                                                  |
| local page                                   | `dialogs/TlaSignInDialog.svelte` (dialog), `TlaAnonDotDevLink/TlaAnonDotDevLink.svelte`, `TlaEditor/CommentsOnCanvas.svelte` exporting `getAnonCommentToolOverrides()` (was `useAnonCommentToolOverrides`, returns `{ current: TLUiOverrides }`), `TlaEditor/sneaky/SneakyDarkModeSync.svelte`, `TlaEditor/sneaky/SneakyDebugModeToast.svelte`, `VIA_LAST_FILE_CACHE` exported from `TlaEditor/TlaFileSyncHost.svelte`'s `<script module>` |
| sidebar layout                               | `TlaSidebar/TlaSidebar.svelte`, `TlaSidebar/components/TlaSidebarToggle.svelte`, `TlaSidebar/components/TlaSidebarToggleMobile.svelte`                                                                                                                                                                                                                                                                                                     |
| other pages                                  | `TlaEditor/TlaLegacyFileEditor.svelte` (props `fileSlug`, `roomOpenMode`), `TlaEditor/TlaLegacySnapshotEditor.svelte` (`fileSlug`, `snapshot`), `TlaEditor/TlaHistorySnapshotEditor.svelte`, `TlaEditor/TlaPublishEditor.svelte` (`records`, `schema`), `TlaLogo/TlaLogo.svelte` (`class`), `TlaIcon/TlaIcon.svelte`                                                                                                                       |
| `SvelteDrawApp.ts`                           | none                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `LocalEditor.svelte`                         | `TlaEditor/sneaky/SneakyToolSwitcher.svelte`, `TlaEditor/useExtraToolDragIcons.svelte.ts` exporting `getExtraDragIconOverrides()`, `TlaEditor/useFileEditorOverrides.svelte.ts` exporting `getFileEditorOverrides(opts)` (both return `{ current: TLUiOverrides }`)                                                                                                                                                                        |
| `utils/slurping.ts`                          | `TlaEditor/SlurpFailure.svelte`                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tla/utils/svelteDrawOfflineFiles.svelte.ts` | `dialogs/TlaSvelteDrawOfflineFileDialog.svelte`                                                                                                                                                                                                                                                                                                                                                                                            |

## Errors

SvelteKit replaces the thrown value with `App.Error` (`src/app.d.ts`) before a page sees it. The
client `handleError` (`src/hooks.client.ts`) keeps the original on `error.original`, so for a
`<svelte:boundary>` `failed` snippet or a `+error.svelte` use `(error as App.Error).original ?? error`
to get the thrown `RemoteSyncError` / `TlaNotFoundError` / ... back. `TlaFileError` receives the
unwrapped value. Expected errors (`isExpectedRouteError`) are not reported to Sentry.

## Reactive env the components can rely on

- `getEditor()` / `getContainer()` / `getDialogs()` / `getToasts()` / `getTranslation()` from `svelte-draw` are
  available everywhere under `routes/(app)/(tla)` (the shell mounts `SvelteDrawUiContextProvider`
  there). `getEditor()` is **not**: it throws outside a `<SvelteDraw>`; use `getGlobalEditor().current`
  in the sidebar and other shell-level components.
- `translations`: dotcom's own messages reach `getTranslation()` through the provider `overrides`
  (the shell passes them), so `msg(messages.x)` keeps working.

## Known gaps handed to other owners

See the shell report; the one that affects component work is that `SvelteDrawUiContextProvider` reads
the _static_ `tryGetEditor()` context, so in the shell the sidebar's SDK UI follows the default
locale rather than the user's locale preference until the SDK accepts a `locale` prop.
