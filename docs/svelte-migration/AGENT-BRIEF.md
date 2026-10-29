# Porting agent brief (read fully before touching code)

You are porting part of the svelte-draw monorepo (a rebranded tldraw fork at `/Users/billyribeiro/dev/tl-draw/tldraw-main`)
from React to Svelte 5. Read `docs/svelte-migration/PLAN.md` first for the design contracts.

## Process, one file at a time

1. Run `git status --short <your dirs>` and list what already exists. A previous agent may have left files
   half-finished. **Audit every existing `.svelte` / `.svelte.ts` file in your area before trusting it**: run the
   autofixer and `svelte-check` on it and compare it with the React original. Fix or redo anything incomplete.
2. For each remaining `.tsx`: read the React original in full (`git show 425ecac:<path>` or the file in place),
   read the nearest already-ported example, then write the Svelte file, run the checks below, port the test, and
   only then `git rm` the `.tsx`. Never leave a file half-written; finish a file before starting the next.
3. Work in small steps. After each file run the file's checks. Do not batch ten files and check at the end.

## Hard rules

- Never delete, skip or weaken a test to get green. Never use `@ts-ignore` / `any` to silence a real error.
- Do **not** run `git commit`, `git push` or `git add` (other agents share the index). Use `git rm` only for the
  `.tsx` files you replaced.
- Cite evidence (file + line) for every claim in your report; write UNVERIFIED for anything you did not run.
- Preserve behaviour exactly: every class name, `data-*`, `aria-*`, `id`, CSS variable, keyboard handler, and every
  comment that records a non-obvious reason. Do not simplify away edge cases.
- Do not edit files outside your ownership list. If you need something from another area, import it by its future
  `.svelte` / `.svelte.ts` path and list it under "depends on" in your report.
- Never touch license logic, license notices or watermark behaviour.

## Svelte workflow (mandatory)

- Before writing Svelte, call the Svelte MCP `list-sections` then `get-documentation` for runes, snippets,
  attachments (`{@attach}`), context and events.
- Run the Svelte MCP `svelte-autofixer` on every `.svelte` / `.svelte.ts` file until it returns no `issues`.
  The `filename` argument must end in `.svelte` or `.svelte.ts` (use `.svelte.ts` for test files, which end in
  `.svelte.test.ts`, otherwise the parser fails). Pass the code itself, not a path.
- Svelte 5 runes only: `$state`, `$derived`, `$effect`, `$props`, `$bindable`, snippets with `{@render}`,
  `{@attach}`. No `export let`, `$:`, `on:`, `<slot>`, stores, `createEventDispatcher`.
- `$`-prefixed identifiers are reserved in Svelte files (a local named `$from` is invalid).

## The three gotchas that break ports silently

1. **Signals.** Reading an `Editor` getter or any `@svelte-draw/state` signal in a template or `$derived` is NOT
   tracked by Svelte. Wrap it: `fromComputed("name", () => editor.getX())` (note the leading debug name) or `fromSignal(sig)` from `@svelte-draw/svelte`
   and read `.current`. In event handlers plain reads are fine. DOM updates that used `useQuickReactor` use
   `quickReactor` inside `$effect`.
2. **Event delegation.** Svelte delegates `pointerdown`, `pointerup`, `click`, `keydown`, `touchend`, `input`,
   `dblclick` (when written as `onpointerdown={...}` attributes) to the app root, so they run AFTER the editor
   container's native listeners and cannot `stopPropagation()` or `editor.markEventAsHandled` in time. Anything
   that stopped propagation or marked an event handled in the React original must use
   `{@attach nativeEvents({ pointerdown: fn })}` (see `packages/svelte-draw/src/lib/shapes/shared/nativeEvents.ts`).
3. **SVG namespace.** A component whose root element is an SVG element (`<g>`, `<path>`, `<foreignObject>`, ...)
   needs `<svelte:options namespace="svg" />`, or it renders into the HTML namespace.

## Where the already-ported idioms live (read before writing)

- `packages/svelte/src/lib/{canvas,root,export,state,context}/**` (editor host; `View.svelte`, `HTMLContainer`,
  `SVGContainer`, `Shape.svelte`, `fromComputed`, `getEditor()`).
- `packages/svelte-draw/src/lib/shapes/shared/**` (labels, patterns, `PathBuilder`, hooks as `.svelte.ts`).
- `packages/svelte-draw/src/lib/ui/context/index.ts` (old hook -> new function mapping table),
  `ui/components/primitives/index.ts` (bits-ui based primitives), `ui/hooks/index.ts`.
- `ShapeUtil.component()` returns `shapeView(Component, props)` (`shapeView` from `@svelte-draw/editor`).

## Gates (run only these, from `packages/svelte-draw`)

```
pnpm exec svelte-check --tsconfig ./tsconfig.json --threshold error --output machine 2>&1 | grep ' ERROR ' | grep '<your path regex>'
pnpm exec vitest run <your test paths>
```

The package still has many unrelated errors from areas not ported yet; ignore those but never add new ones in your
files. Errors that are only "cannot find module" for a not-yet-ported sibling are acceptable: list each.

## Report format

Files created / removed, tests ported (counts), behaviours not reproduced, UNVERIFIED items, "depends on" list,
and the exact gate output lines you relied on.
