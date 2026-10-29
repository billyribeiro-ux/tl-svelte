<svelte:options namespace="svg" />

<script lang="ts">
	import { Vec, type TLImageShape } from '@svelte-draw/editor'
	import { createUniqueSafeId } from '@svelte-draw/svelte'
	import { styleToString } from '../shared/styleToString'
	import { getCroppedContainerStyle, getFlipStyle } from './imageHelpers'

	let { shape, src }: { shape: TLImageShape; src: string } = $props()

	const cropClipId = createUniqueSafeId()

	const containerStyle = $derived(getCroppedContainerStyle(shape))
	const crop = $derived(shape.props.crop)
	const cropped = $derived.by(() => {
		const style = containerStyle
		if (!('transform' in style) || !style.transform || !crop) return null
		const { transform: cropTransform, width, height } = style
		const croppedWidth = (crop.bottomRight.x - crop.topLeft.x) * width
		const croppedHeight = (crop.bottomRight.y - crop.topLeft.y) * height

		const points = [
			new Vec(0, 0),
			new Vec(croppedWidth, 0),
			new Vec(croppedWidth, croppedHeight),
			new Vec(0, croppedHeight),
		]

		const flip = getFlipStyle(shape, { width, height })
		return {
			width,
			height,
			croppedWidth,
			croppedHeight,
			points: points.map((p) => `${p.x},${p.y}`).join(' '),
			style: styleToString(flip ? { ...flip } : { transform: cropTransform }) || undefined,
		}
	})
</script>

{#if cropped && crop}
	<defs>
		<clipPath id={cropClipId}>
			{#if crop.isCircle}
				<ellipse
					cx={cropped.croppedWidth / 2}
					cy={cropped.croppedHeight / 2}
					rx={cropped.croppedWidth / 2}
					ry={cropped.croppedHeight / 2}
				/>
			{:else}
				<polygon points={cropped.points} />
			{/if}
		</clipPath>
	</defs>
	<g clip-path={`url(#${cropClipId})`}>
		<image
			href={src}
			width={cropped.width}
			height={cropped.height}
			aria-label={shape.props.altText}
			style={cropped.style}
		/>
	</g>
{:else}
	<image
		href={src}
		width={shape.props.w}
		height={shape.props.h}
		aria-label={shape.props.altText}
		style={styleToString(getFlipStyle(shape, { width: shape.props.w, height: shape.props.h })) || undefined}
	/>
{/if}
