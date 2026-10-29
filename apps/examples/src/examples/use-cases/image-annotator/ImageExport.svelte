<script lang="ts">
	let { result, onStartAgain }: { result: Blob; onStartAgain(): void } = $props()

	let src = $state<string | null>(null)
	$effect(() => {
		const url = URL.createObjectURL(result)
		src = url
		return () => URL.revokeObjectURL(url)
	})

	function onDownload() {
		if (!src) return

		const a = document.createElement('a')
		a.href = src
		a.download = 'annotated-image.png'
		a.click()
	}

	let didCopy = $state(false)
	function onCopy() {
		navigator.clipboard.write([new ClipboardItem({ [result.type]: result })])
		didCopy = true
	}
	$effect(() => {
		if (!didCopy) return
		const t = setTimeout(() => (didCopy = false), 2000)
		return () => clearTimeout(t)
	})
</script>

<div class="ImageExport">
	{#if src}<img {src} alt="" />{/if}
	<div class="ImageExport-buttons">
		<button onclick={onCopy}>{didCopy ? 'Copied!' : 'Copy'}</button>
		<button onclick={onDownload}>Download</button>
	</div>
	<button onclick={onStartAgain}>Start again</button>
</div>
