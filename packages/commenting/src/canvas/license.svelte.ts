import {
	createLicenseFeatureFlag,
	getMaybeLicenseManagerAccessor,
	type SignalValue,
} from 'svelte-draw'

/**
 * Whether commenting is licensed for this editor. Enabled in development; in production it requires
 * a tldraw license that includes the commenting feature (or the collaboration umbrella that grants
 * it). Reactive: re-reads when license validation resolves, and returns `false` while validation is
 * pending, so gated UI stays hidden until the license is confirmed. Works outside `<SvelteDraw />` too:
 * UI mounted via `EditorProvider` resolves the license through the editor, and with no editor at
 * all this is `false`.
 *
 * The built-in commenting components (`CanvasComments`, `CanvasCommentsSidebar`, and the comment
 * tool's Quick Action) gate on this. Use it to gate any custom commenting UI the same way.
 *
 * Call during component initialisation and read `.current` in a `$derived`, an `$effect` or the
 * template. Replaces `useCommentingEnabled`.
 * @public
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
