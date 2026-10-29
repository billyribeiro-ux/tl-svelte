<script lang="ts">
	import {
		DefaultRichTextToolbar,
		DefaultRichTextToolbarContent,
		fromComputed,
		getEditor,
	} from 'svelte-draw'
	import { nativeEvents } from '../../nativeEvents'

	const fontOptions = [
		{ label: 'Default', value: 'DEFAULT' },
		{ label: 'Inter', value: 'Inter' },
		{ label: 'Comic Sans MS', value: 'Comic Sans MS' },
		{ label: 'serif', value: 'serif' },
		{ label: 'monospace', value: 'monospace' },
		{ label: 'cursive', value: 'cursive' },
		{ label: 'Exo 2 (Google Font)', value: "'Exo 2'" },
	]
	
	const fontSizeOptions = [
		{ label: 'Small', value: '12px' },
		{ label: 'Normal', value: '16px' },
		{ label: 'Large', value: '20px' },
		{ label: 'X-Large', value: '24px' },
		{ label: 'XX-Large', value: '28px' },
		{ label: 'Huge', value: '32px' },
	]

	const editor = getEditor()
	const textEditor = fromComputed('textEditor', () => editor.getRichTextEditor())

	// [2]
	let updateCount = $state(0)
	$effect(() => {
		const current = textEditor.current
		if (!current) return
		const handleTransaction = () => updateCount++
		current.on('transaction', handleTransaction)
		return () => {
			current.off('transaction', handleTransaction)
		}
	})

	const currentFontFamily = $derived.by(() => {
		void updateCount
		return textEditor.current?.getAttributes('textStyle').fontFamily ?? 'DEFAULT'
	})
	const currentFontSize = $derived.by(() => {
		void updateCount
		return textEditor.current?.getAttributes('textStyle').fontSize ?? '16px'
	})

	// [3] Native listener: the editor's own pointer handling would otherwise see the click first.
	const markHandled = nativeEvents({ pointerdown: (e) => editor.markEventAsHandled(e) })
</script>

{#if textEditor.current}
	{@const currentTextEditor = textEditor.current}
	<DefaultRichTextToolbar>
		<select
			class="rich-text-font-extension-select"
			value={currentFontFamily}
			{@attach markHandled}
			onchange={(e) => {
				currentTextEditor.chain().focus().setFontFamily(e.currentTarget.value).run()
			}}
		>
			{#each fontOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<select
			class="rich-text-font-extension-select"
			value={currentFontSize}
			{@attach markHandled}
			onchange={(e) => {
				currentTextEditor.chain().focus().setFontSize(e.currentTarget.value).run()
			}}
		>
			{#each fontSizeOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<DefaultRichTextToolbarContent textEditor={currentTextEditor} />
	</DefaultRichTextToolbar>
{/if}
