<svelte:options namespace="svg" />

<script lang="ts">
	import type { TLVideoShape } from '@svelte-draw/editor'

	let { shape, src }: { shape: TLVideoShape; src: string } = $props()
</script>

<image href={src} width={shape.props.w} height={shape.props.h} aria-label={shape.props.altText} />
