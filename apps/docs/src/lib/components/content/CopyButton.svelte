<script lang="ts">
	import Button from '#lib/components/common/Button.svelte'

	let {
		copy,
		class: className = '',
	}: {
		/** The text to copy, or a function returning it (read at click time, e.g. from a `<pre>`). */
		copy: string | (() => string)
		class?: string
	} = $props()

	let copied = $state(false)

	function handleClick() {
		const code = typeof copy === 'string' ? copy : copy()

		navigator.clipboard.writeText(code)

		if (window.tlanalytics?.trackCopyCode) {
			window.tlanalytics.trackCopyCode({
				page_category: 'docs',
				text_snippet: code,
			})
		}

		copied = true
		setTimeout(() => (copied = false), 1500)
	}
</script>

<Button
	onclick={handleClick}
	caption="Copy"
	icon={copied ? 'check' : 'copy'}
	size="xs"
	class="absolute transition-all duration-100 translate-y-4 opacity-0 -top-2 right-4 group-hover:opacity-100 group-hover:translate-y-0 {className}"
/>
