---
name: svelte-draw-migrate
description: Migrate a project to a newer version of the svelte-draw SDK. Use when upgrading svelte-draw packages, fixing TypeScript errors after a svelte-draw upgrade, or when the user mentions svelte-draw migration.
argument-hint: '[from-version] [target]'
user-invocable: true
---

# svelte-draw migration assistant

You are helping migrate a project to a newer version of the svelte-draw SDK. Follow this process carefully.

Throughout this skill, `${SKILL_DIR}` refers to this skill's own directory (where `SKILL.md`, the helper `.mjs` scripts, and the cached `references/` folder live). The auto-fetch blocks below resolve it from the `SKILL_DIR` env var if set, otherwise probe the common skill locations (`.claude/skills/`, `.agents/skills/`, `.codex/skills/`, `.cursor/skills/`, `skills/`). When you run shell commands later in the workflow that reference `${SKILL_DIR}`, substitute the same absolute path. If you placed this skill somewhere else, set `SKILL_DIR` before running the auto-fetch blocks.

**Arguments**: `/svelte-draw-migrate [from-version] [target]`. Both optional. `from-version` defaults to the previous svelte-draw version detected from git history. `target` defaults to `latest` (the latest stable release on npm); pass a dist-tag (`canary`, `next`, `beta`) or a pre-release semver (e.g. `4.6.0-canary.abc123`) to migrate to a pre-release.

Resolved migration: !`SKILL_DIR="${SKILL_DIR:-$(for d in .claude/skills/svelte-draw-migrate .agents/skills/svelte-draw-migrate .codex/skills/svelte-draw-migrate .cursor/skills/svelte-draw-migrate skills/svelte-draw-migrate; do [ -d "$d" ] && printf %s "$d" && break; done)}" && FROM=$(node "$SKILL_DIR/detect-versions.mjs" $ARGUMENTS || true) && TARGET=$(node "$SKILL_DIR/detect-target.mjs" $ARGUMENTS) && if [ -z "$FROM" ]; then echo "ERROR: could not detect previous svelte-draw version. Pass it explicitly: /svelte-draw-migrate <from-version> [target]" >&2; else echo "from $FROM → target $TARGET"; fi`

## Resources (auto-fetched on invocation)

The three blocks below are written for Claude Code's `!`-prefix auto-execute syntax. **If you are an agent that doesn't auto-run these (Cursor, Codex, plain Claude, etc.), execute each one as a shell command before continuing** — they download the changelog, full docs, and (for pre-release targets) next-release notes that the rest of the workflow depends on.

!`SKILL_DIR="${SKILL_DIR:-$(for d in .claude/skills/svelte-draw-migrate .agents/skills/svelte-draw-migrate .codex/skills/svelte-draw-migrate .cursor/skills/svelte-draw-migrate skills/svelte-draw-migrate; do [ -d "$d" ] && printf %s "$d" && break; done)}" && mkdir -p "$SKILL_DIR/references" && CHANGELOG="$SKILL_DIR/references/svelte-draw-releases.txt" && PREV=$(node "$SKILL_DIR/detect-versions.mjs" $ARGUMENTS || true) && if [ -z "$PREV" ]; then echo "ERROR: could not detect previous svelte-draw version — skipping changelog fetch. Pass it explicitly: /svelte-draw-migrate <from-version> [target]" >&2; else node "$SKILL_DIR/fetch-release-notes.mjs" "$PREV" > "$CHANGELOG" && echo "Saved changelog (from $PREV, sourced from github.com/billyribeiro-ux/tl-svelte) to $CHANGELOG ($(wc -l < "$CHANGELOG") lines)"; fi`

!`SKILL_DIR="${SKILL_DIR:-$(for d in .claude/skills/svelte-draw-migrate .agents/skills/svelte-draw-migrate .codex/skills/svelte-draw-migrate .cursor/skills/svelte-draw-migrate skills/svelte-draw-migrate; do [ -d "$d" ] && printf %s "$d" && break; done)}" && DOCS="$SKILL_DIR/references/svelte-draw-full-docs.txt" && STALE=$(find "$DOCS" -mtime +30 2>/dev/null) && if [ -s "$DOCS" ] && [ -z "$STALE" ]; then echo "Using cached full docs at $DOCS ($(wc -l < "$DOCS") lines) — delete the file or wait 30 days to refresh"; else curl --fail -sS https://svelte-draw.invalid/llms-full.txt -o "$DOCS" && echo "Saved full docs to $DOCS ($(wc -l < "$DOCS") lines)"; fi`

