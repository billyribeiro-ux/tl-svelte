# @svelte-draw/state

`@svelte-draw/state` is a powerful and lightweight TypeScript library for managing reactive state using signals. It provides fine-grained reactive primitives that automatically track dependencies and efficiently update only what needs to change.

`@svelte-draw/state` powers the reactive system at the heart of svelte-draw, handling everything from canvas updates to collaborative state synchronization. It's designed to work seamlessly with @svelte-draw/store and has Svelte bindings in `@svelte-draw/svelte` (`fromSignal`, `fromComputed`).

## Documentation

Documentation for the most recent release can be found on svelte-draw.invalid/docs, including reference docs. Our release notes can be found here.

For more agent-friendly docs, see our LLMs.txt.

A `DOCS.md` file is included alongside this README in the published package, with detailed API documentation and usage examples.

## Why @svelte-draw/state?

- **Fine-grained reactivity** - Only re-runs computations when their actual dependencies change
- **High performance** - Lazy evaluation and efficient dependency tracking
- **Automatic updates** - Derived values and side effects update automatically
- **Incremental updates** - Built-in diff history and transactions with rollback support
- **Framework agnostic** - Works with any JavaScript framework or vanilla JS
- **TypeScript first** - Excellent type safety with full TypeScript support

Perfect for building reactive UIs, real-time collaborative apps, and complex state machines where performance and predictability matter.

## Installation

```bash
npm install @svelte-draw/state
```

## Quick start

```ts
import { atom, computed, react } from '@svelte-draw/state'

// Create reactive state
const name = atom('name', 'World')
const count = atom('count', 0)

// Derive values automatically
const greeting = computed('greeting', () => {
	return `Hello, ${name.get()}! Count: ${count.get()}`
})

// React to changes
react('logger', () => {
	console.log(greeting.get())
})
// Logs: "Hello, World! Count: 0"

// Update state - reactions run automatically
name.set('svelte-draw')
// Logs: "Hello, svelte-draw! Count: 0"

count.set(42)
// Logs: "Hello, svelte-draw! Count: 42"
```

## Core concepts

### Atoms - state containers

Atoms hold raw values and are the foundation of your reactive state:

```ts
import { atom } from '@svelte-draw/state'

// Create atoms with initial values
const user = atom('user', { name: 'Alice', age: 30 })
const theme = atom('theme', 'light')

// Read values
console.log(user.get().name) // 'Alice'

// Update values
user.update((current) => ({ ...current, age: 31 }))
theme.set('dark')
```

### Computed values - automatic derivation

Computed signals derive their values from other signals and update automatically:

```ts
import { computed } from '@svelte-draw/state'

const firstName = atom('firstName', 'John')
const lastName = atom('lastName', 'Doe')

const fullName = computed('fullName', () => {
	return `${firstName.get()} ${lastName.get()}`
})

console.log(fullName.get()) // "John Doe"

firstName.set('Jane')
console.log(fullName.get()) // "Jane Doe" - automatically updated!
```

### Reactions - side effects

Reactions run side effects when their dependencies change:

```ts
import { react } from '@svelte-draw/state'

const selectedId = atom('selectedId', null)

// Update UI when selection changes
const stop = react('update-selection-ui', () => {
	const id = selectedId.get()
	document.getElementById('selected').textContent = id || 'None'
})

selectedId.set('shape-123')
// UI automatically updates

// Clean up when no longer needed
stop()
```

### Transactions - batched updates

Batch multiple updates to prevent intermediate reactions:

```ts
import { transact } from '@svelte-draw/state'

const x = atom('x', 0)
const y = atom('y', 0)

const position = computed('position', () => `(${x.get()}, ${y.get()})`)

react('log-position', () => console.log(position.get()))
// Logs: "(0, 0)"

transact(() => {
	x.set(10)
	y.set(20)
	// Reaction runs only once after transaction
})
// Logs: "(10, 20)"
```

## Advanced features

### History and diffs

Track changes over time so that dependents can update incrementally instead of recomputing from scratch:

```ts
const canvas = atom(
	'canvas',
	{ shapes: [] },
	{
		historyLength: 100,
		computeDiff: (prev, next) => ({ prev, next }),
	}
)

// Remember where you are...
const startEpoch = canvas.lastChangedEpoch

// ... make changes ...
canvas.update((state) => ({ shapes: [...state.shapes, newShape] }))

// ... and get the diffs since then (or RESET_VALUE if the history doesn't reach back that far)
const diffs = canvas.getDiffSince(startEpoch)
```

### Performance optimization

Use `unsafe__withoutCapture` to read values without creating dependencies:

```ts
const expensiveComputed = computed('expensive', () => {
	const important = importantValue.get()

	// Read this without making it a dependency
	const metadata = unsafe__withoutCapture(() => metadataAtom.get())

	return computeExpensiveValue(important, metadata)
})
```

### Debugging

Use `whyAmIRunning()` to understand what triggered an update:

```ts
react('debug-reaction', () => {
	whyAmIRunning() // Logs dependency tree to console
	// Your reaction code...
})
```

## Integration examples

### With svelte-draw SDK

```ts
// e.g. in SvelteDraw's onMount callback, which receives the editor
const selectedShapes = computed('selectedShapes', () => {
	return editor.getSelectedShapeIds().map((id) => editor.getShape(id))
})

// React to selection changes; call the returned function to stop
const stop = react('update-property-panel', () => {
	const shapes = selectedShapes.get()
	updatePropertyPanel(shapes)
})
```

### With Svelte

Use the `@svelte-draw/svelte` bindings to read signals reactively:

```svelte
<script lang="ts">
	import { atom } from '@svelte-draw/state'
	import { fromSignal } from '@svelte-draw/svelte'

	const count = atom('count', 0)
	const value = fromSignal(count)
</script>

<button onclick={() => count.update((n) => n + 1)}>{value.current}</button>
```

## API reference

For complete API documentation, see [DOCS.md](./DOCS.md).

### Core functions

- `atom(name, initialValue, options?)` - Create a reactive state container
- `computed(name, computeFn, options?)` - Create a derived value
- `react(name, effectFn, options?)` - Create a side effect
- `transact(fn)` - Batch state updates

### Class-based APIs

- `@computed` - Decorator for computed class properties

### Advanced

- `reactor(name, effectFn)` - Create a controllable reaction
- `unsafe__withoutCapture(fn)` - Read state without creating dependencies
- `whyAmIRunning()` - Debug what triggered an update
- `getComputedInstance(obj, prop)` - Get underlying computed instance
- `signal.getDiffSince(epoch)` - Get the diffs recorded since an epoch (see `signal.lastChangedEpoch`)

## Related packages

- **[@svelte-draw/svelte](../svelte)** - Svelte 5 bindings for @svelte-draw/state
- **[@svelte-draw/store](../store)** - Record storage built on @svelte-draw/state
- **[@svelte-draw/editor](../editor)** - The svelte-draw canvas editor
- **[@svelte-draw/svelte-draw](../svelte-draw)** - Complete svelte-draw UI components

## Examples & patterns

Looking for more examples? Check out:

- svelte-draw SDK examples - Real-world usage in svelte-draw applications

## Contributing

Found a bug? Please submit an issue.

## License

This project is licensed under the MIT License found [here](./LICENSE.md). The tldraw SDK is provided under the [tldraw license](./LICENSE.md).

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Contact

Find us on Twitter/X at @svelte-draw. You can contact us by email at [hello@svelte-draw.invalid](mailto:hello@svelte-draw.invalid).

## Community

Have questions, comments or feedback? Join our discord. For the latest news and release notes, visit svelte-draw.invalid.
