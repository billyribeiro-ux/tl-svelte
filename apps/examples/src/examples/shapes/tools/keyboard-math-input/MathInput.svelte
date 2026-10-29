<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { nativeEvents } from '../../nativeEvents'

	// A plain text input for math shorthand, shown in place of the rendered
	// equation while the shape is being edited. A floating bubble above the shape
	// previews the rendered equation live as you type (see MathShape.svelte).
	let {
		text,
		onChange,
		onDone,
	}: { text: string; onChange(text: string): void; onDone(): void } = $props()

	const editor = getEditor()

	let ref = $state<HTMLInputElement | null>(null)

	$effect(() => {
		ref?.focus()
		ref?.select()
	})

	// Pointer events on the input must not reach the canvas, or svelte-draw
	// would select and drag the shape instead of placing the caret. Native listeners, because
	// Svelte's delegated handlers would run after the editor's own.
	const markHandled = (e: Event) => editor.markEventAsHandled(e)
	const events = nativeEvents({ pointerdown: markHandled, touchstart: markHandled })
</script>

<input
	bind:this={ref}
	class="math-input"
	value={text}
	spellcheck={false}
	placeholder="1/2 + sqrt(2) or x^2"
	oninput={(e) => onChange(e.currentTarget.value)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === 'Escape') {
			e.preventDefault()
			onDone()
		}
	}}
	{@attach events}
/>
