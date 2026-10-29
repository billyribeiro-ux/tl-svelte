<script lang="ts">
	import type { ShapeView } from '@svelte-draw/editor'
	import { SVGContainer, View } from '@svelte-draw/svelte'

	let { view }: { view: ShapeView | null } = $props()
</script>

<SVGContainer style="min-width: 50px; min-height: 50px">
	<View {view} />
</SVGContainer>
