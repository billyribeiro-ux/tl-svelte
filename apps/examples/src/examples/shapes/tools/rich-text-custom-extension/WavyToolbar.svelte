<script lang="ts">
	import {
		DefaultRichTextToolbar,
		DefaultRichTextToolbarContent,
		SvelteDrawUiButton,
		fromComputed,
		getEditor,
		preventDefault,
	} from 'svelte-draw'
	import './Wavy'

	const editor = getEditor()
	const textEditor = fromComputed('textEditor', () => editor.getRichTextEditor())

	// [3]
	let updateCount = $state(0)
	$effect(() => {
		const current = textEditor.current
		if (!current) return
		const handleUpdate = () => updateCount++
		current.on('transaction', handleUpdate)
		return () => {
			current.off('transaction', handleUpdate)
		}
	})

	const isWavyActive = $derived.by(() => {
		void updateCount
		return textEditor.current?.isActive('wavy') ?? false
	})
</script>

{#if textEditor.current}
	{@const currentTextEditor = textEditor.current}
	<DefaultRichTextToolbar>
		<SvelteDrawUiButton
			type="icon"
			title="Toggle wavy underline"
			onclick={() => {
				currentTextEditor.chain().focus().toggleWavy().run()
			}}
			isActive={isWavyActive}
			onpointerdown={preventDefault}
		>
			〰️
		</SvelteDrawUiButton>
		<DefaultRichTextToolbarContent textEditor={currentTextEditor} />
	</DefaultRichTextToolbar>
{/if}
