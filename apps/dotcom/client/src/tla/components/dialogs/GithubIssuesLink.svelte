<script lang="ts">
	import type { Snippet } from 'svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<ExternalLink
	eventName="menu-feedback-github-link-clicked"
	href="https://github.com/billyribeiro-ux/tl-svelte/issues"
>
	{@render children?.()}
</ExternalLink>
