<script lang="ts">
	import { untrack } from 'svelte'
	import { getDialogs } from 'svelte-draw'
	import TlaLegalAcceptance from '../components/dialogs/TlaLegalAcceptance.svelte'
	import { getUser } from '../../utils/clerk.svelte'
	import { getIsAppLoading } from '../hooks/useAppState.svelte'
	import { hasNotAcceptedLegal } from '../utils/auth'

	const clerkUser = getUser()
	const { addDialog } = getDialogs()
	// Accepting calls user.update and user.reload, which change the Clerk user identity, a dep of
	// AppStateProvider's bootstrap effect. Shown during the preload, accepting would abort and
	// restart the preload, so the dialog waits for the app.
	const isAppLoading = getIsAppLoading()

	const userId = $derived(clerkUser.current.user?.id)

	$effect(() => {
		void userId
		function maybeShowDialog() {
			// The latest user, not the one this effect captured.
			const currentUser = untrack(() => clerkUser.current.user)
			if (hasNotAcceptedLegal(currentUser)) {
				addDialog({
					component: TlaLegalAcceptance,
					// If the user closes the dialog and it's not accepted, show it again
					onClose: maybeShowDialog,
				})
			}
		}

		if (isAppLoading.current) return
		maybeShowDialog()
	})
</script>
