<script lang="ts">
	import {
		DefaultRichTextToolbar,
		DefaultRichTextToolbarContent,
		SvelteDrawUiButton,
		fromComputed,
		getEditor,
		preventDefault,
	} from 'svelte-draw'
	import './Outline'

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

	const isOutlineActive = $derived.by(() => {
		void updateCount
		return textEditor.current?.isActive('outline') ?? false
	})
</script>

{#if textEditor.current}
	{@const currentTextEditor = textEditor.current}
	<DefaultRichTextToolbar>
		<SvelteDrawUiButton
			type="icon"
			title="Toggle text outline"
			onclick={() => {
				currentTextEditor.chain().focus().toggleOutline().run()
			}}
			isActive={isOutlineActive}
			onpointerdown={preventDefault}
		>
			⬜
		</SvelteDrawUiButton>
		<DefaultRichTextToolbarContent textEditor={currentTextEditor} />
	</DefaultRichTextToolbar>
{/if}
