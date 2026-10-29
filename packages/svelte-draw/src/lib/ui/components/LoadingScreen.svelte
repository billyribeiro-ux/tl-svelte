<script lang="ts">
	import { getEditorComponents, LoadingScreen as LoadingScreenContainer } from '@svelte-draw/svelte'

	/** @public */
	const components = getEditorComponents()
	// Read through the object (not destructured) so a changed `Spinner` override is followed.
	const Spinner = $derived(components.Spinner)
</script>

<LoadingScreenContainer>
	{#if Spinner}
		<Spinner />
	{/if}
</LoadingScreenContainer>
