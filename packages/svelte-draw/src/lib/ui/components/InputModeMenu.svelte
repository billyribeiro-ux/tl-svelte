<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		actionToggleAutoNone: { id: 'action.toggle-auto-none', defaultMessage: 'Auto' },
		actionToggleAutoPan: { id: 'action.toggle-auto-pan', defaultMessage: 'Auto (trackpad)' },
		actionToggleAutoZoom: { id: 'action.toggle-auto-zoom', defaultMessage: 'Auto (mouse)' },
		actionToggleMouse: { id: 'action.toggle-mouse', defaultMessage: 'Mouse' },
		actionToggleTrackpad: { id: 'action.toggle-trackpad', defaultMessage: 'Trackpad' },
		menuInputDevice: { id: 'menu.input-device', defaultMessage: 'Input device' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../context/events'
	import ToggleInvertZoomItem from './menu-items/ToggleInvertZoomItem.svelte'
	import SvelteDrawUiMenuCheckboxItem from './primitives/menus/SvelteDrawUiMenuCheckboxItem.svelte'
	import SvelteDrawUiMenuGroup from './primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from './primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

	const MODES = ['auto', 'trackpad', 'mouse'] as const

	const AUTO_LABELS = {
		none: messages.actionToggleAutoNone,
		pan: messages.actionToggleAutoPan,
		zoom: messages.actionToggleAutoZoom,
	}

	const editor = getEditor()
	const trackEvent = getUiEvents()

	const inputMode = fromComputed('inputMode', () => editor.user.getUserPreferences().inputMode)
	const wheelBehavior = fromComputed('wheelBehavior', () => editor.getCameraOptions().wheelBehavior)

	function getLabel(mode: (typeof MODES)[number]) {
		if (mode === 'auto') {
			return AUTO_LABELS[wheelBehavior.current].id
		}

		return mode === 'trackpad' ? messages.actionToggleTrackpad.id : messages.actionToggleMouse.id
	}
</script>

<SvelteDrawUiMenuSubmenu id="help menu input-mode" label={messages.menuInputDevice.id}>
	<SvelteDrawUiMenuGroup id="peripheral-mode">
		{#each MODES as mode (mode)}
			{@const preference = mode === 'auto' ? null : mode}
			<SvelteDrawUiMenuCheckboxItem
				id={`peripheral-mode-${mode}`}
				label={getLabel(mode)}
				checked={inputMode.current === preference}
				readonlyOk
				onSelect={(source) => {
					trackEvent('input-mode', { source, value: mode })
					editor.user.updateUserPreferences({ inputMode: preference })
				}}
			/>
		{/each}
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="invert-zoom-group">
		<ToggleInvertZoomItem />
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
