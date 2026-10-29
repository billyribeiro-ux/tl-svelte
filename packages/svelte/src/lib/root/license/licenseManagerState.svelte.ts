import type { LicenseFeatureName, LicenseManager, LicenseState } from '@svelte-draw/editor'
import { fromComputed, fromSignal, type SignalValue } from '../../state/fromSignal'

/** @internal Replaces `useLicenseManagerState`. */
export function createLicenseManagerState(
	licenseManager: LicenseManager
): SignalValue<LicenseState> {
	return fromSignal(licenseManager.state)
}

/**
 * Reactively reads whether a licensable feature is enabled for the current license. Updates when
 * license validation resolves. Reads `false` when there is no license manager, so gated UI stays
 * hidden when mounted without an editor or license context. Replaces `useLicenseFeatureFlag`.
 *
 * @internal
 */
export function createLicenseFeatureFlag(
	licenseManager: LicenseManager | null,
	feature: LicenseFeatureName
): SignalValue<boolean> {
	return fromComputed('licenseFeature', () =>
		licenseManager ? licenseManager.isFeatureEnabled(feature) : false
	)
}
