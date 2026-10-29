<script lang="ts">
	import FileHistoryPage from '../../../../../../../../tla/pages/file-history.svelte'
	import { getPageError } from '../../../../../../../../utils/pageError.svelte'

	// React Router rendered the page again from the route's `ErrorBoundary`, handing it the error.
	const error = getPageError()
</script>

<FileHistoryPage  error={error.current} />
