<script lang="ts">
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	// Helper component for structured data display.
	let { data }: { data: object } = $props()

	let copied = $state(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
			copied = true
			setTimeout(() => {
				copied = false
			}, 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}
</script>

<div class={styles.structuredData}>
	<AdminButton onclick={handleCopy} variant="secondary" class={styles.copyButton}>
		{copied ? 'Copied!' : 'Copy JSON'}
	</AdminButton>
	<pre class={styles.dataDisplay}>{JSON.stringify(data, null, 2)}</pre>
</div>
