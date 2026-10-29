<script lang="ts">
	import { exportAs, F, type TLExportType } from 'svelte-draw'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { getCurrentEditor } from '../../../utils/getCurrentEditor'
	import TlaButton from '../../TlaButton/TlaButton.svelte'
	import { getExportPreferences, getImageExportOptions } from './export-preferences'

	const app = getMaybeApp()
	const trackEvent = getSvelteDrawAppUiEvents()

	let exported = false

	function handleClick() {
		if (exported) return

		const editor = getCurrentEditor()
		if (!editor) return

		const preferences = getExportPreferences(app.current)
		const { exportPadding, exportBackground, exportTheme, exportFormat } = preferences

		let fullPage = false

		let ids = editor.getSelectedShapeIds()
		if (ids.length === 0) {
			fullPage = true
			ids = editor.getSortedChildIdsForParent(editor.getCurrentPageId())
		}

		exportAs(editor, ids, {
			...getImageExportOptions(editor, preferences),
			format: exportFormat as TLExportType,
		})

		trackEvent('export-image', {
			source: 'file-share-menu',
			fullPage,
			padding: exportPadding,
			background: exportBackground,
			theme: exportTheme,
			format: exportFormat,
		})

		exported = true
		setTimeout(() => (exported = false), 2500)
	}
</script>

<TlaButton class="tla-share-menu__copy-button" onclick={handleClick} iconRight="export">
	<F defaultMessage="Export image" />
</TlaButton>
