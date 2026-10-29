<script lang="ts" module>
	/** The errors the editor's `ErrorFallback` slot received. Tests only. */
	export const fallbackErrors: unknown[] = []
</script>

<script lang="ts">
	/**
	 * An `ErrorFallback` that records its error, to detect errors the default fallback would
	 * silently absorb. Tests only.
	 */
	import type { TLErrorFallbackProps } from '@svelte-draw/svelte'

	let { error }: TLErrorFallbackProps = $props()
	// svelte-ignore state_referenced_locally
	fallbackErrors.push(error)
</script>

<div data-testid="test-error-fallback"></div>