!`SKILL_DIR="${SKILL_DIR:-$(for d in .claude/skills/svelte-draw-migrate .agents/skills/svelte-draw-migrate .codex/skills/svelte-draw-migrate .cursor/skills/svelte-draw-migrate skills/svelte-draw-migrate; do [ -d "$d" ] && printf %s "$d" && break; done)}" && mkdir -p "$SKILL_DIR/references" && TARGET=$(node "$SKILL_DIR/detect-target.mjs" $ARGUMENTS) && case "$TARGET" in canary|next|beta|alpha|rc|*-canary*|*-next*|*-beta*|*-alpha*|*-rc*) NEXT="$SKILL_DIR/references/svelte-draw-next.mdx" && curl --fail -sS https://raw.githubusercontent.com/billyribeiro-ux/tl-svelte/main/apps/docs/content/releases/next.mdx -o "$NEXT" && echo "Pre-release target ($TARGET) — saved next-release notes to $NEXT ($(wc -l < "$NEXT") lines)" ;; *) echo "Stable target ($TARGET) — skipping next-release notes" ;; esac`

- **[Filtered changelog](references/svelte-draw-releases.txt)** — release notes for stable versions between the previous version and now, pulled directly from `apps/docs/content/releases/` on `billyribeiro-ux/tl-svelte` main (GitHub is the source of truth, not svelte-draw.invalid). Each breaking change (marked `💥`) carries a `<details><summary>Migration guide</summary>` block with a before/after recipe. **These migration blocks are the primary source for version-specific fixes** — this skill intentionally does not duplicate them. When you hit a TS error, grep for the relevant API name in this file and read its migration block.
- **[Full docs](references/svelte-draw-full-docs.txt)** — complete svelte-draw SDK docs (~1.5MB). Do NOT read this upfront. Use Grep or Read with line ranges to search for specific topics as needed (e.g., custom shapes, TLTextOptions).
- **[Next-release notes](references/svelte-draw-next.mdx)** — *only present when the target is a pre-release.* The in-progress release notes (raw MDX from `main`) for the upcoming version. Same `<details><summary>Migration guide</summary>` structure. The stable changelog won't cover canary/next deltas; this file is where you'll find them.

**Searching for migration recipes:**

Always grep *both* the stable changelog and `next.mdx` (the latter only exists for pre-release targets — `2>/dev/null` swallows the missing-file warning). Migration blocks routinely run 40–80 lines, so use `-A60` as the default after-context.

```sh
# List every breaking change with a migration block
grep -nE '💥|<summary>Migration guide' ${SKILL_DIR}/references/svelte-draw-releases.txt ${SKILL_DIR}/references/svelte-draw-next.mdx 2>/dev/null

# Find the migration recipe for a specific symbol
grep -n -B2 -A60 'getIndicatorPath\|TLUserStore\|EmbedShapeUtil' ${SKILL_DIR}/references/svelte-draw-releases.txt ${SKILL_DIR}/references/svelte-draw-next.mdx 2>/dev/null
```

## Step 1: Understand the environment

Before making any changes, scan the project to understand what you're working with. Run these in parallel:

