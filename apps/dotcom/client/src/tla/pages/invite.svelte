<script lang="ts">
	import { setInSessionStorage } from 'svelte-draw'
	import { routes } from '../../routeDefs'
	import { navigate, params } from '../../utils/router.svelte'
	import { WORKSPACE_INVITE_QUERY_PARAM } from '../components/WorkspaceInviteHandler.svelte'
	import { SESSION_STORAGE_KEYS } from '../utils/session-storage'

	const token = $derived(params.token)

	// Store the token once per token, not once per render: a render-phase write
	// can re-create the token after WorkspaceInviteHandler has consumed it (the
	// handler runs on every navigation commit while this route is unmounting),
	// which double-fetches the invite and stacks two join dialogs.
	$effect.pre(() => {
		// Written before the navigation below so the handler finds it.
		if (token) {
			setInSessionStorage(SESSION_STORAGE_KEYS.WORKSPACE_INVITE_TOKEN, token)
		}
	})

	// The invite route resolves to the normal root experience: the anonymous
	// editor when signed out, your most recent file when signed in. The
	// root-level WorkspaceInviteHandler picks the token up from session
	// storage and shows the relevant invite dialog on top. The query param
	// marks this arrival as coming from an invite link.
	$effect(() => {
		navigate(`${routes.tlaRoot()}?${WORKSPACE_INVITE_QUERY_PARAM}=true`, { replace: true })
	})
</script>
