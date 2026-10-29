<script lang="ts">
	import { DefaultStylePanel, SvelteDrawUiButton } from 'svelte-draw'
	import { EXAMPLES } from './examples'
	import { selectedExample } from './selectedExample.svelte'

	const example = $derived(EXAMPLES.find((e) => e.value === selectedExample.current))
	const ConfigComponent = $derived(example?.ConfigPanel)
</script>

<div style="display: flex; flex-direction: row">
	{#if ConfigComponent}
		<ConfigComponent />
	{/if}
	<div class="tlui-menu shader-app__example-menu">
		{#each EXAMPLES as option (option.value)}
			<SvelteDrawUiButton
				type="menu"
				onclick={() => selectedExample.select(option.value)}
				isActive={selectedExample.current === option.value}
			>
				{option.label}
			</SvelteDrawUiButton>
		{/each}
	</div>
	<DefaultStylePanel />
</div>
