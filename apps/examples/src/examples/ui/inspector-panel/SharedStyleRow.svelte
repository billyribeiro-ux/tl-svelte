<script lang="ts">
	import type { SharedStyle, StyleProp } from 'svelte-draw'
	import { formatValue } from './formatValue'

	// [2]
	let {
		styleProp,
		sharedStyle,
	}: {
		styleProp: StyleProp<unknown>
		sharedStyle: SharedStyle<unknown>
	} = $props()

	const isMixed = $derived(sharedStyle.type === 'mixed')
</script>

<div class="property-row">
	<span class="property-name">{styleProp.id.replace('svelte-draw:', '')}:</span>
	<span class={`property-value ${isMixed ? 'mixed-style' : 'shared-style'}`}>
		{sharedStyle.type === 'mixed' ? '(mixed)' : formatValue(sharedStyle.value)}
	</span>
</div>
