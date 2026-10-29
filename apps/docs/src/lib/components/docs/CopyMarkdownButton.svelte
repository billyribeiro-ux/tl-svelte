<script lang="ts">
	import Button from '#lib/components/common/Button.svelte'

	let { markdown, class: className }: { markdown: string; class?: string } = $props()

	let copied = $state(false)

	function handleClick() {
		navigator.clipboard.writeText(markdown)

		if (window.tlanalytics?.trackCopyCode) {
			window.tlanalytics.trackCopyCode({
				page_category: 'docs',
				text_snippet: markdown.slice(0, 500),
			})
		}

		copied = true
		setTimeout(() => (copied = false), 1500)
	}
</script>

<Button
	id="copy-markdown"
	onclick={handleClick}
	caption="Copy markdown"
	icon={copied ? 'check' : 'copy'}
	size="sm"
	type="secondary"
	class={className}
/>
