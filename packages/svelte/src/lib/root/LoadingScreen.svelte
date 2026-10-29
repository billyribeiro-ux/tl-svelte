<script lang="ts">
	import type { LoadingScreenProps } from './types'

	let { children }: LoadingScreenProps = $props()
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="tl-loading" aria-busy="true" tabindex="0">
	{@render children()}
</div>
