# Svelte 5 / SvelteKit 3.1 migration plan

Status tracker and design contracts for converting svelte-draw from React to Svelte 5 + SvelteKit 3.1.
Keep this file current: update the checklist as work lands, and never tick a box without a passing check.

## Pinned toolchain (verified against the npm registry, cutoff 2026-10-25)

| Tool                             | Version                            | Why                                                                  |
| -------------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Node                             | 24.x (LTS)                         | SvelteKit 3 needs >=22.17                                            |
| pnpm                             | 12.15.0                            | Latest published by the cutoff                                       |
| `@sveltejs/kit`                  | 3.1.0                              | Required                                                             |
| `svelte`                         | 5.57.2                             | 5.57.3 was published 2026-10-26, after the cutoff; Kit needs ^5.57.1 |
| `vite`                           | ^8.0.12 (workspace resolves 8.2.1) | Kit peer range                                                       |
| `@sveltejs/vite-plugin-svelte`   | 7.3.1                              | Kit peer range ^7                                                    |
| `typescript` (Svelte workspaces) | 6.0.3                              | Kit needs ^6; svelte-check 4.7.7 allows ^5 \|\| ^6, not 7            |
| `svelte-check`                   | 4.7.7                              | Latest                                                               |

The rest of the monorepo keeps the root TypeScript 7.0.2 until its packages move to Svelte workspaces.

## What stays, what is replaced

Framework-free and kept as is: `state`, `store`, `tlschema`, `utils`, `validate`, `sync-core`, `collections`,
`driver`, `assets`, and in `editor`: `Editor`, managers, tools (`StateNode`), geometry, primitives, bindings,
`LicenseManager` (license-key logic is not modified).

Replaced: everything importing `react` / `react-dom` / `@svelte-draw/state-react` (about 750 `.tsx` files plus
hook-using `.ts` files).

## Contracts

1. **Signals to Svelte.** `@svelte-draw/svelte` exports `fromSignal`, `fromComputed`, `quickReactor`.
   Any read of an `Editor` getter or signal inside a Svelte template or `$derived` MUST go through
   `fromComputed` (or live inside a `quickReactor`), otherwise it will not update. This replaces `useValue` / `track`.
2. **Editor access.** Components get the editor via Svelte context (`getEditor()` / `setEditor()` in
   `@svelte-draw/svelte`), replacing `useEditor`.
3. **Shape rendering.** `ShapeUtil.component(shape)` returns a `ShapeView` (`{ component, props }`) instead of JSX.
   The canvas renders it with `<View {view} />`. Shape components are `.svelte` files next to their util.
4. **SVG export.** The editor core calls an injectable renderer (`editor.options` / registered by the Svelte
   package) that mounts an off-screen export tree with `mount()` + `flushSync()`, waits on `ExportDelay`,
   serializes it, and unmounts. `toSvg` / `toBackgroundSvg` return a `ShapeView` too.
5. **Events.** Native DOM events and `{@attach}` attachments replace the React synthetic events and hooks
   (`useCanvasEvents`, `useGestureEvents`, `useDocumentEvents`, ...).
6. **Styling.** Existing CSS (`editor.css`, `ui.css`, `tl-*` classes) is kept so rendering stays pixel-identical.
7. **Errors.** `<svelte:boundary>` replaces `ErrorBoundary`; failures go through `editor.annotateError`.
8. **Licensing.** `LicenseManager`, the watermark behaviour and notices are ported, never removed or weakened.

## Milestones

- [x] M0 Rebrand to svelte-draw (committed `425ecac`)
- [x] M1a `@svelte-draw/svelte` package: signal bridge + tests
- [ ] M1b Editor core free of React (ShapeView contract, injectable SVG exporter, native event types)
- [ ] M2 Editor host in Svelte: canvas, shapes layer, culling, overlays, events, gestures, cursors, errors
- [ ] M3 Default shapes as Svelte components (arrow, bookmark, draw, embed, frame, geo, group, highlight, image, line, note, text, video)
- [ ] M4 SDK UI in Svelte (toolbar, menus, style panel, dialogs, help, a11y, translations)
- [ ] M5 Remaining packages: sync, commenting, mentions, mermaid, create-svelte-draw
- [ ] M6 SvelteKit 3.1 apps: examples, dotcom client, docs, vscode webview, mcp-app, templates
- [ ] M7 Remove React (state-react, deps, lockfile), delete obsolete code, update docs
- [ ] M8 Verification: svelte-check, vitest, Playwright, production build, branding audit

