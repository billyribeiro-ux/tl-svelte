<script lang="ts">
	import { EffectScheduler, getEditor, throttleToNextFrame } from 'svelte-draw'
	import {
		getLocalSessionStateUnsafe,
		updateLocalSessionState,
	} from '../../../utils/local-session-state'

	const editor = getEditor()

	// Throttled to the next animation frame, like the `useReactor` this replaces.
	$effect(() => {
		let cancelFn: (() => void) | undefined
		const scheduler = new EffectScheduler(
			'dark mode sync',
			() => {
				const appIsDark = getLocalSessionStateUnsafe()!.theme === 'dark'
				const editorIsDark = editor.user.getIsDarkMode()

				if (appIsDark && !editorIsDark) {
					updateLocalSessionState(() => ({ theme: 'light' }))
				} else if (!appIsDark && editorIsDark) {
					updateLocalSessionState(() => ({ theme: 'dark' }))
				}
			},
			{
				scheduleEffect: (cb) => {
					cancelFn = throttleToNextFrame(cb)
				},
			}
		)
		scheduler.attach()
		scheduler.execute()
		return () => {
			scheduler.detach()
			cancelFn?.()
		}
	})
</script>
