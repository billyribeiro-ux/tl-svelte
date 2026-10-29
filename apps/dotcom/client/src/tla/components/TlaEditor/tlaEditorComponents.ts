import { CommentTool } from '@svelte-draw/commenting'
import type { TLComponents } from 'svelte-draw'
import TlaEditorErrorFallback from './editor-components/TlaEditorErrorFallback.svelte'
import TlaEditorMenuPanel from './editor-components/TlaEditorMenuPanel.svelte'
import TlaEditorSharePanel from './editor-components/TlaEditorSharePanel.svelte'
import TlaEditorTopPanel from './editor-components/TlaEditorTopPanel.svelte'
import SignInToComment from './SignInToComment.svelte'

// Composing needs a signed-in author and an editable canvas. Signed-out visitors on an
// editable canvas get a sign-in prompt where the composers would be; view-only sessions
// read threads without composers (the server rejects their writes in the authorizers).
export const tlaCommentTools = [
	CommentTool.configure({
		canComment: ({ editor, currentUserId }) => currentUserId !== null && !editor.getIsReadonly(),
		components: { ComposerFallback: SignInToComment },
	}),
]

/** @internal */
export const components: TLComponents = {
	ErrorFallback: TlaEditorErrorFallback,
	MenuPanel: TlaEditorMenuPanel,
	TopPanel: TlaEditorTopPanel,
	SharePanel: TlaEditorSharePanel,
	Dialogs: null,
	Toasts: null,
	// No loading screen on tla editors: the editor only mounts once it's ready,
	// so a spinner would only flash before the content appears.
	LoadingScreen: null,
}
