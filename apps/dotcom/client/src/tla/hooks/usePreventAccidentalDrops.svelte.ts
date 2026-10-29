import { preventDefault } from 'svelte-draw'

export function setupPreventAccidentalDrops() {
	$effect(() => {
		function stopDrop(e: DragEvent) {
			if ((e as DragEvent & { isSpecialRedispatchedEvent?: boolean }).isSpecialRedispatchedEvent)
				return
			preventDefault(e)
		}

		// todo: make the sidebar accept drop events for .tldr files

		document.addEventListener('dragover', stopDrop)
		document.addEventListener('drop', stopDrop)
		return () => {
			document.removeEventListener('dragover', stopDrop)
			document.removeEventListener('drop', stopDrop)
		}
	})
}
