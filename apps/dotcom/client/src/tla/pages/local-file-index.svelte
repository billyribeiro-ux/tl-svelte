<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { deleteDB } from 'idb'
	import { routes } from '../../routeDefs'
	import { STORE_PREFIX } from './local-file-index'

	let { data }: { data: string[] } = $props()

	const onDelete = async (persistenceKey: string) => {
		if (confirm('Are you 100% sure you want to delete this file? This action cannot be undone.')) {
			await deleteDB(STORE_PREFIX + persistenceKey)
			// reload data
			await invalidateAll()
		}
	}
</script>

<div style="padding: 20px">
	<h1>Secret local svelte-draw files 🕵️‍♂️</h1>
	<p>Don&rsquo;t rely on this page existing, we might get rid of it.</p>
	<p>You have {data.length} local file(s) stored on your machine:</p>
	<ul>
		{#each data as persistenceKey (persistenceKey)}
			<li>
				<a style="color: var(--tl-color-primary)" href={routes.tlaLocalFile(persistenceKey)}>
					{routes.tlaLocalFile(persistenceKey)}
				</a>
				-
				<button onclick={() => onDelete(persistenceKey)} style="padding: 0">delete</button>
			</li>
		{/each}
	</ul>
	<p>
		You can make a new local file by changing the url to be e.g. `
		<span style="user-select: all">
			{location.origin}{routes.tlaLocalFile('my-secret-file')}
		</span>
		`. Replace &apos;my-secret-file&apos; with whatever you want.
	</p>
</div>
