<script lang="ts" module>
	import { markFirstLoad } from '../../utils/firstLoad'

	markFirstLoad('file-chunk-loaded')
</script>

<script lang="ts">
	import { params, searchParams } from '../../utils/router.svelte'
	import TlaEditor from '../components/TlaEditor/TlaEditor.svelte'
	import TlaFileSyncHost from '../components/TlaEditor/TlaFileSyncHost.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import { getIsAppLoading, getMaybeApp } from '../hooks/useAppState.svelte'
	import ReadyWrapper from '../hooks/ReadyWrapper.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import TlaSidebarLayout from '../layouts/TlaSidebarLayout/TlaSidebarLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	/**
	 * The file page. Rendered by `+page.svelte` and, with `error`, by the route's `+error.svelte`
	 * (React Router's `ErrorBoundary` rendered `Component` with the error).
	 */
	let { error }: { error?: unknown } = $props()

	const fileSlug = $derived.by(() => {
		const slug = params.fileSlug
		if (!slug) throw Error('File id not found')
		return slug
	})
	const app = getMaybeApp()
	const isAppLoading = getIsAppLoading()
	const userId = $derived(app.current?.userId)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})

	// The embed search param hides the sidebar, and tells share-link tracking this is a host-page
	// view rather than a link follow, so it has to reach the editor on the anonymous path too.
	const isEmbed = $derived(!!searchParams.get('embed'))
</script>

{#if !app.current && !isAppLoading.current}
	<!--
		Override TlaEditor's internal ReadyWrapper. This prevents the anon layout chrome from rendering
		before the editor is ready.
	-->
	<ReadyWrapper>
		{#if error}
			<TlaFileError {error} />
		{:else}
			<TlaAnonLayout>
				{#key fileSlug}
					<TlaFileSyncHost {fileSlug}>
						<TlaEditor {fileSlug} deepLinks {isEmbed} />
					</TlaFileSyncHost>
				{/key}
			</TlaAnonLayout>
		{/if}
	</ReadyWrapper>
{:else if error}
	<TlaSidebarLayout collapsible {isEmbed}>
		<TlaFileError {error} />
	</TlaSidebarLayout>
{:else}
	<!--
		The layout is the stable ancestor: it survives both the app arriving and a file switch, so
		the sidebar is not rebuilt per file. The host is keyed by slug because useSync keeps
		reporting the old room's store as synced while a changed uri is still connecting.
	-->
	<TlaSidebarLayout collapsible {isEmbed}>
		{#key fileSlug}
			<TlaFileSyncHost {fileSlug}>
				{#if app.current}
					<TlaEditor {fileSlug} deepLinks {isEmbed} />
				{/if}
			</TlaFileSyncHost>
		{/key}
	</TlaSidebarLayout>
{/if}
