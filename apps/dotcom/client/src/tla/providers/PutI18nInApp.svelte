<script lang="ts">
	import { getSvelteDrawI18n } from 'svelte-draw'
	import { getMaybeApp } from '../hooks/useAppState.svelte'

	// The app outlives any component, so the adapter is handed to it rather than reached for. It is
	// assigned in the script body as well as in the pre-effect: the children's first render must
	// already find it there, and an app that arrives later gets it from the effect.
	const i18n = getSvelteDrawI18n()
	const app = getMaybeApp()

	function assign() {
		const current = app.current
		if (current) current.i18n = i18n
	}
	assign()
	$effect.pre(assign)

	// The locale is a signal the app's own consumers may be subscribed to; set it before paint.
	$effect.pre(() => {
		const locale = i18n().locale
		app.current?.locale$.set(locale)
	})
</script>
