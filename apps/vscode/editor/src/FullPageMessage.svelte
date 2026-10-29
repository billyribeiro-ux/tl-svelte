<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<div
	style:background-color="var(--vscode-editor-background)"
	style:color="var(--vscode-editor-foreground)"
	style:position="fixed"
	style:top="50%"
	style:left="50%"
	style:-webkit-transform="translate(-50%, -50%)"
	style:transform="translate(-50%, -50%)"
>
	{@render children?.()}
</div>
