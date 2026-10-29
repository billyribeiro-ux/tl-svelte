import type { LicenseManager } from '@svelte-draw/editor'
import { getContext, setContext } from 'svelte'
import { tryGetEditor } from '../../context/editor'

const LICENSE_KEY = Symbol('svelte-draw.license-manager')

/** @internal */
export const LICENSE_TIMEOUT = 5000

/**
 * Provides the license manager to descendants. It is passed as a getter because the provider
 * replaces its manager when the license key changes.
 *
 * @internal
 */
export function setLicenseManager(getLicenseManager: () => LicenseManager): void {
	setContext(LICENSE_KEY, getLicenseManager)
}

/**
 * Returns a function that reads the license manager for the current editor, or `null` if there is
 * none. It reads the license context when inside `<SvelteDrawEditor />`, and otherwise falls back
 * to the license manager of the nearest editor, so UI mounted outside the editor tree (via
 * `EditorProvider`) resolves the same license as the editor it belongs to.
 *
 * Call during component initialisation (it reads context); call the returned function anywhere,
 * including in a `$derived`, to follow a manager that is replaced when the key changes.
 *
 * @internal
 */
export function getMaybeLicenseManagerAccessor(): () => LicenseManager | null {
	const getLicenseManager = getContext<(() => LicenseManager) | undefined>(LICENSE_KEY)
	const editor = tryGetEditor()
	return () => getLicenseManager?.() ?? editor?.licenseManager ?? null
}

/**
 * Like {@link getMaybeLicenseManagerAccessor}, but the returned function throws when there is no
 * license manager.
 *
 * @internal
 */
export function getLicenseManagerAccessor(): () => LicenseManager {
	const accessor = getMaybeLicenseManagerAccessor()
	if (!accessor()) {
		throw new Error(
			'getLicenseManager must be used inside of the <SvelteDraw /> or <SvelteDrawEditor /> components, or inside an <EditorProvider /> wrapping an editor created by them'
		)
	}
	return () => accessor()!
}

/** @internal Reads the license manager once. See {@link getLicenseManagerAccessor}. */
export function getLicenseManager(): LicenseManager {
	return getLicenseManagerAccessor()()
}

/** @internal Reads the license manager once, or `null`. See {@link getMaybeLicenseManagerAccessor}. */
export function tryGetLicenseManager(): LicenseManager | null {
	return getMaybeLicenseManagerAccessor()()
}
