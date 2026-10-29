import { assert, defineMessages, type TLExportType, type TLShapeId } from '@svelte-draw/editor'
import { tryGetEditor } from '@svelte-draw/svelte'
import { exportAs } from '../../utils/export/exportAs'
import { getToasts, getTranslation } from '../context'

const messages = defineMessages({
	toastErrorExportFailDesc: {
		id: 'toast.error.export-fail.desc',
		defaultMessage: 'Failed to export image',
	},
	toastErrorExportFailTitle: {
		id: 'toast.error.export-fail.title',
		defaultMessage: 'Failed export',
	},
})

/**
 * Returns a function that exports the given shapes as an image file. Call during component
 * initialisation. Replaces `useExportAs`.
 *
 * @public
 */
export function getExportAs() {
	const editor = tryGetEditor()
	const toasts = getToasts()
	const msg = getTranslation()

	return (
		ids: TLShapeId[],
		opts: { format?: TLExportType; name?: string; scale?: number } = {}
	) => {
		assert(editor, 'getExportAs: editor is required')
		const { format = 'png', name, scale = 1 } = opts
		exportAs(editor, ids, {
			format,
			name,
			scale,
		}).catch((e) => {
			console.error(e.message)
			toasts.addToast({
				id: 'export-fail',
				title: msg(messages.toastErrorExportFailTitle),
				description: msg(messages.toastErrorExportFailDesc),
				severity: 'error',
			})
		})
	}
}
