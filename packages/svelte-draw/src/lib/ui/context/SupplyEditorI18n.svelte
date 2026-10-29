<script lang="ts">
	import { tryGetEditorI18nFallback } from '@svelte-draw/svelte'
	import { getSvelteDrawI18n } from './i18n'

	// Hands the editor this UI's translations when its host passed none — a `<SvelteDrawEditor>` and
	// `<SvelteDrawUi>` composed by hand. See `EditorI18nFallbackContext`.
	const slot = tryGetEditorI18nFallback()
	const i18n = getSvelteDrawI18n()

	$effect.pre(() => {
		if (!slot) return
		slot.current = i18n
		return () => {
			if (slot.current === i18n) slot.current = null
		}
	})
</script>
