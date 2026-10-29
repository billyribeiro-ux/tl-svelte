<!--
	The SDK takes an icon as a `TLUiIconJsx` snippet (the replacement for a React element passed as
	an icon). A snippet declared at the top level of a component can be exported from its module
	script, so node definitions (plain `.ts` files) can reference these.
-->
<script lang="ts" module>
	import AddIcon from './AddIcon.svelte'
	import ConditionalIcon from './ConditionalIcon.svelte'
	import DivideIcon from './DivideIcon.svelte'
	import EarthquakeIcon from './EarthquakeIcon.svelte'
	import MultiplyIcon from './MultiplyIcon.svelte'
	import SliderIcon from './SliderIcon.svelte'
	import SubtractIcon from './SubtractIcon.svelte'

	export {
		addIcon,
		conditionalIcon,
		divideIcon,
		earthquakeIcon,
		multiplyIcon,
		sliderIcon,
		subtractIcon,
	}
</script>

{#snippet addIcon({ props }: { props: Record<string, unknown> })}
	<AddIcon {...props} />
{/snippet}
{#snippet conditionalIcon({ props }: { props: Record<string, unknown> })}
	<ConditionalIcon {...props} />
{/snippet}
{#snippet divideIcon({ props }: { props: Record<string, unknown> })}
	<DivideIcon {...props} />
{/snippet}
{#snippet earthquakeIcon({ props }: { props: Record<string, unknown> })}
	<EarthquakeIcon {...props} />
{/snippet}
{#snippet multiplyIcon({ props }: { props: Record<string, unknown> })}
	<MultiplyIcon {...props} />
{/snippet}
{#snippet sliderIcon({ props }: { props: Record<string, unknown> })}
	<SliderIcon {...props} />
{/snippet}
{#snippet subtractIcon({ props }: { props: Record<string, unknown> })}
	<SubtractIcon {...props} />
{/snippet}
