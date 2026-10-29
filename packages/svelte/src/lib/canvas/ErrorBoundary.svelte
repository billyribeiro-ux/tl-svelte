<script lang="ts">
	import type { TLErrorBoundaryProps } from './types'

	let { children, onError, fallback }: TLErrorBoundaryProps = $props()
</script>

<svelte:boundary onerror={(error) => onError?.(error)}>
	{@render children()}
	{#snippet failed(error)}
		{@const Fallback = fallback}
		<Fallback {error} />
	{/snippet}
</svelte:boundary>