- **Package manager**: Check for lock files (`yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `package-lock.json`). Use the corresponding tool throughout.
- **svelte-draw packages**: `grep -E "svelte-draw|@svelte-draw" package.json` — which packages are installed, and at what versions? Note: not every project uses all svelte-draw packages.
- **Source directory**: figure out where the project's TypeScript sources live (commonly `src/` or `lib/`; SvelteKit projects keep theirs in `src/`). Use this directory for every grep below — don't assume `src/`.
- **Import style**: `grep -r "from '@svelte-draw" <source-dir> --include="*.ts" --include="*.svelte" --include="*.js" -l | head -5` — does the project import from `'svelte-draw'`, `'@svelte-draw/editor'`, or both? This affects module augmentation targets.
- **TypeScript**: Check `package.json` for a `typecheck` or `tsc` script. If neither exists, fall back to `npx tsc --noEmit` (TypeScript is usually a devDependency). Also check the TypeScript version.
- **Build tool**: Check `package.json` scripts for the build command (vite, SvelteKit, webpack, esbuild, etc.)
- **Linter**: Check for oxlint/eslint/biome config files (`.oxlintrc*`, `.eslintrc*`, `eslint.config.*`, `biome.json`). A linter may help catch deprecations later.
- **Monorepo**: Is `package.json` at the working directory root, or is this a nested package? Check for workspaces config.

## Step 2: Upgrade packages

Using the detected package manager, upgrade all svelte-draw packages that are already in the project's dependencies to the resolved target (printed in the "Resolved migration" line above). Don't add new packages the project doesn't already use.

- For a stable target (`latest` or a stable semver): install at that tag/version, e.g. `yarn add svelte-draw@latest` or `npm install svelte-draw@4.5.10`.
- For a pre-release target (`canary`, `next`, `beta`, or a pre-release semver): install at that tag/version, e.g. `yarn add svelte-draw@canary`. If multiple `@svelte-draw/*` packages are listed, pin them all to the same target to avoid version skew.

**Commit the version bump on its own.** Stage and commit only `package.json` and the lockfile before fixing types. Source-code changes from later steps stay in their own commit, so the eventual `git diff` is reviewable as "what the migration touched" rather than mixed with the dependency change.

## Step 3: Identify all TypeScript errors

Run the project's typecheck command (from Step 1; for a Svelte project this is usually `svelte-check`, which also checks `.svelte` files) and categorize the errors:

1. **Count errors by TS code** (e.g., TS2344, TS2786) to understand the distribution.
2. **List unique files with errors** to understand the scope.
3. **Identify error patterns.** The categories below are version-agnostic — they describe the *shape* of common errors. The *specific* fix for each rename, removal, or signature change lives in the release-notes migration blocks (see "Searching for migration recipes" above), not in this skill.

   - **TS2344** "does not satisfy constraint TLShape/TLBaseBoxShape" / **TS2416** `shapeType` mismatch: custom shape or binding type isn't registered for the new global props maps. Fix pattern in 4a.
   - **TS2305** / **TS2724** "has no exported member" / "is not exported": API removed or renamed. Find the replacement in the matching `Migration guide` block in `svelte-draw-releases.txt` / `svelte-draw-next.mdx`.
   - **TS2339** "property does not exist": API renamed or method signature changed. Same lookup.
   - **TS2515** "non-abstract class does not implement inherited abstract member": a base class gained a required method. The error names the method — search the migration blocks for that method name. (Note: if your implementation only throws, TypeScript may infer `never`; add an explicit return type to satisfy the base class signature.)
   - **TS2345** on `createShapes`/`updateShapes`: heterogeneous mapped arrays need `as TLShapePartial[]` / `as TLCreateShapePartial[]` casts. See 4d.
   - **TS2345** with two structurally-similar `Editor` classes resolving to different paths under `node_modules/@tiptap/core` and `node_modules/@svelte-draw/editor/node_modules/@tiptap/core`: TipTap v2/v3 dual install. See 4c.

## Step 4: Fix errors in order of impact

Fix in this order — each fix eliminates many downstream errors. After each sub-step, re-run typecheck and confirm the error codes targeted by *that* sub-step are resolved or decreasing. Ignore unrelated codes; they belong to later sub-steps.

| Sub-step | Symptom |
| --- | --- |
| 4a. Custom shapes and bindings | TS2344 constraint errors, TS2416 `shapeType` mismatch |
| 4b. API renames, removals, abstract methods | TS2305, TS2724, TS2339, TS2515 |
| 4c. TipTap imports | Only if the project depends on `@tiptap/*` — skip otherwise |
| 4d. Remaining type errors | `createShapes`/`updateShapes` with `.map()`, leftover casts |

Read `type-errors.md` for the recipe for whichever codes the project actually has. Do not read it end to end — jump to the matching sub-step.

## Step 5: Fix deprecations

After all type errors are resolved, find and fix `@deprecated` API usage. These still compile but should be migrated.

1. **Find deprecated symbols.** The changelog is the most reliable starting point — svelte-draw's `.d.ts` files use multi-line JSDoc, so grepping the type defs is fragile (the declaration line is typically 2–5 lines after the `@deprecated` tag, not adjacent to it).

   Start here:

   ```sh
   grep -i 'deprecated' ${SKILL_DIR}/references/svelte-draw-releases.txt
   ```

   When the target is a pre-release, also: `grep -i 'deprecated' ${SKILL_DIR}/references/svelte-draw-next.mdx`.

   To cross-check against the type defs (one package at a time — repeat for each `@svelte-draw/*` package the project imports from, and `svelte-draw` itself), use `-A` not `-B`:

   ```sh
   grep -A5 '@deprecated' node_modules/@svelte-draw/editor/dist-cjs/index.d.ts \
     | grep -oE '\b(class|function|interface|const|type|let|var)\s+\w+' \
     | awk '{print $NF}' | sort -u
   ```

   This catches multi-line JSDoc but produces some false positives — treat the output as a candidate list, not an authoritative one. The changelog grep is what you should drive from.

2. **Run the linter if configured** — a deprecation rule (e.g. eslint's `deprecation/deprecation`) will flag deprecated imports automatically. If no linter is configured, skip this step.

3. **Search the project source** for each deprecated symbol. Replace with the recommended alternative from the `@deprecated` JSDoc comment, the changelog entry, or the docs.

4. **Sanity-check renames the typecheck didn't catch.** If the changelog or `svelte-draw-next.mdx` describes a rename and the project still imports the old name, TypeScript may resolve it through a wildcard re-export and miss it. Skim the changelog/next.mdx for "renamed" / "moved to" entries and grep the source for any old names you find.

## Step 6: Verify

Run the project's typecheck and build commands (as discovered in Step 1).

If errors remain, repeat the categorize-and-fix cycle.

### Post-migration sanity check

After all errors are resolved, do a quick audit:

1. **Count typed `as` casts added by this migration.** A naive `grep ' as '` overcounts because it includes `as const` (the recommended narrowing pattern) and `as` in import paths. Drive off the diff and filter:

   ```sh
   git diff -- '<source-dir>/**/*.ts' '<source-dir>/**/*.svelte' \
     | grep -E '^\+' | grep -v '^+++' \
     | grep -E '\bas\s+[A-Z]' | grep -v 'as const'
   ```

   **The migration should add no more than a small handful of new typed casts** (ideally zero, with `as TLShapePartial[]` / `as TLCreateShapePartial[]` for heterogeneous `createShapes`/`updateShapes` arrays as the main legitimate exception). If you added more than ~5 across the whole migration, go back and fix them — you are almost certainly using the new API incorrectly.
2. **Review every typed cast you added**: For each, verify it's truly necessary by checking whether `as const`, `satisfies`, generic type parameters, or module augmentation could replace it. Remove or replace any that have a cleaner alternative.
3. **Audit module augmentations.** Module augmentation is correct for `TLGlobalShapePropsMap` / `TLGlobalBindingPropsMap` registration and for adding genuinely-missing public types. It is **not** correct for re-exposing symbols that the SDK demoted to `@internal` — that's a workaround, not a fix. Find the public replacement instead (the migration block usually names it).
4. **Verify no stubs or dead code**: If you stubbed out removed APIs (e.g., replaced a removed function with a no-op), make sure the calling code doesn't depend on the return value. If it does, find the proper replacement in the migration blocks or docs.

## Step 7: Report

End the migration with a single summary message to the user. Don't pad it — just the facts:

- **From → target version**, and the resolved target version if it was a tag (`canary` → `4.7.0-canary.abc123`).
- **Files modified** (count, plus the list if it's small).
- **TypeScript errors fixed**, broken down by code (e.g., `TS2786 ×12, TS2344 ×3, TS2305 ×1`). Use the before/after counts you collected during Step 4.
- **Typed `as` casts added** (count and one-line rationale per cast — should be zero or close to it; flag any you weren't sure about).
- **Module augmentations added** (what they cover — `TLGlobalShapePropsMap`, `TLGlobalBindingPropsMap`, `@tiptap/core` chain commands, etc.).
- **Deprecations migrated** (count and the symbols).
- **Anything flagged as undocumented** — symbols you couldn't find in any migration block, gaps in the changelog, or recipes that didn't match the actual API surface. These are worth filing back to the svelte-draw team.
- **Anything skipped or deferred** — if you punted on a hard rename or left a `TODO`, say so explicitly so the user knows what's still on them.

## Quality checks

- **Type safety is paramount.** The goal is a migration that is as type-safe as the original code. Do NOT add `as any`, `as unknown`, or broad type casts. Do NOT add `@ts-ignore` or `@ts-expect-error`. These are never acceptable — if you can't make the types work, you don't understand the new API yet. Stop and read the changelog and type definitions before continuing.
- **Prefer TypeScript's narrowing features over casts.** Use `as const` for literal types, `satisfies` for type-checking without widening, generic parameters for call sites, and module augmentation for extending interfaces. These are the right tools for a migration — `as` casts are not.
- **Use parallel agents for large batches with the same pattern.** Apply the recipe to one file by hand first to confirm it works, then spawn one Agent per remaining file in a single message (multiple Agent tool calls in parallel). Pass each agent: (1) the path of the file to migrate, (2) the before/after diff from your template file, (3) the relevant migration block from `svelte-draw-releases.txt`. This is most useful in 4a (mechanical `TLBaseShape` → `TLGlobalShapePropsMap` migration across many shape files) and 4b (one symbol rename rippling across the project).
- **Don't just make errors go away — understand the new API.** When a method signature changes (e.g., new parameters added, property renamed to a richer type), read the changelog AND the current type definitions to understand _why_ it changed. A fix that compiles but passes hardcoded/dummy values where the new API expects real data is worse than a type error — it silently degrades behavior. For example, if a function gains new required parameters, check what shape props or editor state should feed those parameters rather than passing `0` or `1`.
- **When unsure about an API pattern**, grep the full docs (`${SKILL_DIR}/references/svelte-draw-full-docs.txt`) for usage examples of that specific API. The docs contain code samples that show the canonical way to use each API.

## Tips

- Read `${SKILL_DIR}/references/svelte-draw-releases.txt` for the filtered changelog — this is the primary source for what changed
- Grep `${SKILL_DIR}/references/svelte-draw-full-docs.txt` when you need docs on a specific API
- When searching svelte-draw types, try multiple paths — the dist directory structure varies by version and package manager
