<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		toolRichTextOrderedList: { id: 'tool.rich-text-orderedList', defaultMessage: 'Ordered list' },
		a11yEnterLeaveContainer: {
			id: 'a11y.enter-leave-container',
			defaultMessage: 'Enter/leave container',
		},
		a11yMoveShape: { id: 'a11y.move-shape', defaultMessage: 'Move shape' },
		a11yMoveShapeFaster: { id: 'a11y.move-shape-faster', defaultMessage: 'Move shape faster' },
		a11yOpenContextMenu: { id: 'a11y.open-context-menu', defaultMessage: 'Context menu…' },
		a11yOpenKeyboardShortcuts: {
			id: 'a11y.open-keyboard-shortcuts',
			defaultMessage: 'Keyboard shortcuts',
		},
		a11yPanCamera: { id: 'a11y.pan-camera', defaultMessage: 'Pan camera' },
		a11yRotateShapeCcw: {
			id: 'a11y.rotate-shape-ccw',
			defaultMessage: 'Rotate shape counterclockwise',
		},
		a11yRotateShapeCcwFine: {
			id: 'a11y.rotate-shape-ccw-fine',
			defaultMessage: 'Rotate shape counterclockwise (fine)',
		},
		a11yRotateShapeCw: { id: 'a11y.rotate-shape-cw', defaultMessage: 'Rotate shape clockwise' },
		a11yRotateShapeCwFine: {
			id: 'a11y.rotate-shape-cw-fine',
			defaultMessage: 'Rotate shape clockwise (fine)',
		},
		a11ySelectShape: { id: 'a11y.select-shape', defaultMessage: 'Select next shape' },
		a11ySelectShapeDirection: {
			id: 'a11y.select-shape-direction',
			defaultMessage: 'Select shape in direction',
		},
		actionZoomQuick: { id: 'action.zoom-quick', defaultMessage: 'Quick zoom' },
		shortcutsDialogA11y: { id: 'shortcuts-dialog.a11y', defaultMessage: 'Accessibility' },
		shortcutsDialogCollaboration: {
			id: 'shortcuts-dialog.collaboration',
			defaultMessage: 'Collaboration',
		},
		shortcutsDialogEdit: { id: 'shortcuts-dialog.edit', defaultMessage: 'Edit' },
		shortcutsDialogPreferences: { id: 'shortcuts-dialog.preferences', defaultMessage: 'Preferences' },
		shortcutsDialogTextFormatting: {
			id: 'shortcuts-dialog.text-formatting',
			defaultMessage: 'Text formatting',
		},
		shortcutsDialogTools: { id: 'shortcuts-dialog.tools', defaultMessage: 'Tools' },
		shortcutsDialogTransform: { id: 'shortcuts-dialog.transform', defaultMessage: 'Transform' },
		shortcutsDialogView: { id: 'shortcuts-dialog.view', defaultMessage: 'View' },
		toolPointerDown: { id: 'tool.pointer-down', defaultMessage: 'Pointer down' },
		toolRichTextHeader: { id: 'tool.rich-text-header', defaultMessage: 'Header' },
		toolRichTextStrikethrough: {
			id: 'tool.rich-text-strikethrough',
			defaultMessage: 'Strikethrough',
		},
	})
</script>

<script lang="ts">
	import { noop } from '@svelte-draw/editor'
	import { getShowCollaborationUi } from '../../hooks/useCollaborationStatus'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'
	import SvelteDrawUiMenuToolItem from '../primitives/menus/SvelteDrawUiMenuToolItem.svelte'

	// The shortcut rows name actions from all over the UI, so only the ids nothing else declares
	// are declared here — a second copy of an English string is a second thing to keep in step.
	// `label` is data the menu primitives translate, so these reference the id rather than being `<F>`.

	const showCollaborationUi = getShowCollaborationUi()
</script>

