<script lang="ts">
	import { onMount } from 'svelte'
	import { SearchSession } from '#lib/search/search.svelte.js'
	import type { SearchIndexName } from '#utils/algolia.js'
	import SearchDialog from './SearchDialog.svelte'

	let { type, onClose }: { type: SearchIndexName; onClose: () => void } = $props()

	// svelte-ignore state_referenced_locally
	const session = new SearchSession(type)

	// Like InstantSearch, start with the empty query so the dialog lists entries before typing.
	onMount(() => {
		void session.refine('')
	})
</script>

<SearchDialog {session} {onClose} />
