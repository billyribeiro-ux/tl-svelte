---
name: write-unit-tests
description: Writing unit and integration tests for the svelte-draw SDK. Use when creating new tests, adding test coverage, or fixing failing tests in packages/editor or packages/svelte-draw. Covers Vitest patterns, TestEditor usage, and test file organization.
---

# Writing tests

Unit and integration tests use Vitest and run from workspace directories, not the repo root.

Read a neighboring test before writing a new one — the existing suites are the specification for how we test, and they stay current in a way prose can't. Good starting points:

- `packages/svelte-draw/src/test/SelectTool.test.ts` — tool state machine assertions
- `packages/svelte-draw/src/test/resizing.test.ts` — pointer-driven interaction with handles
- `packages/svelte-draw/src/lib/shapes/arrow/ArrowShapeUtil.test.ts` — shape util plus bindings
- `packages/editor/src/lib/editor/managers/ClickManager/ClickManager.test.ts` — a UI-free manager
- `packages/editor/src/lib/primitives/Vec.test.ts` — a plain primitive

For the available `TestEditor` methods, read the class itself rather than a list here: `packages/svelte-draw/src/test/TestEditor.ts`.

## Which workspace

- `packages/editor` — core primitives, geometry, managers, base editor behavior that must not depend on default shapes or UI.
- `packages/svelte-draw` — anything needing default shapes or tools, which is most integration tests.

Each package has its own `TestEditor`, and they are not interchangeable: `packages/editor/src/lib/test/TestEditor.ts` has no default shapes or tools, `packages/svelte-draw/src/test/TestEditor.ts` wires up the full SDK. Import from the package you're testing in.

```bash
cd packages/svelte-draw && pnpm test run
cd packages/svelte-draw && pnpm test run -t "SelectTool"
cd packages/svelte-draw && pnpm test          # watch mode
```

## Svelte component tests

Tests that render components are named `*.svelte.test.ts` and run in jsdom through the `@sveltejs/vite-plugin-svelte` plugin configured in each package's `vitest.config.ts` (first-party components compile in runes mode, so `$state` works in the test file itself). Mount with `mount` / `flushSync` / `unmount` from `svelte`, and wait for async work with `vi.waitFor`. Unmount in `afterEach`.

- `packages/svelte-draw/src/lib/SvelteDraw.svelte.test.ts` — mounting `<SvelteDraw />` directly, with a test-only wrapper component from `packages/svelte-draw/src/lib/testing/`
- `packages/svelte-draw/src/test/svelte/renderSvelteDraw.ts` — `renderSvelteDraw(props, { child })` mounts the SDK and resolves with `{ editor, target, findByTestId, unmount }`; also exports `act`, `screen`, `waitFor`, `within`. Use it instead of hand-rolling a mount.
- `packages/svelte/src/lib/state/fromSignal.svelte.test.ts` — testing the signal-to-rune bindings

## Placement

Unit tests sit next to the file they cover (`Vec.ts` → `Vec.test.ts`). Cross-cutting integration tests live in `packages/svelte-draw/src/test/`. Shape and tool tests sit with the implementation, not in `src/test/`.

## Gotchas

These are the things reading an existing test won't tell you.

**Wheel and pinch events are batched.** `dispatch()` alone won't apply them — emit a tick to flush:

```typescript
editor.dispatch(wheelEvent)
editor.emit('tick', 16)
```

See `packages/editor/src/lib/editor/Editor.test.ts` for the full pattern.

**`toCloselyMatchObject` is ours, not Vitest's.** Use it instead of `toMatchObject` whenever floating-point geometry is involved, or tests fail on rounding noise. It takes an optional `roundToNearest`. Defined in `packages/svelte-draw/src/test/TestEditor.ts`.

**Animation-dependent code needs the rAF stub.** `vi.useFakeTimers()` alone isn't enough, because requestAnimationFrame isn't driven by the fake clock. Tests that animate replace it at module scope — see the top of `packages/svelte-draw/src/lib/shapes/arrow/ArrowShapeUtil.test.ts`.

**Dispose the editor in `afterEach`.** `editor?.dispose()` releases the reactive subscriptions and timers the editor holds; without it they leak across tests in the same file. Suites that build up shapes also tend to clear them in `beforeEach` so each test starts from a known page.

**Always `mockRestore()` a `vi.spyOn` on the editor.** Editor instances outlive individual assertions within a suite, so an unrestored spy silently changes later tests.

**Restore anything global in `finally` or `afterEach`.** `process.env.NODE_ENV`, `vi.useFakeTimers()` (back to `vi.useRealTimers()`), Postgres `search_path`, `window` globals. Restoring at the end of the test body leaks into every later test when an assertion throws.

**No dates relative to now against a fixed cutoff.** A test that builds `Date.now() - 1 day` and compares it to a hardcoded launch date starts failing on its own. Use fixed dates or `vi.setSystemTime`.

**Prove the test can fail.** Assert the specific outcome (the count, which element has focus, that messages still arrive after reconnect), not just that something exists. Exercise the production path, not a stand-in built for the test, and cover the failure branch of new code, not only the happy one. A test that only passes because it asserts before async validation lands is not a test.

## Conventions

- Use `createShapeId()` for shape IDs so they're stable and typed.
- Prefer comparing whole objects over field-by-field assertions when it gives a clearer failure.
- Use `editor.expectToBeIn('select.idle')` for state machine assertions rather than reaching into internals.
- `@ts-expect-error` is the way to assert that invalid props are rejected at the type level.
