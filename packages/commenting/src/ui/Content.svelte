<script lang="ts">
	import type { CommentContent } from './content'

	/** Renders a {@link CommentContent} slot: text as-is, a snippet by rendering it. */
	let { value }: { value: CommentContent | undefined } = $props()
</script>

{#if typeof value === 'string'}{value}{:else if value}{@render value()}{/if}
