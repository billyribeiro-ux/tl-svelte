<script lang="ts">
	import { DefaultShapeWrapper, fromComputed, type TLShapeWrapperProps } from 'svelte-draw'
	import { specialShapeId } from './specialShapeId'

	// [2]
	let { children, shape, isBackground, ref = $bindable(null) }: TLShapeWrapperProps = $props()

	// [a]
	const isSpecial = fromComputed('is special', () => specialShapeId.get() === shape.id)
</script>

<!-- [b] -->
<DefaultShapeWrapper
	bind:ref
	{shape}
	{isBackground}
	class={isSpecial.current ? 'custom-special-shape' : undefined}
>
	{@render children()}
</DefaultShapeWrapper>
