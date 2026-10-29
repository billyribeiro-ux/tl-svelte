<script lang="ts" module>
	import type { DebugFlag } from '@svelte-draw/editor'

	/** @public */
	export interface CustomDebugFlags {
		customDebugFlags?: Record<string, DebugFlag<boolean>>
		customFeatureFlags?: Record<string, DebugFlag<boolean>>
	}
</script>

<script lang="ts">
	import { hardResetEditor, noop, uniqueId } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getDialogs } from '../../context/dialogs'
	import { getToasts, type TLUiToastAction } from '../../context/toasts'
	import { untranslated } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'
	import DebugDialog from './DebugDialog.svelte'
	import DebugFlags from './DebugFlags.svelte'
	import { createNShapes } from './createNShapes'
	import FeatureFlags from './FeatureFlags.svelte'

	const DEMO_TOAST_ACTIONS: TLUiToastAction[] = [
		{ label: 'Primary', type: 'primary', onClick: noop },
		{ label: 'Normal', type: 'normal', onClick: noop },
		{ label: 'Danger', type: 'danger', onClick: noop },
	]

	let { customDebugFlags, customFeatureFlags }: CustomDebugFlags = $props()

	const editor = getEditor()
	const { addToast } = getToasts()
	const { addDialog } = getDialogs()
	let error = $state(false)

	function throwError(): never {
		throw Error('oh no!')
	}
</script>

<SvelteDrawUiMenuGroup id="items">
	<SvelteDrawUiMenuItem
		id="hard-reset"
		onSelect={() => {
			if (
				window.confirm(
					'Hard reset will delete all svelte-draw data stored in this browser, including every document and your preferences. This cannot be undone.'
				)
			) {
				hardResetEditor()
			}
		}}
		label="Hard reset"
	/>
	<SvelteDrawUiMenuItem
		id="add-toast"
		onSelect={() => {
			addToast({
				id: uniqueId(),
				title: 'Something good happened',
				description: 'Hey, attend to this thing over here. It might be important!',
				keepOpen: true,
				severity: 'success',
			})
			addToast({
				id: uniqueId(),
				title: 'Something happened',
				description: 'Hey, attend to this thing over here. It might be important!',
				keepOpen: true,
				severity: 'info',
				actions: DEMO_TOAST_ACTIONS,
			})
			addToast({
				id: uniqueId(),
				title: 'Something maybe bad happened',
				description: 'Hey, attend to this thing over here. It might be important!',
				keepOpen: true,
				severity: 'warning',
				actions: DEMO_TOAST_ACTIONS,
			})
			addToast({
				id: uniqueId(),
				title: 'Something bad happened',
				severity: 'error',
				keepOpen: true,
			})
		}}
		label={untranslated('Show toast')}
	/>
	<SvelteDrawUiMenuItem
		id="show-dialog"
		label="Show dialog"
		onSelect={() => {
			addDialog({
				component: DebugDialog,
				onClose: noop,
			})
		}}
	/>
	<SvelteDrawUiMenuItem
		id="create-shapes"
		label="Create 100 shapes"
		onSelect={() => createNShapes(editor, 100)}
	/>
	<SvelteDrawUiMenuItem
		id="count-nodes"
		label="Count shapes / nodes"
		onSelect={() => {
			const selectedShapes = editor.getSelectedShapes()
			const shapes = selectedShapes.length === 0 ? editor.getRenderingShapes() : selectedShapes
			window.alert(
				`Shapes ${shapes.length}, DOM nodes:${editor.getContainerDocument().querySelector('.tl-shapes')!.querySelectorAll('*')?.length}`
			)
		}}
	/>
	{#if error}
		{throwError()}
	{/if}
	<SvelteDrawUiMenuItem
		id="throw-error"
		onSelect={() => {
			error = true
		}}
		label="Throw error"
	/>
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup id="flags">
	<DebugFlags {customDebugFlags} />
	<FeatureFlags {customFeatureFlags} />
</SvelteDrawUiMenuGroup>
