<script lang="ts" module>
	import type { TiptapEditor } from '@svelte-draw/editor'

	/** The standalone TipTap editor the panel's toolbar content is built against. Tests only. */
	export const richTextPanel: { textEditor: TiptapEditor | null } = { textEditor: null }
</script>

<script lang="ts">
	/**
	 * A `TopPanel` override that renders the rich text toolbar content directly, since the real
	 * toolbar only mounts for a non-collapsed selection, which jsdom can't lay out. Tests only.
	 */
	import DefaultRichTextToolbarContent from '../../lib/ui/components/Toolbar/DefaultRichTextToolbarContent.svelte'
	import SvelteDrawUiToolbar from '../../lib/ui/components/primitives/SvelteDrawUiToolbar.svelte'
</script>

<SvelteDrawUiToolbar label="Rich text">
	<DefaultRichTextToolbarContent textEditor={richTextPanel.textEditor!} />
</SvelteDrawUiToolbar>
