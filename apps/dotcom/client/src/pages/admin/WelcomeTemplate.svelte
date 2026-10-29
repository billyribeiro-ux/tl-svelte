<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { createTransientMessage, getResponseError } from './shared.svelte'

	let input = $state<HTMLInputElement | null>(null)
	let current = $state.raw<{ fileId: string; publishedSlug: string; live?: boolean } | null>(null)
	let isLoading = $state(true)
	let error = $state<string | null>(null)
	const successMessage = createTransientMessage()

	async function load() {
		isLoading = true
		error = null
		try {
			const res = await fetch('/api/app/admin/welcome-template')
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			current = await res.json()
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load welcome template'
		} finally {
			isLoading = false
		}
	}

	$effect(() => {
		load()
	})

	async function onSet() {
		const fileId = input?.value?.trim()
		if (!fileId) {
			error = 'Please enter a published file ID'
			return
		}
		error = null
		successMessage.set(null)
		try {
			const res = await fetch('/api/app/admin/welcome-template', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fileId }),
			})
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			current = await res.json()
			successMessage.set('Welcome template set ✨')
			input!.value = ''
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to set welcome template'
		}
	}

	async function onClear() {
		if (!window.confirm('Clear the welcome template? New workspaces will use the built-in default.'))
			return
		error = null
		successMessage.set(null)
		try {
			const res = await fetch('/api/app/admin/welcome-template/clear', { method: 'POST' })
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			current = null
			successMessage.set('Welcome template cleared — using the built-in default')
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to clear welcome template'
		}
	}
</script>

<div class={styles.fileOperation}>
	<p>
		The file new workspaces fork their first file from. Publish the file first, then set it here by
		its file ID. Clear it to use the built-in default.
	</p>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if successMessage.current}<div class={styles.successMessage}>{successMessage.current}</div>{/if}
	<div class={styles.summaryItem}>
		<span class={styles.fieldLabel}>Current:</span>
		<span class={styles.fieldValue}>
			{isLoading
				? 'Loading…'
				: current
					? `${current.fileId} (published slug ${current.publishedSlug})${
							current.live ? '' : ' ⚠️ not published — new workspaces fall back to the default'
						}`
					: 'none — using the built-in default'}
		</span>
	</div>
	<div class={styles.searchContainer}>
		<input type="text" placeholder="Published file ID" bind:this={input} class={styles.searchInput} />
		<AdminButton onclick={onSet} variant="primary">Set as welcome template</AdminButton>
		<AdminButton onclick={onClear} variant="secondary" disabled={!current}>Clear</AdminButton>
	</div>
</div>
