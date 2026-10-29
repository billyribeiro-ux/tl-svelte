<script lang="ts">
	import type { Snippet } from 'svelte'
	import TlaRootProviders from '../../../tla/providers/TlaRootProviders.svelte'

	let { children }: { children: Snippet } = $props()
</script>

<TlaRootProviders>
	{@render children()}
</TlaRootProviders>
