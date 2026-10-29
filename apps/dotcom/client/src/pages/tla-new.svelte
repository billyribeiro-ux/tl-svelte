<script lang="ts">
	import { routes } from '../routeDefs'
	import { getMaybeApp } from '../tla/hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../tla/utils/app-ui-events'
	import { navigate } from '../utils/router.svelte'

	const app = getMaybeApp()
	const trackEvent = getSvelteDrawAppUiEvents()

	$effect(() => {
		const currentApp = app.current
		// A user who leaves /new before the mutation settles must not be yanked to the new file.
		let cancelled = false
		const createFile = async () => {
			if (!currentApp) {
				navigate(routes.tlaRoot(), { replace: true })
				return
			}
			const res = await currentApp.createFile()
			if (cancelled) return
			if (res.ok) {
				const { fileId } = res.value
				navigate(routes.tlaFile(fileId), { replace: true })
				trackEvent('create-file', { source: 'new-page' })
			} else {
				navigate(routes.tlaRoot(), { replace: true })
			}
		}
		createFile()
		return () => {
			cancelled = true
		}
	})
</script>
