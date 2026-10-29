<script lang="ts">
	import type { LoadingScreenProps } from './types'

	let { children }: LoadingScreenProps = $props()
</script>

<div class="tl-loading">
	{@render children()}
</div>