<SvelteDrawUiMenuGroup label={messages.shortcutsDialogTools.id} id="tools">
	<SvelteDrawUiMenuActionItem actionId="toggle-tool-lock" />
	<SvelteDrawUiMenuActionItem actionId="insert-media" />
	<SvelteDrawUiMenuActionItem actionId="insert-embed" />
	<SvelteDrawUiMenuToolItem toolId="select" />
	<SvelteDrawUiMenuToolItem toolId="draw" />
	<SvelteDrawUiMenuToolItem toolId="highlight" />
	<SvelteDrawUiMenuToolItem toolId="eraser" />
	<SvelteDrawUiMenuToolItem toolId="hand" />
	<SvelteDrawUiMenuToolItem toolId="rectangle" />
	<SvelteDrawUiMenuToolItem toolId="ellipse" />
	<SvelteDrawUiMenuToolItem toolId="arrow" />
	<SvelteDrawUiMenuToolItem toolId="line" />
	<SvelteDrawUiMenuToolItem toolId="text" />
	<SvelteDrawUiMenuToolItem toolId="frame" />
	<SvelteDrawUiMenuToolItem toolId="note" />
	<SvelteDrawUiMenuToolItem toolId="laser" />
	<SvelteDrawUiMenuItem
		id="pointer-down"
		label={messages.toolPointerDown.id}
		kbd=","
		onSelect={noop}
	/>
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogPreferences.id} id="preferences">
	<SvelteDrawUiMenuActionItem actionId="toggle-dark-mode" />
	<SvelteDrawUiMenuActionItem actionId="toggle-focus-mode" />
	<SvelteDrawUiMenuActionItem actionId="toggle-grid" />
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogEdit.id} id="edit">
	<SvelteDrawUiMenuActionItem actionId="undo" />
	<SvelteDrawUiMenuActionItem actionId="redo" />
	<SvelteDrawUiMenuActionItem actionId="cut" />
	<SvelteDrawUiMenuActionItem actionId="copy" />
	<SvelteDrawUiMenuActionItem actionId="copy-as-png" />
	<SvelteDrawUiMenuActionItem actionId="copy-hovered-styles" />
	<SvelteDrawUiMenuActionItem actionId="paste" />
	<SvelteDrawUiMenuActionItem actionId="select-all" />
	<SvelteDrawUiMenuActionItem actionId="delete" />
	<SvelteDrawUiMenuActionItem actionId="duplicate" />
	<SvelteDrawUiMenuActionItem actionId="print" />
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogView.id} id="view">
	<SvelteDrawUiMenuActionItem actionId="select-zoom-tool" />
	<SvelteDrawUiMenuActionItem actionId="zoom-in" />
	<SvelteDrawUiMenuActionItem actionId="zoom-out" />
	<SvelteDrawUiMenuActionItem actionId="zoom-to-100" />
	<SvelteDrawUiMenuActionItem actionId="zoom-to-fit" />
	<SvelteDrawUiMenuActionItem actionId="zoom-to-selection" />
	<SvelteDrawUiMenuItem
		id="zoom-quick"
		label={messages.actionZoomQuick.id}
		kbd="shift+z"
		onSelect={noop}
	/>
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogTransform.id} id="transform">
	<SvelteDrawUiMenuActionItem actionId="bring-to-front" />
	<SvelteDrawUiMenuActionItem actionId="bring-forward" />
	<SvelteDrawUiMenuActionItem actionId="send-backward" />
	<SvelteDrawUiMenuActionItem actionId="send-to-back" />
	<SvelteDrawUiMenuActionItem actionId="toggle-group" />
	<SvelteDrawUiMenuActionItem actionId="ungroup" />
	<SvelteDrawUiMenuActionItem actionId="toggle-frame" />
	<SvelteDrawUiMenuActionItem actionId="remove-frame" />
	<SvelteDrawUiMenuActionItem actionId="flatten-to-image" />
	<SvelteDrawUiMenuActionItem actionId="toggle-lock" />
	<SvelteDrawUiMenuActionItem actionId="flip-horizontal" />
	<SvelteDrawUiMenuActionItem actionId="flip-vertical" />
	<SvelteDrawUiMenuActionItem actionId="align-top" />
	<SvelteDrawUiMenuActionItem actionId="align-center-vertical" />
	<SvelteDrawUiMenuActionItem actionId="align-bottom" />
	<SvelteDrawUiMenuActionItem actionId="align-left" />
	<SvelteDrawUiMenuActionItem actionId="align-center-horizontal" />
	<SvelteDrawUiMenuActionItem actionId="align-right" />
	<SvelteDrawUiMenuActionItem actionId="distribute-horizontal" />
	<SvelteDrawUiMenuActionItem actionId="distribute-vertical" />
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogTextFormatting.id} id="text">
	<SvelteDrawUiMenuItem id="text-bold" label="tool.rich-text-bold" kbd="cmd+b" onSelect={noop} />
	<SvelteDrawUiMenuItem
		id="text-italic"
		label="tool.rich-text-italic"
		kbd="cmd+i"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem id="text-code" label="tool.rich-text-code" kbd="cmd+e" onSelect={noop} />
	<SvelteDrawUiMenuItem
		id="text-highlight"
		label="tool.rich-text-highlight"
		kbd="cmd+shift+h"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="text-strikethrough"
		label={messages.toolRichTextStrikethrough.id}
		kbd="cmd+shift+s"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="text-link"
		label="tool.rich-text-link"
		kbd="cmd+shift+k"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="text-header"
		label={messages.toolRichTextHeader.id}
		kbd="cmd+alt+[[1-6]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="text-orderedList"
		label={messages.toolRichTextOrderedList.id}
		kbd="cmd+shift+7"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="text-bulletedlist"
		label="tool.rich-text-bulletList"
		kbd="cmd+shift+8"
		onSelect={noop}
	/>
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup label={messages.shortcutsDialogA11y.id} id="a11y">
	<SvelteDrawUiMenuItem
		id="a11y-select-next-shape"
		label={messages.a11ySelectShape.id}
		kbd="[[Tab]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-select-next-shape-direction"
		label={messages.a11ySelectShapeDirection.id}
		kbd="cmd+[[↑→↓←]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-select-next-shape-container"
		label={messages.a11yEnterLeaveContainer.id}
		kbd="cmd+shift+[[↑↓]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-pan-camera"
		label={messages.a11yPanCamera.id}
		kbd="[[Space]]+[[↑→↓←]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="adjust-shape-styles"
		label="a11y.adjust-shape-styles"
		kbd="cmd+[[Enter]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="open-context-menu"
		label={messages.a11yOpenContextMenu.id}
		kbd="cmd+shift+[[Enter]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-move-shape"
		label={messages.a11yMoveShape.id}
		kbd="[[↑→↓←]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-move-shape-faster"
		label={messages.a11yMoveShapeFaster.id}
		kbd="shift+[[↑→↓←]]"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-rotate-shape-cw"
		label={messages.a11yRotateShapeCw.id}
		kbd="shift+﹥"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-rotate-shape-cw-fine"
		label={messages.a11yRotateShapeCwFine.id}
		kbd="shift+alt+﹥"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-rotate-shape-ccw"
		label={messages.a11yRotateShapeCcw.id}
		kbd="shift+﹤"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuItem
		id="a11y-rotate-shape-ccw-fine"
		label={messages.a11yRotateShapeCcwFine.id}
		kbd="shift+alt+﹤"
		onSelect={noop}
	/>
	<SvelteDrawUiMenuActionItem actionId="enlarge-shapes" />
	<SvelteDrawUiMenuActionItem actionId="shrink-shapes" />
	<SvelteDrawUiMenuActionItem actionId="a11y-repeat-shape-announce" />
	<SvelteDrawUiMenuItem
		id="a11y-open-keyboard-shortcuts"
		label={messages.a11yOpenKeyboardShortcuts.id}
		kbd="cmd+alt+/"
		onSelect={noop}
	/>
</SvelteDrawUiMenuGroup>
{#if showCollaborationUi}
	<SvelteDrawUiMenuGroup label={messages.shortcutsDialogCollaboration.id} id="collaboration">
		<SvelteDrawUiMenuActionItem actionId="open-cursor-chat" />
	</SvelteDrawUiMenuGroup>
{/if}

