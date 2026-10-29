import { assert, defineMessages, type TLShapeId } from '@svelte-draw/editor'
import { tryGetEditor } from '@svelte-draw/svelte'
import { copyAs, type TLCopyType } from '../../utils/export/copyAs'
import { getToasts, getTranslation } from '../context'

const messages = defineMessages({
	toastErrorCopyFailDesc: {
		id: 'toast.error.copy-fail.desc',
		defaultMessage: 'Failed to copy image',
	},
	toastErrorCopyFailTitle: { id: 'toast.error.copy-fail.title', defaultMessage: 'Failed copy' },
})

/**
 * Returns a function that copies the given shapes to the clipboard as `format`. Call during
 * component initialisation. Replaces `useCopyAs`.
 *
 * @public
 */
export function getCopyAs() {
	const editor = tryGetEditor()
	const toasts = getToasts()
	const msg = getTranslation()

	return (ids: TLShapeId[], format: TLCopyType = 'svg') => {
		assert(editor, 'getCopyAs: editor is required')
		copyAs(editor, ids, { format }).catch(() => {
			toasts.addToast({
				id: 'copy-fail',
				severity: 'warning',
				title: msg(messages.toastErrorCopyFailTitle),
				description: msg(messages.toastErrorCopyFailDesc),
			})
		})
	}
}
