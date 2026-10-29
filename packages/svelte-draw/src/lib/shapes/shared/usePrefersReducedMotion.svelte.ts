import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'

/**
 * Whether the user prefers reduced motion: the editor's animation speed when it has one (0 means
 * reduced), otherwise the `prefers-reduced-motion` media query. Works outside of an editor tree.
 * Call during component initialisation and read `.current`. Replaces the React hook of the same
 * name.
 *
 * @public
 */
export function usePrefersReducedMotion(): { readonly current: boolean } {
	const editor = tryGetEditor()
	const animationSpeed = fromComputed('animationSpeed', () => editor?.user.getAnimationSpeed())
	let prefersReducedMotion = $state(false)

	$effect(() => {
		const speed = animationSpeed.current
		if (speed !== undefined) {
			prefersReducedMotion = speed === 0 ? true : false
			return
		}

		const win = editor?.getContainerWindow() ?? window
		if (!('matchMedia' in win)) return
		const mql = win.matchMedia('(prefers-reduced-motion: reduce)')
		const handler = () => {
			prefersReducedMotion = mql.matches
		}
		handler()
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	})

	return {
		get current() {
			return prefersReducedMotion
		},
	}
}
