<script lang="ts">
	import { DefaultShapeWrapper, type TLShapeWrapperProps } from 'svelte-draw'

	let { children, shape, isBackground, ref = $bindable(null) }: TLShapeWrapperProps = $props()

	const changeType = $derived(shape.meta.changeType)
</script>

<DefaultShapeWrapper
	bind:ref
	{shape}
	{isBackground}
	class={changeType ? 'diff-shape-' + changeType : undefined}
>
	{@render children()}
</DefaultShapeWrapper>
