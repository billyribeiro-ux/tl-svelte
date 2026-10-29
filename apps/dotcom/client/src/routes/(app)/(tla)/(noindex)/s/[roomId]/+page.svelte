<script lang="ts">
	import type { PageProps } from './$types'
	import LegacySnapshotPage from '../../../../../../tla/pages/legacy-snapshot.svelte'

	let { data }: PageProps = $props()
</script>

<LegacySnapshotPage {data} />
