<script lang="ts">
	import type { TLShapeErrorFallbackProps } from 'svelte-draw'

	let { error }: TLShapeErrorFallbackProps = $props()
</script>

<div>Shape error! {String(error)}</div>
