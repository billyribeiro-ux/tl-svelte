<script lang="ts">
	import ErrorBoundary from './ErrorBoundary.svelte'
	import type { TLErrorBoundaryProps } from './types'

	/** @internal */
	let {
		children,
		fallback,
		onError,
	}: Omit<TLErrorBoundaryProps, 'fallback'> & { fallback: TLErrorBoundaryProps['fallback'] | null } =
		$props()
</script>

{#if fallback === null}
	{@render children()}
{:else}
	<ErrorBoundary {fallback} {onError}>
		{@render children()}
	</ErrorBoundary>
{/if}
