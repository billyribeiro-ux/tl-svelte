<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()
	const darkMode = fromComputed('isDarkMode', () => editor.user.getIsDarkMode())

	// Helmet used to replace the page's `<meta name="theme-color" data-rh>`; app.html keeps one
	// static tag, so this edits that element in place (a second tag would leave the browser
	// choosing between two) and puts the previous value back when the editor goes away.
	$effect(() => {
		const meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
		if (!meta) return
		const previous = meta.content
		meta.content = darkMode.current ? '#000000' : '#ffffff'
		return () => {
			meta.content = previous
		}
	})
</script>
