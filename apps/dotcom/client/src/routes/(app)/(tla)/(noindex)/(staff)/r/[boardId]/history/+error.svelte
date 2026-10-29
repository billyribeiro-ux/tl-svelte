<script lang="ts">
	import LegacyHistoryPage from '../../../../../../../../tla/pages/legacy-history.svelte'
	import { getPageError } from '../../../../../../../../utils/pageError.svelte'

	// React Router rendered the page again from the route's `ErrorBoundary`, handing it the error.
	const error = getPageError()
</script>

<LegacyHistoryPage  error={error.current} />
