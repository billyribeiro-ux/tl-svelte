<script lang="ts">
	import { getEditor } from 'svelte-draw'

	// [1]
	const editor = getEditor()

	$effect(() => {
		let x = window.screenX
		let y = window.screenY

		// [2]
		function updateCamera() {
			if (window.screenX === x && window.screenY === y) return
			x = window.screenX
			y = window.screenY
			editor.setCamera({ x: -x, y: -y })
		}

		// [3]
		editor.on('tick', updateCamera)
		return () => {
			editor.off('tick', updateCamera)
		}
	})
</script>
