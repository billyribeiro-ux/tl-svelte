<script lang="ts">
	import { ROOM_PREFIX } from '@svelte-draw/dotcom-shared'
	import { getDialogs } from 'svelte-draw'
	import { getAuth } from '../../../../utils/clerk.svelte'
	import { location } from '../../../../utils/router.svelte'
	import LegacyChangesModal from './LegacyChangesModal.svelte'

	const { addDialog, removeDialog } = getDialogs()
	const auth = getAuth()

	// isSignedIn stays a dependency so signing in re-shows the dialog with its copy button.
	$effect(() => {
		void auth.current.isSignedIn
		if (!location.pathname.startsWith(`/${ROOM_PREFIX}/`)) return

		const id = addDialog({
			component: LegacyChangesModal,
			preventBackgroundClose: true,
		})
		return () => {
			removeDialog(id)
		}
	})
</script>
