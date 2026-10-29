<script lang="ts">
	import type { Snippet } from 'svelte'
	import { useStateAttribute } from '../canvas/useStateAttribute.svelte'
	import { useZoomCss } from '../canvas/useZoomCss.svelte'
	import { getContainer, getEditor } from '../context/editor'
	import { setupCursor } from './cursor.svelte'
	import { setupDarkMode } from './darkMode.svelte'
	import { setupOnMount } from './onMount.svelte'
	import type { TLOnMountHandler } from './types'

	let { onMount, children }: { onMount?: TLOnMountHandler; children: Snippet } = $props()

	const editor = getEditor()
	const container = getContainer()

	// `useForceUpdate` forced one extra React render after mount; there is no equivalent need here.
	useZoomCss()
	setupCursor(editor, container)
	setupDarkMode(editor, container)
	useStateAttribute()
	setupOnMount(editor, () => (mountedEditor) => {
		// The store's own onMount (createTLStore's `onMount` option) runs first, then the prop.
		const teardownStore = mountedEditor.store.props.onMount(mountedEditor)
		const teardownCallback = onMount?.(mountedEditor)
		return () => {
			teardownStore?.()
			teardownCallback?.()
		}
	})
</script>

{@render children()}