## Conventions for every porting task (humans and agents)

- Read the Svelte docs through the Svelte MCP (`list-sections`, `get-documentation`) before writing Svelte, and run
  `svelte-autofixer` on every `.svelte` / `.svelte.ts` file until it is clean. Filenames passed to the autofixer must
  end in `.svelte` or `.svelte.ts`.
- Svelte 5 runes only: `$state`, `$derived`, `$effect`, `$props`, `$bindable`, snippets + `{@render}`, `{@attach}`.
  No `export let`, `$:`, `on:`, `<slot>`, stores or `createEventDispatcher` in new code.
- `$state` only for values that are reassigned; use `$state.raw` for big objects replaced wholesale.
  `$effect` only for real side effects (DOM, subscriptions), never to derive values.
- Reading an `Editor` getter or any `@svelte-draw/state` signal inside a template or `$derived` must go through
  `fromComputed` / `fromSignal` from `@svelte-draw/svelte` (contract 1 above). Plain reads are only fine inside
  event handlers.
- Preserve behaviour first: port the original line by line, keep every class name, `data-*`, `aria-*`, `id` and
  CSS variable, and keep comments that record a non-obvious reason. Do not simplify away edge cases.
- Port the original tests too (React Testing Library to `@testing-library/svelte` or direct `mount()` +
  `flushSync()`); a ported file without its test is not done. Never delete a failing test to get green.
- Original React sources are in the git history (`git show 425ecac:<path>`) and in the untouched backup at
  `/Users/billyribeiro/dev/tl-draw-backup/tldraw-main` (pre-rebrand, so names there still say `tldraw`).
- Browser APIs only inside `onMount` / `$effect` / attachments so SSR never touches `window`.
- Per-package gates: `svelte-check` (via `pnpm build-types`) and `pnpm exec vitest run` in the package you touched.
  Do not run repo-wide gates.
- Never touch `LicenseManager.ts` logic, license notices, or the key/watermark behaviour. Port the React
  `LicenseProvider` / `Watermark` faithfully.
- UI primitives that used `radix-ui` use `bits-ui` 2.x; `@use-gesture/react` becomes `@use-gesture/vanilla`;
  `@tiptap/react` becomes `@tiptap/core` driven imperatively; `react-intl` becomes `intl-messageformat`.

## Parity oracle (React reference)

- Reference: `git worktree` of commit `425ecac` (rebranded React build) at `/Users/billyribeiro/dev/tl-draw-ref`.
  Start its dev server with `cd apps/examples && pnpm exec vite --port 5420 --strictPort`.
- Run the Playwright suite with `NODE_OPTIONS='--no-strip-types' pnpm exec playwright test -c ./e2e/pw-parity.config.ts --project=chromium`
  from `apps/examples`. `pw-parity.config.ts` points Playwright at the cached Chromium revision, disables video
  (no ffmpeg) and expects the app to already be running on :5420.
- The 49 `*-chromium-darwin.png` baselines (git-ignored by `apps/examples/.gitignore`, kept on disk only) in `apps/examples/e2e/tests/*-snapshots/` were rendered by the React
  reference on this machine. The committed Linux baselines are not comparable on macOS.
- Reference result: 419 passed, 8 failed, 23 skipped. Known environmental failures (they also fail on the
  unmodified original): six `test-routes` sync routes (need the bemo worker) and two `test-text` font-measurement tests.
  The Svelte port must match: no new failure, and the same 8 may stay red until the worker/font cause is addressed.
