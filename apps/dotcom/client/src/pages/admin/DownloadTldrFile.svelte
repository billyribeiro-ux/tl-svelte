<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { getResponseError } from './shared.svelte'

	let { legacy }: { legacy: boolean } = $props()

	let input = $state<HTMLInputElement | null>(null)
	let error = $state<string | null>(null)
	let isDownloading = $state(false)

	async function onDownload() {
		error = null
		const fileSlug = input?.value
		if (!fileSlug) {
			error = 'Please enter a file slug'
			return
		}
		const path = legacy ? 'download-legacy-tldr' : 'download-tldr'

		isDownloading = true
		try {
			const res = await fetch(`/api/app/admin/${path}/${fileSlug}`)
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}

			// Create a blob from the response and trigger download
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${fileSlug}.tldr`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} finally {
			isDownloading = false
		}
	}
</script>

<div class={styles.fileOperation}>
	<h4 class={styles.subTitle}>
		{legacy ? 'Download legacy .tldr file' : 'Download .tldr file'}
	</h4>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	<div class={styles.downloadContainer}>
		<input type="text" placeholder="File ID" bind:this={input} class={styles.searchInput} />
		<AdminButton onclick={onDownload} variant="primary" isLoading={isDownloading}>
			Download
		</AdminButton>
	</div>
</div>
