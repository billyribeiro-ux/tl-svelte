<script lang="ts" module>
	import type { TLStyleIconView } from '../../../styles'

	/** @internal */
	export interface StylePanelIconProps {
		icon: string | TLStyleIconView
		small?: boolean
		invertIcon?: boolean
	}
</script>

<script lang="ts">
	import { View } from '@svelte-draw/svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'

	let { icon, small, invertIcon }: StylePanelIconProps = $props()
</script>

{#if typeof icon === 'string'}
	<SvelteDrawUiButtonIcon {icon} {small} {invertIcon} />
{:else}
	<!--
		A custom icon is a ShapeView, which cannot receive the class/size props React's cloned element
		did, so it is boxed to the same dimensions as a built-in icon (18px, 15px when small).
	-->
	<span
		class="tlui-button__icon"
		aria-hidden="true"
		style:display="inline-flex"
		style:flex-shrink="0"
		style:width={small ? '15px' : '18px'}
		style:height={small ? '15px' : '18px'}
		style:transform={invertIcon ? 'scale(-1, 1)' : undefined}
	>
		<View view={icon} />
	</span>
{/if}
