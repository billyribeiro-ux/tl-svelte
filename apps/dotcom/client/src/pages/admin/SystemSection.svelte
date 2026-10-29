<script lang="ts">
	import { fetch } from 'svelte-draw'
	import { sentryReleaseName } from '../../../sentry-release-name'
	import styles from './admin.module.css'
	import { getResponseError } from './shared.svelte'
	import StructuredDataDisplay from './StructuredDataDisplay.svelte'

	let outboxData = $state<object | null>(null)
	let error = $state<string | null>(null)

	$effect(() => {
		fetch('/api/app/admin/outbox')
			.then(async (res) => {
				if (!res.ok) {
					error = await getResponseError(res)
					return
				}
				error = null
				outboxData = await res.json()
			})
			.catch((e) => {
				error = e.message
			})
	})
</script>

<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Release</h3>
	<p class={styles.adminReleaseMeta}>
		<span class={styles.adminReleaseLabel}>Release:</span>{' '}
		<code class={styles.adminReleaseValue} translate="no">
			{sentryReleaseName}
		</code>
	</p>
</section>
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>System health</h3>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if outboxData}<StructuredDataDisplay data={outboxData} />{/if}
</section>
