<script lang="ts">
	import type { PageProps } from './$types'
	import LocalFileIndexPage from '../../../../../tla/pages/local-file-index.svelte'

	let { data }: PageProps = $props()
</script>

<LocalFileIndexPage data={data.keys} />
