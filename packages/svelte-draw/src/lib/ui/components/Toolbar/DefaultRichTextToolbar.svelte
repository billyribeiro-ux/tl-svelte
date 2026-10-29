<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiRichTextToolbarProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import DefaultRichTextToolbarInner from './DefaultRichTextToolbarInner.svelte'

	/**
	 * The default rich text toolbar.
	 *
	 * @public
	 */
	let { children }: TLUiRichTextToolbarProps = $props()

	const editor = getEditor()

	const textEditor = fromComputed('textEditor', () => editor.getRichTextEditor())
	const isCoarsePointer = fromComputed('isCoarsePointer', () => editor.getInstanceState().isCoarsePointer)
</script>

{#if !isCoarsePointer.current && textEditor.current}
	<DefaultRichTextToolbarInner textEditor={textEditor.current} {children} />
{/if}
