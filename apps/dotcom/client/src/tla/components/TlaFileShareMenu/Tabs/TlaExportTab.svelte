<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		auto: { defaultMessage: 'Auto' },
		light: { defaultMessage: 'Light' },
		dark: { defaultMessage: 'Dark' },
	})
</script>

<script lang="ts">
	import { F, fromComputed, getTranslation } from 'svelte-draw'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import {
		type SvelteDrawAppSessionState,
		updateLocalSessionState,
	} from '../../../utils/local-session-state'
	import TlaMenuControl from '../../tla-menu/TlaMenuControl.svelte'
	import TlaMenuControlGroup from '../../tla-menu/TlaMenuControlGroup.svelte'
	import TlaMenuControlLabel from '../../tla-menu/TlaMenuControlLabel.svelte'
	import TlaMenuSection from '../../tla-menu/TlaMenuSection.svelte'
	import TlaMenuSelect from '../../tla-menu/TlaMenuSelect.svelte'
	import TlaMenuSwitch from '../../tla-menu/TlaMenuSwitch.svelte'
	import ExportImageButton from './ExportImageButton.svelte'
	import ExportPreviewImage from './ExportPreviewImage.svelte'
	import { getExportPreferences } from './export-preferences'

	type ExportSettings = SvelteDrawAppSessionState['exportSettings']

	const msg = getTranslation()
	const app = getMaybeApp()
	const trackEvent = getSvelteDrawAppUiEvents()

	const preferences = fromComputed('preferences', () => getExportPreferences(app.current))

	function onChange<T extends keyof ExportSettings>(key: T, value: ExportSettings[T]) {
		const a = app.current
		if (a) {
			a.updateUserExportPreferences({ [key]: value })
		} else {
			updateLocalSessionState((s) => ({ exportSettings: { ...s.exportSettings, [key]: value } }))
		}
	}

	const exportPadding = $derived(preferences.current.exportPadding)
	const exportBackground = $derived(preferences.current.exportBackground)
	const exportTheme = $derived(preferences.current.exportTheme)
	const exportFormat = $derived(preferences.current.exportFormat)

	function handlePaddingChange() {
		const padding = !exportPadding
		onChange('exportPadding', padding)
		trackEvent('toggle-export-padding', { padding, source: 'file-share-menu' })
	}

	function handleBackgroundChange() {
		const background = !exportBackground
		onChange('exportBackground', background)
		trackEvent('toggle-export-background', { background, source: 'file-share-menu' })
	}

	function handleFormatChange(value: ExportSettings['exportFormat']) {
		onChange('exportFormat', value)
		trackEvent('set-export-format', { format: value, source: 'file-share-menu' })
	}

	function handleThemeChange(value: ExportSettings['exportTheme']) {
		onChange('exportTheme', value)
		trackEvent('set-export-theme', { theme: value, source: 'file-share-menu' })
	}
</script>

{#snippet svgLabel()}<F defaultMessage="SVG" />{/snippet}
{#snippet pngLabel()}<F defaultMessage="PNG" />{/snippet}
{#snippet autoLabel()}<F defaultMessage="Auto" />{/snippet}
{#snippet lightLabel()}<F defaultMessage="Light" />{/snippet}
{#snippet darkLabel()}<F defaultMessage="Dark" />{/snippet}

<TlaMenuSection>
	<TlaMenuControlGroup>
		<TlaMenuControl>
			<TlaMenuControlLabel htmlFor="tla-export-background-switch">
				<F defaultMessage="Background" />
			</TlaMenuControlLabel>
			<TlaMenuSwitch
				id="tla-export-background-switch"
				checked={exportBackground}
				onChange={handleBackgroundChange}
			/>
		</TlaMenuControl>
		<TlaMenuControl>
			<TlaMenuControlLabel htmlFor="tla-export-padding-switch">
				<F defaultMessage="Padding" />
			</TlaMenuControlLabel>
			<TlaMenuSwitch
				id="tla-export-padding-switch"
				checked={exportPadding}
				onChange={handlePaddingChange}
			/>
		</TlaMenuControl>
		<TlaMenuControl>
			<TlaMenuControlLabel htmlFor="tla-export-theme-select">
				<F defaultMessage="Theme" />
			</TlaMenuControlLabel>
			<TlaMenuSelect
				id="tla-export-theme-select"
				value={exportTheme}
				label={msg(messages[exportTheme as 'auto' | 'light' | 'dark'])}
				onChange={handleThemeChange}
				options={[
					{ value: 'auto', label: autoLabel },
					{ value: 'light', label: lightLabel },
					{ value: 'dark', label: darkLabel },
				]}
			/>
		</TlaMenuControl>
		<TlaMenuControl>
			<TlaMenuControlLabel htmlFor="tla-export-format-select">
				<F defaultMessage="Export as" />
			</TlaMenuControlLabel>
			<TlaMenuSelect
				id="tla-export-format-select"
				value={exportFormat}
				label={exportFormat === 'svg' ? 'SVG' : 'PNG'}
				onChange={handleFormatChange}
				options={[
					{ value: 'svg', label: svgLabel },
					{ value: 'png', label: pngLabel },
				]}
			/>
		</TlaMenuControl>
	</TlaMenuControlGroup>
	<ExportPreviewImage />
	<ExportImageButton />
</TlaMenuSection>
