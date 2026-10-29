<script lang="ts">
	import FileHistorySnapshotPage from '../../../../../../../../../tla/pages/file-history-snapshot.svelte'
	import { getPageError } from '../../../../../../../../../utils/pageError.svelte'

	// React Router rendered the page again from the route's `ErrorBoundary`, handing it the error.
	const error = getPageError()
</script>

<FileHistorySnapshotPage  error={error.current} />
