<script lang="ts">
	import { LicenseManager } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'
	import { fromSignal } from '../../state/fromSignal'
	import { setLicenseManager, LICENSE_TIMEOUT } from './licenseContext'
	import { getLicenseKeyFromEnv } from './licenseKeyFromEnv'

	let {
		licenseKey = getLicenseKeyFromEnv() ?? undefined,
		children,
	}: {
		licenseKey?: string
		children: Snippet
	} = $props()

	function shouldHideEditorAfterDelay(licenseState: string): boolean {
		return licenseState === 'expired' || licenseState === 'unlicensed-production'
	}

	// Keyed on the license key: the editor is recreated when the key changes, and must not be
	// handed a manager that validated the old key.
	const licenseManager = $derived(new LicenseManager(licenseKey))
	const licenseStateSignal = $derived(fromSignal(licenseManager.state))
	const licenseState = $derived(licenseStateSignal.current)
	// The manager whose LICENSE_TIMEOUT elapsed; compared by identity so a new key un-gates the editor.
	let gatedManager = $state.raw<LicenseManager | null>(null)
	const showEditor = $derived(gatedManager !== licenseManager)

	setLicenseManager(() => licenseManager)

	// Dispose only the replaced manager, never on cleanup: disposing there would silence a live
	// manager whose component was merely re-created.
	let previousManager: LicenseManager | null = null
	$effect(() => {
		const current = licenseManager
		if (previousManager && previousManager !== current) {
			previousManager.dispose()
		}
		previousManager = current
	})

	// When license expires or no license in production, show for 5 seconds then hide
	$effect(() => {
		if (shouldHideEditorAfterDelay(licenseState) && showEditor) {
			const manager = licenseManager
			const timer = setTimeout(() => {
				gatedManager = manager
			}, LICENSE_TIMEOUT)

			return () => clearTimeout(timer)
		}
		return undefined
	})
</script>

<!-- If license is expired or no license in production and 5 seconds have passed, don't render anything (blank screen) -->
{#if shouldHideEditorAfterDelay(licenseState) && !showEditor}
	<!-- Renders as a hidden div that can be detected by tests -->
	<div data-testid="tl-license-expired" style="display: none"></div>
{:else}
	{@render children()}
{/if}
