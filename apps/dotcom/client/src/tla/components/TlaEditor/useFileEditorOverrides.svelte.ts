import {
	downloadFile,
	getTranslation,
	serializeSvelteDrawJsonBlob,
	SVELTE_DRAW_FILE_EXTENSION,
	type Editor,
	type TLUiOverrides,
} from 'svelte-draw'
import { routes } from '../../../routeDefs'
import { getHandleUiEvents } from '../../../utils/analytics'
import { getIntl } from '../../../utils/intl'
import { navigate } from '../../../utils/router.svelte'
import type { SvelteDrawApp } from '../../app/SvelteDrawApp'
import { getMaybeApp } from '../../hooks/useAppState.svelte'
import { editorMessages as messages } from './editor-messages'
import { getRoomInfo } from './useRoomInfo.svelte'

/** Triggers a GET to the app file download endpoint; browser shows download immediately with progress. */
export function downloadAppFile(fileId: string) {
	const url = `/api/app/file/${fileId}/download`
	const a = document.createElement('a')
	a.href = url
	// meaningful file name is set by Content-Disposition header
	a.download = ''
	a.click()
}

export async function downloadFileFromEditor(editor: Editor, name: string) {
	const blobToSave = await serializeSvelteDrawJsonBlob(editor)
	const file = new File([blobToSave], name, { type: 'application/json' })
	downloadFile(file)
}

/** The app file record's name when there is one, else the document's, else the untitled fallback
 *  (rather than the date the sidebar would show). `||` not `??`: getFileName returns '' for a file
 *  the app doesn't know yet (first visit to a shared link), which must fall through to the
 *  document name like the top-left panel does. */
export function getEditorFileName(
	app: SvelteDrawApp | null,
	fileSlug: string | undefined,
	editor: Editor | null,
	untitled: string
) {
	return (
		(fileSlug ? app?.getFileName(fileSlug, false)?.trim() : null) ||
		editor?.getDocumentSettings().name ||
		untitled
	)
}

/**
 * Was `useFileEditorOverrides({ fileSlug })`. Call during component initialisation. `opts` is read
 * lazily, so pass an object with a getter for a `fileSlug` that can change.
 */
export function getFileEditorOverrides(opts: { fileSlug?: string }): {
	readonly current: TLUiOverrides
} {
	const msg = getTranslation()
	const app = getMaybeApp()
	const intl = getIntl()
	const trackEvent = getHandleUiEvents()
	// Built from the route params rather than the raw pathname: a trailing slash (`/r/abc/`, which
	// the router still matches) would otherwise produce a createSource the room can never resolve.
	const roomInfo = getRoomInfo()

	const overrides = $derived.by((): TLUiOverrides => {
		const currentApp = app.current
		const fileSlug = opts.fileSlug
		const untitledProject = msg(messages.untitledProject)
		const room = roomInfo.current
		const copySource = room ? `${room.prefix}/${room.id}` : null
		const { formatMessage } = intl.current

		return {
			translations: {
				en: {
					'people-menu.anonymous-user': formatMessage(messages.anonymousUser),
				},
			},
			actions(editor, actions) {
				// Add a shortcut that does nothing but blocks the command+s shortcut
				actions['save-null'] = {
					id: 'save-null',
					label: 'action.save-copy',
					readonlyOk: true,
					kbd: 'cmd+s,ctrl+s',
					onSelect() {
						trackEvent('save-project-no-action', { source: 'kbd' })
					},
				}
				actions['save-file-copy'] = {
					id: 'save-file-copy',
					label: formatMessage(messages.downloadFile),
					readonlyOk: true,
					async onSelect() {
						trackEvent('download-file', { source: '' })
						if (currentApp && fileSlug) {
							downloadAppFile(fileSlug)
						} else {
							const defaultName =
								getEditorFileName(currentApp, fileSlug, editor, untitledProject) +
								SVELTE_DRAW_FILE_EXTENSION
							await downloadFileFromEditor(editor, defaultName)
						}
					},
				}

				actions['copy-to-my-files'] = {
					id: 'copy-to-my-files',
					label: formatMessage(messages.copyToMyfiles),
					readonlyOk: true,
					async onSelect() {
						if (!copySource) return
						const defaultName = getEditorFileName(currentApp, fileSlug, editor, untitledProject)
						const res = await currentApp?.createFile({
							name: defaultName,
							createSource: copySource,
						})
						if (res?.ok) {
							const { fileId } = res.value
							navigate(routes.tlaFile(fileId))
							trackEvent('create-file', { source: 'legacy-import-button' })
						}
					},
				}

				return actions
			},
		}
	})

	return {
		get current() {
			return overrides
		},
	}
}
