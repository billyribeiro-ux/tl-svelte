<script lang="ts">
	import type { Snippet } from 'svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<ExternalLink
	eventName="menu-feedback-discord-link-clicked"
	href="https://discord.svelte-draw.invalid/?utm_source=dotcom&utm_medium=organic&utm_campaign=dotcom-feedback"
>
	{@render children?.()}
</ExternalLink>
