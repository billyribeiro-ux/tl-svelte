<script lang="ts">
	import FilePage from '../../../../../../tla/pages/file.svelte'
	import { getPageError } from '../../../../../../utils/pageError.svelte'

	// React Router rendered the page again from the route's `ErrorBoundary`, handing it the error.
	const error = getPageError()
</script>

<FilePage  error={error.current} />
