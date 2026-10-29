<script lang="ts">
	import LegacyHistorySnapshotPage from '../../../../../../../../../tla/pages/legacy-history-snapshot.svelte'
	import { getPageError } from '../../../../../../../../../utils/pageError.svelte'

	// React Router rendered the page again from the route's `ErrorBoundary`, handing it the error.
	const error = getPageError()
</script>

<LegacyHistorySnapshotPage  error={error.current} />
