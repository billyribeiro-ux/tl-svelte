<script lang="ts">
	import LegacySnapshotPage from '../../../../../../tla/pages/legacy-snapshot.svelte'
	import { getPageError } from '../../../../../../utils/pageError.svelte'

	// No loader data here: the load is what failed (the old `useMaybeData()` returned undefined).
	const error = getPageError()
</script>

<LegacySnapshotPage error={error.current} />
