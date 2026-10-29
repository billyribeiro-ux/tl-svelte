<script lang="ts">
	import { commentToolOverrides } from '@svelte-draw/commenting'
	import { untrack } from 'svelte'
	import { getDialogs, omit, react, type TLUiOverrides } from 'svelte-draw'
	import LocalEditor from '../../components/LocalEditor.svelte'
	import { getClerk } from '../../utils/clerk.svelte'
	import { globalEditor } from '../../utils/globalEditor'
	import { location, navigate } from '../../utils/router.svelte'
	import TlaSignInDialog from '../components/dialogs/TlaSignInDialog.svelte'
	import TlaAnonDotDevLink from '../components/TlaAnonDotDevLink/TlaAnonDotDevLink.svelte'
	import { getAnonCommentToolOverrides } from '../components/TlaEditor/CommentsOnCanvas.svelte'
	import SneakyDarkModeSync from '../components/TlaEditor/sneaky/SneakyDarkModeSync.svelte'
	import SneakyDebugModeToast from '../components/TlaEditor/sneaky/SneakyDebugModeToast.svelte'
	import { components } from '../components/TlaEditor/TlaEditor.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import { clearRedirectOnSignIn, OPEN_SIGN_IN } from '../utils/redirect'
	import { clearShouldSlurpFile, setShouldSlurpFile } from '../utils/slurping'

	// Opens the sign-in dialog when the location state asks for it (`openSignIn`).
	const dialogs = getDialogs()
	const clerk = getClerk()
	$effect(() => {
		void location.href
		const state = location.state
		if (!state?.[OPEN_SIGN_IN]) return
		untrack(() => {
			navigate('.', { replace: true, state: omit(state, [OPEN_SIGN_IN]) })
			dialogs.addDialog({
				component: TlaSignInDialog,
				// Dismissed without signing in: a redirect left behind would hijack a later sign-in.
				onClose: () => {
					if (!clerk.isSignedIn) clearRedirectOnSignIn()
				},
			})
		})
	})

	// No comments exist on the scratch board — the button is only a sign-in prompt, so the tool
	// itself stays unregistered and the anon override repoints its item at the sign-in dialog.
	const anonCommentToolOverrides = getAnonCommentToolOverrides()
	const commentToolItemOverrides = $derived<TLUiOverrides[]>([
		commentToolOverrides,
		anonCommentToolOverrides.current,
	])
</script>

<TlaAnonLayout>
	<LocalEditor
		data-testid="tla-editor"
		{components}
		overrides={commentToolItemOverrides}
		onMount={(editor) => {
			globalEditor.set(editor)
			const shapes$ = editor.store.query.ids('shape')

			return react('updateShouldSlurpFile', () => {
				if (shapes$.get().size > 0) {
					setShouldSlurpFile()
				} else {
					clearShouldSlurpFile()
				}
			})
		}}
		options={{ actionShortcutsLocation: 'toolbar' }}
	>
		<SneakyDarkModeSync />
		<SneakyDebugModeToast />
		<TlaAnonDotDevLink />
	</LocalEditor>
</TlaAnonLayout>
