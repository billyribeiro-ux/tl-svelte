<script lang="ts">
	import { setCurrentTranslation, type TLUiTranslationContextType } from '../useTranslation.svelte'

	// Provides a translation context directly (no provider, no fetch), then runs `run` during
	// component initialisation, the way a component calling `getTranslation()` would.
	let {
		translation = null,
		run,
	}: { translation?: TLUiTranslationContextType | null; run: () => void } = $props()

	// svelte-ignore state_referenced_locally
	if (translation) setCurrentTranslation(translation)
	// svelte-ignore state_referenced_locally
	run()
</script>
