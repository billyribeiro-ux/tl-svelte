<script lang="ts">
	import type { PageProps } from './$types'
	import PublishPage from '../../../../../../tla/pages/publish.svelte'

	let { data }: PageProps = $props()
</script>

<PublishPage {data} />
