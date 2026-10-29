<script lang="ts">
	import { getEditorComponents } from './componentsContext'

	const components = getEditorComponents()
</script>

<!-- The loading screen is focusable on purpose (carried over from the React version) so keyboard
	focus has somewhere to land while the editor loads. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="tl-loading" aria-busy="true" tabindex={0}>
	{#if components.Spinner}
		{@const Spinner = components.Spinner}
		<Spinner />
	{/if}
</div>
