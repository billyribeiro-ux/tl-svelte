<script lang="ts">
	import { View } from '@svelte-draw/svelte'
	import { SvelteDrawUiButtonIcon, type ShapeView } from 'svelte-draw'

	// A style item's icon is either an icon id or a ShapeView (e.g. a custom font's "Aa" preview).
	// A view can't receive the class/size props a built-in icon gets, so it is boxed to the same
	// 18px dimensions, as the SDK's own style panel does.
	let { icon }: { icon: string | ShapeView } = $props()
</script>

{#if typeof icon === 'string'}
	<SvelteDrawUiButtonIcon {icon} />
{:else}
	<span
		class="tlui-button__icon"
		aria-hidden="true"
		style:display="inline-flex"
		style:flex-shrink="0"
		style:width="18px"
		style:height="18px"
	>
		<View view={icon} />
	</span>
{/if}
