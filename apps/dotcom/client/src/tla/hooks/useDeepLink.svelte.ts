import { onMount } from 'svelte'
import { react, throttle } from 'svelte-draw'
import { globalEditor } from '../../utils/globalEditor'

function getDeepLink() {
	const editor = globalEditor.get()
	if (!editor) return null
	return editor.createDeepLink().toString()
}

/** Was `useEditorDeepLink()`. */
export function getEditorDeepLink(): { readonly current: string | null } {
	let deepLink = $state<string | null>(getDeepLink())
	onMount(() => {
		const throttledSetDeepLink = throttle((value: string | null) => {
			deepLink = value
		}, 300)
		const unsub = react('setDeepLink', () => {
			throttledSetDeepLink(getDeepLink())
		})
		return () => {
			unsub()
			throttledSetDeepLink.cancel()
		}
	})
	return {
		get current() {
			return deepLink
		},
	}
}
