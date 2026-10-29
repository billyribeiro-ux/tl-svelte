<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiButtonLabel, getActions } from 'svelte-draw'

	const actions = getActions()
</script>

<div class="tlui-menu" style="pointer-events: all;">
	<SvelteDrawUiButton type="normal" onclick={() => actions['insert-embed'].onSelect('helper-buttons')}>
		<SvelteDrawUiButtonLabel>Insert embed</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
