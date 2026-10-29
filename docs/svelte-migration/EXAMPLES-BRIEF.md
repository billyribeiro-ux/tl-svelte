# Examples app porting brief (read after AGENT-BRIEF.md)

`apps/examples` is becoming a SvelteKit 3.1 SPA. Tooling is already in place: `package.json`, `vite.config.ts`
(SvelteKit plugin + adapter-static fallback + the `exampleReadmePlugin`), `tsconfig.json`, `src/app.html`,
`src/routes/+layout.ts` (`ssr = false`), `static/` (was `public/`). `pnpm exec svelte-kit sync` works.

## Example contract (every example folder)

Each example lives in `apps/examples/src/examples/<category>/<slug>/` with a `README.md` whose frontmatter has
`component: ./Something.tsx`. The Vite `exampleReadmePlugin` turns the README into a module with `meta`,
`loadComponent()` (dynamic `import(frontmatter.component)`) and `loadContent()`. Therefore, for each example:

1. Port `Something.tsx` (and any sibling `.tsx` / hooks) to `Something.svelte` (default export, optional `roomId`
   prop for multiplayer examples: `let { roomId }: { roomId?: string } = $props()`).
2. Change the README frontmatter to `component: ./Something.svelte`. Keep the README body unchanged, except
   code snippets that show the React source: replace them with the equivalent Svelte source.
3. `git rm` the `.tsx` files you replaced. Keep slugs, titles, priorities and keywords exactly as they are:
   the routes (`/<slug>` and `/<slug>/full`) and the Playwright specs depend on them.
4. Every example renders the SDK like the original did: `import { SvelteDraw } from 'svelte-draw'` is now a Svelte
   default-export component: `import SvelteDraw from ...` is re-exported by the package as a named export, so use
   `import { SvelteDraw } from 'svelte-draw'` unchanged and pass props / `components` overrides / children as
   snippets. CSS imports (`import 'svelte-draw/svelte-draw.css'`) are unchanged. Custom shapes / tools / bindings
   define their `component()` with `shapeView(Component, props)`.
5. React-only libraries: `react-router-dom` -> SvelteKit routing (`$app/state`, `goto`), `react-helmet-async` ->
   `<svelte:head>`, `ag-grid-react` -> `ag-grid-community` `createGrid` in an attachment, `radix-ui` -> `bits-ui`,
   `@tiptap/react` -> `@tiptap/core`. Anything with no workable framework-agnostic equivalent: do not stub it;
   report it as a named gap.

## Gates (from `apps/examples`)

```
pnpm exec svelte-kit sync
pnpm exec svelte-check --tsconfig ./tsconfig.json --threshold error --output machine 2>&1 | grep ' ERROR ' | grep '<your path regex>'
```

Errors that are only "cannot find module" for packages not yet ported (`@svelte-draw/commenting`,
`@svelte-draw/mermaid`) or for the app shell (another agent) are acceptable: list them under "depends on".
You cannot run the Playwright suite yet (the app shell is being built); read the specs under `e2e/tests` that touch
your examples and keep every selector, route and `window` global they use working.
