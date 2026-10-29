import {
	defineMessages,
	translateMessage,
	type Editor,
	type TLI18nMessage,
	type TLI18nValues,
} from '@svelte-draw/editor'

export const errorMessages = defineMessages({
	confirmResetTitle: { id: 'error.confirm-reset.title', defaultMessage: 'Are you sure?' },
	confirmResetDescription: {
		id: 'error.confirm-reset.description',
		defaultMessage: 'Resetting your data will delete your drawing and cannot be undone.',
	},
	cancel: { id: 'error.cancel', defaultMessage: 'Cancel' },
	resetData: { id: 'error.reset-data', defaultMessage: 'Reset data' },
	title: { id: 'error.title', defaultMessage: 'Something went wrong' },
	refreshHint: { id: 'error.refresh-hint', defaultMessage: 'Please refresh your browser.' },
	resetHint: {
		id: 'error.reset-hint',
		defaultMessage:
			'If the issue continues after refreshing, you may need to reset the svelte-draw data stored on your device.',
	},
	noteLabel: { id: 'error.note-label', defaultMessage: 'Note:' },
	resetNote: {
		id: 'error.reset-note',
		defaultMessage: 'Resetting will erase your current project and any unsaved work.',
	},
	messageLabel: { id: 'error.message-label', defaultMessage: 'Message:' },
	stackTraceLabel: { id: 'error.stack-trace-label', defaultMessage: 'Stack trace:' },
	copy: { id: 'error.copy', defaultMessage: 'Copy' },
	copied: { id: 'error.copied', defaultMessage: 'Copied!' },
	showDetails: { id: 'error.show-details', defaultMessage: 'Show details' },
	hideDetails: { id: 'error.hide-details', defaultMessage: 'Hide details' },
	refreshPage: { id: 'error.refresh-page', defaultMessage: 'Refresh page' },
})

/**
 * Returns a translator for the error screen. This renders because something already threw, so
 * reading the editor is done defensively: English beats a second crash on the error screen.
 * Replaces the `useErrorMsg` hook.
 *
 * @internal
 */
export function createErrorMsg(getEditor: () => Editor | undefined) {
	return (message: TLI18nMessage, values?: TLI18nValues) => {
		try {
			return translateMessage(getEditor()?.i18n(), message, values)
		} catch {
			return message.defaultMessage
		}
	}
}
