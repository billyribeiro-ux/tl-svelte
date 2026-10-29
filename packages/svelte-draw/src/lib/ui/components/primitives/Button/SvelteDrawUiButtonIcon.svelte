<script lang="ts" module>
	import type { TLUiIconJsx } from '../SvelteDrawUiIcon.svelte'

	/** @public */
	export interface TLUiButtonIconProps {
		icon: string | TLUiIconJsx
		small?: boolean
		invertIcon?: boolean
	}
</script>

<script lang="ts">
	import SvelteDrawUiIcon from '../SvelteDrawUiIcon.svelte'

	let { icon, small, invertIcon }: TLUiButtonIconProps = $props()
</script>

<SvelteDrawUiIcon aria-hidden="true" label="" class="tlui-button__icon" {icon} {small} {invertIcon} />
