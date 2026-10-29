import { defineMessages } from '@svelte-draw/editor'

export const messages = defineMessages({
	contextMenuArrange: { id: 'context-menu.arrange', defaultMessage: 'Arrange' },
	contextMenuCopyAs: { id: 'context-menu.copy-as', defaultMessage: 'Copy as' },
	contextMenuEdit: { id: 'context-menu.edit', defaultMessage: 'Edit' },
	contextMenuExportAs: { id: 'context-menu.export-as', defaultMessage: 'Export as' },
	contextMenuMoveToPage: { id: 'context-menu.move-to-page', defaultMessage: 'Move to page' },
	movedToPageAction: { id: 'toast.moved-to-page.action', defaultMessage: 'Go back' },
	movedToPageDesc: { id: 'toast.moved-to-page.desc', defaultMessage: 'Moved to {page}.' },
	movedToPageTitle: { id: 'toast.moved-to-page.title', defaultMessage: 'Changed page' },
})

export const COPY_AS_ACTIONS = ['copy-as-svg', 'copy-as-png', 'copy-as-json']

/** @internal */
export const EDIT_ACTIONS = [
	'group',
	'ungroup',
	'flatten-to-image',
	'frame-selection',
	'edit-link',
	'fit-frame-to-content',
	'remove-frame',
	'convert-to-embed',
	'convert-to-bookmark',
	'toggle-auto-size',
	'toggle-lock',
]

export const ARRANGE_GROUPS: { id: string; actionIds: string[] }[] = [
	{
		id: 'align',
		actionIds: [
			'align-left',
			'align-center-horizontal',
			'align-right',
			'align-top',
			'align-center-vertical',
			'align-bottom',
		],
	},
	{ id: 'distribute', actionIds: ['distribute-horizontal', 'distribute-vertical'] },
	{ id: 'stretch', actionIds: ['stretch-horizontal', 'stretch-vertical'] },
	{ id: 'flip', actionIds: ['flip-horizontal', 'flip-vertical'] },
	{ id: 'order', actionIds: ['pack', 'stack-horizontal', 'stack-vertical'] },
]

/** @internal */
export const ARRANGE_ACTIONS = ARRANGE_GROUPS.flatMap((group) => group.actionIds)

/** @internal */
export const REORDER_ACTIONS = ['bring-to-front', 'bring-forward', 'send-backward', 'send-to-back']
