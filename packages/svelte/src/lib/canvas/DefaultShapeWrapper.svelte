<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import type { TLShapeWrapperProps } from '../context/components'

	/**
	 * Renders exactly ONE root element and binds it to `ref`: the canvas positions each shape by
	 * writing to `ref.style` (see `Shape.svelte`).
	 */
	let {
		children,
		shape,
		isBackground,
		ref = $bindable(null),
		class: className,
		...props
	}: TLShapeWrapperProps & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> = $props()

	const isFilledShape = $derived('fill' in shape.props && shape.props.fill !== 'none')
</script>

<div
	bind:this={ref}
	data-shape-type={shape.type}
	data-shape-is-filled={isBackground ? undefined : isFilledShape}
	data-shape-id={shape.id}
	draggable={false}
	{...props}
	class={['tl-shape', isBackground && 'tl-shape-background', className]}
>
	{@render children()}
</div>
