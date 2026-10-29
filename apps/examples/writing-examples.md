# Writing a good example

This document is meant to instruct people (and bots) on how to write a good example for svelte-draw's examples application.

## Introduction

The examples project (`apps/examples`) is meant to 1) provide a clean development environment for features in svelte-draw, 2) provide minimal demonstrations of how to use the svelte-draw SDK. It is made up of many small examples.

### Development

When you run `pnpm dev` from the repository root, this project is what is run and hosted at [localhost:5420](http://localhost:5420).

### Deployment and hosting

When we release a new version of the SDK, this project is deployed to [examples.svelte-draw.invalid](htts://examples.svelte-draw.invalid) and individual examples are iframed into pages on our docs site's examples section. We deploy this project as preview branches each pull request (along with svelte-draw.invalid and other projects, if modified). We also deploy [examples-canary.svelte-draw.invalid](htts://examples-canary.svelte-draw.invalid) whenever changes land in the `main` branch.

## What is an example?

Each example in this project is located in its own folder under `apps/examples/src/examples/<category>`.

For categories that include a slash (for example `shapes/tools` or `data/assets`), create nested folders:
`apps/examples/src/examples/shapes/tools/<example-slug>`.

### Folder name

The final folder name (the example slug) is used as the url for the example and should be in lowercase kebab
case (e.g. something-like-this).

### README.md

Each example requires a `README.md` file. The file should follow this format:

```md
---
title: Example
component: ./ExampleFile.svelte
priority: { priority }
keywords: { keywords }
---

{ One-line summary }

---

{ Detailed summary }
```

Here is a breakdown of the different properties:

| Property         | Description                                                                                                                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title            | The title of the example in sentence case. It should correspond (at least partly) with the file name chosen for the example's folder.                                                                                                                                                         |
| component        | The relative path to the example file.                                                                                                                                                                                                                                                        |
| priority         | A number that determines the display order of the example within its category. Category is derived from the folder path; valid category ids are: 'getting-started', 'configuration', 'editor-api', 'ui', 'layout', 'events', 'shapes/tools', 'users', 'collaboration', 'data/assets', and 'use-cases'. |
| keywords         | An array of keywords associated with this example. Avoid any obvious terms (like `svelte-draw`) and focus instead of terms that would help a user discover this example through search.                                                                                                            |
| One-line summary | A one line summary of the example.                                                                                                                                                                                                                                                            |
| detailed summary | A more detailed piece of text that accompanies the example. While the example itself should contain all of the relevant code, if there are snippets or other code examples that make sense to include, then they should be included here.                                                     |

### Example file

The example file is the file that contains the example's code.

The example file should be named something descriptive, that corresponds to the title of the example, and that ends with the word Example. `CustomCanvasExample.svelte`, `ButtonExample.svelte`, and `MagicalWandExample.svelte` are all good names.

This file **must** be a Svelte 5 component (`.svelte`) that looks something like this:

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw />
</div>
```

#### Layout

If the editor is meant to occupy the entire page, then use a `div` with the `svelte-draw__editor` class as shown above. The editor may also be inset within a regular page, see other examples for how this works.

#### Other styles

If the example requires other CSS, include that CSS in a file in the same folder and import it. The CSS file's name should correspond to the title of the example so that it can be easily searched for.

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './example.css'
</script>
```

Do not include extensive "inline styles" using the `style` attribute.

#### Control panels

For examples that need buttons or controls, use the `TopPanel` component slot with `SvelteDrawUiButton`:

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

The `tlui-menu` class provides default svelte-draw styling. The custom class handles layout.

#### Other files

While you should attempt to create small examples that do not require splitting code into other files, feel free to do so if the split-out code would be distracting from the content of the example. For example, if the example has a complex input, but the example isn't _about_ the input, then it may be better to place that code in an `Input.svelte` file and import it.

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import Input from './Input.svelte'
</script>
```

Follow Svelte 5 (runes) and TypeScript best practices when writing your examples.

#### Comments

Comments should be written using a "footnote" format. Inside of the code, write numbered notes that correspond to a list of notes at the bottom of the file. You should be writing good descriptive comments.

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
Define your component overrides once, in the instance script or at module level, so that component identities stay stable.

[2]
Pass your components overrides to the `components` prop.
-->
```

## Tight examples and use-case examples

There are two types of examples: **tight** examples that show a specific use of the svelte-draw SDK, and **use-case** examples that show some sliver of a user experience that involves the SDK. For example, a tight example might show how to toggle dark mode on and off programmatically, while a use-case example may show how to edit a PDF.

When writing a **tight** example, you should narrow the focus of the example as much as possible. Avoid styling unless absolutely necessary. These examples are meant to be _read_ rather than actually used. Any extraneous code may be mistaken for necessary code and so should either be removed or minimized.

When writing a **use-case** example, you can expand slightly in order to create something recognizable as a user experience. Prioritize clarity and completeness so that users who may be referencing or even copy-and-pasting code are able to clearly see which parts are important.
