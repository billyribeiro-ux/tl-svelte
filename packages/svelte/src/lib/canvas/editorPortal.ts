import { getContext, setContext } from 'svelte'

const PORTAL_KEY = Symbol('svelte-draw.editor-portal-host')

/**
 * Replacement for `EditorPortalProvider`. Pass a getter for the `.tl-portal-host` element so the
 * portal follows it once it has mounted (it is null until then).
 *
 * @internal
 */
export function setEditorPortalHost(getHost: () => HTMLElement | null): void {
	setContext(PORTAL_KEY, getHost)
}

/**
 * The DOM node that {@link EditorPortal} renders into: an empty `display: contents` element the
 * editor renders last among its container's children, after the canvas and after the UI.
 *
 * Call during component initialisation, then read `.current` in a template, `$derived` or
 * `$effect` (reactive). It is null until the container has mounted, so prefer `EditorPortal`,
 * which handles that for you. Replaces `useEditorPortalHost`.
 *
 * @public
 */
export function getEditorPortalHost(): { readonly current: HTMLElement | null } {
	const getHost = getContext<(() => HTMLElement | null) | undefined>(PORTAL_KEY)
	return {
		get current() {
			return getHost?.() ?? null
		},
	}
}
