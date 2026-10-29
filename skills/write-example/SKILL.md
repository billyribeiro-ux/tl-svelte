---
name: write-example
description: Writing examples for the svelte-draw SDK examples app. Use when creating new examples, adding SDK demonstrations, or writing example code in apps/examples.
---

# Writing svelte-draw examples

The examples project (`apps/examples`) contains minimal demonstrations of how to use the svelte-draw SDK. Examples are embedded on the docs site and deployed to examples.svelte-draw.invalid.

Standards for examples in `apps/examples/src/examples`.

## Example structure

Each example lives in its own folder:

```
apps/examples/src/examples/
└── my-example/
    ├── README.md          # Required metadata
    ├── MyExampleExample.svelte  # Main example file
    └── my-example.css     # Optional styles
```

## Folder name

- Lowercase kebab-case: `custom-canvas`, `button-demo`, `magical-wand`
- Used as the URL path for the example

## README.md

Required frontmatter format:

```md
---
title: Example title
component: ./ExampleFile.svelte
priority: 1
keywords: [keyword1, keyword2]
---

One-line summary of what this example demonstrates.

---

Detailed explanation of the example. Include code snippets here if they help explain concepts not obvious from the example code itself.
```

### Frontmatter fields

| Field     | Description                                      |
| --------- | ------------------------------------------------ |
| title     | Sentence case, corresponds to folder name        |
| component | Relative path to example file                    |
| priority  | Display order within category (lower = higher)   |
| keywords  | Search terms (avoid obvious terms like "svelte-draw") |

### Categories

The category is derived from the folder path (`examples/<category>/<slug>/README.md`), not from frontmatter. Valid categories:

`getting-started`, `configuration`, `editor-api`, `ui`, `layout`, `events`, `shapes/tools`, `users`, `collaboration`, `data/assets`, `use-cases` (the list in `apps/examples/src/lib/examples.ts`). Nested ids create nested folders, e.g. `examples/shapes/tools/<slug>`.

## Example file

### Naming

- PascalCase ending with "Example": `CustomCanvasExample.svelte`, `ButtonExample.svelte`
- Name should correspond to the folder name and title

### Structure

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw />
</div>
```

**Requirements:**

- Must be a Svelte 5 component (`.svelte`) with a default export, referenced by the README's `component` frontmatter
- Use `svelte-draw__editor` class for full-page examples
- Import `svelte-draw/svelte-draw.css` for styles

### Layout

- Full page: wrap in `<div class="svelte-draw__editor">`
- Inset: see existing examples for page layout patterns

## Styles

- Put CSS in a separate file named after the example: `my-example.css`
- Import alongside svelte-draw CSS: `import './my-example.css'`
- Avoid extensive inline styles via the `style` attribute

## Control panels

For examples that need buttons or controls, use the `TopPanel` component slot with `SvelteDrawUiButton`. The panel is its own `.svelte` file and reads the editor with `getEditor()`:

```svelte
<!-- MyControls.svelte -->
<script lang="ts">
	import { getEditor, SvelteDrawUiButton } from 'svelte-draw'

	const editor = getEditor()
</script>

<div class="tlui-menu my-controls">
	<SvelteDrawUiButton type="normal" onclick={() => editor.zoomIn()}>Zoom in</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={() => editor.zoomOut()}>Zoom out</SvelteDrawUiButton>
</div>
```

```svelte
<!-- MyExampleExample.svelte -->
<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './my-example.css'
	import MyControls from './MyControls.svelte'

	const components: TLComponents = { TopPanel: MyControls }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
```

CSS for control panels:

```css
.my-controls {
	display: flex;
	flex-wrap: wrap;
	margin: 8px;
}
```

## Comments

Use footnote format with numbered references: numbered markers in the code, and the notes in an HTML comment at the bottom of the file (see `apps/examples/src/examples/editor-api/align-and-distribute-shapes/`).

```svelte
<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// [1]
	const components: TLComponents = {
		PageMenu: null,
	}
</script>

<div class="svelte-draw__editor">
	<!-- [2] -->
	<SvelteDraw {components} />
</div>

<!--
[1]
Define component overrides once, in the instance script or at module level, so the component
identities stay stable.

[2]
Pass component overrides via the components prop.
-->
```

## Example types

### Tight examples

- Narrow focus on a specific SDK feature
- Minimal styling
- Meant to be read, not used
- Remove any extraneous code

### Use-case examples

- Show a recognizable user experience
- Prioritize clarity and completeness
- Category: `use-cases`

## Additional files

- Split complex code into separate files if it distracts from the example's purpose
- Example: complex input component in `Input.svelte`
- Keep the main example file focused on demonstrating the concept

## Important

- Follow Svelte 5 (runes) and TypeScript best practices
- Never use title case for titles - use sentence case
- Keep examples minimal and focused
