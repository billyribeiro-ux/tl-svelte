import {
	createLicenseFeatureFlag,
	getMaybeLicenseManagerAccessor,
	type SignalValue,
} from '@svelte-draw/svelte'

/**
 * Whether the commenting feature is licensed for this editor. The default comment quick action and
 * its keyboard shortcut are hidden/disabled unless this is true. Enabled in development; in
 * production it requires a license that includes the commenting feature (or the collaboration
 * umbrella that grants it). Reactive: re-reads when license validation resolves. Works outside
 * `<SvelteDraw />` too: UI mounted via `EditorProvider` resolves the license through the editor, and
 * with no editor at all this is `false`.
 *
 * Call during component initialisation. Replaces `useCommentingEnabled`.
 *
 * @internal
 */
export function createCommentingEnabled(): SignalValue<boolean> {
	const getLicenseManager = getMaybeLicenseManagerAccessor()
	// The provider replaces its manager when the key changes, so the flag follows the accessor.
	const flag = $derived(createLicenseFeatureFlag(getLicenseManager(), 'commenting'))
	return {
		get current() {
			return flag.current
		},
	}
}
