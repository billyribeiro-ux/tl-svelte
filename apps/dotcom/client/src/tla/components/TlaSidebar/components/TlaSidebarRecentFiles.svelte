<script lang="ts">
	import { F, fromComputed } from 'svelte-draw'
	import { getActiveWorkspaceId } from '../../../hooks/useActiveWorkspaceId.svelte'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getRelevantDates } from '../../../utils/dates'
	import type { RecentFile } from './sidebar-shared'
	import TlaSidebarActionButton from './TlaSidebarActionButton.svelte'
	import TlaSidebarFileLink from './TlaSidebarFileLink.svelte'
	import TlaSidebarFileSection from './TlaSidebarFileSection.svelte'
	import styles from '../sidebar.module.css'

	interface FileGroup {
		key: string
		files: RecentFile[]
		iconLeft?: string
		onePixelOfPaddingAtTheTop?: boolean
	}

	/**
	 * The scrollable lower region of the sidebar: the files of whichever space is
	 * currently active (derived from the open file). Pinned files come first, then
	 * the remaining files grouped by recency. There is no per-workspace expand/collapse.
	 */
	const app = getApp()
	const activeWorkspaceIdHolder = getActiveWorkspaceId()
	const activeWorkspaceId = $derived(activeWorkspaceIdHolder.current)
	const homeWorkspaceId = fromComputed('homeWorkspaceId', () => app.current.getHomeWorkspaceId())
	const isHome = $derived(activeWorkspaceId === homeWorkspaceId.current)

	// Recreated when the active workspace changes: a Svelte-reactive value read inside a
	// `fromComputed` callback would not invalidate the memoized computed.
	const filesState = $derived.by(() => {
		const workspaceId = activeWorkspaceId
		return fromComputed('active workspace files', () => {
			let files = app.current.getWorkspaceFilesSorted(workspaceId)

			// Filter by the sidebar search query, if any. Reading the signal here keeps
			// the list reactive to the query without threading it through props.
			const query = app.current.sidebarState.get().searchQuery.trim().toLowerCase()
			if (query) {
				files = files.filter((item) =>
					app.current.getFileName(item.fileId).toLowerCase().includes(query)
				)
			}

			const { today, yesterday, thisWeek, thisMonth } = getRelevantDates()

			const pinnedFiles: RecentFile[] = []
			const todayFiles: RecentFile[] = []
			const yesterdayFiles: RecentFile[] = []
			const thisWeekFiles: RecentFile[] = []
			const thisMonthFiles: RecentFile[] = []
			const olderFiles: RecentFile[] = []

			for (const item of files) {
				const { date, isPinned } = item
				if (isPinned) pinnedFiles.push(item)
				else if (date >= today) todayFiles.push(item)
				else if (date >= yesterday) yesterdayFiles.push(item)
				else if (date >= thisWeek) thisWeekFiles.push(item)
				else if (date >= thisMonth) thisMonthFiles.push(item)
				else olderFiles.push(item)
			}
			olderFiles.sort((a, b) => b.date - a.date)

			const groups: FileGroup[] = [
				{
					key: 'pinned',
					files: pinnedFiles,
					iconLeft: 'pin',
					onePixelOfPaddingAtTheTop: true,
				},
				{ key: 'today', files: todayFiles },
				{ key: 'yesterday', files: yesterdayFiles },
				{ key: 'this-week', files: thisWeekFiles },
				{ key: 'this-month', files: thisMonthFiles },
				{ key: 'older', files: olderFiles },
			]
			return { groups: groups.filter((g) => g.files.length > 0), isSearching: query.length > 0 }
		})
	})
	const groups = $derived(filesState.current.groups)
	const isSearching = $derived(filesState.current.isSearching)

	function handleClearSearch() {
		app.current.sidebarState.update((prev) => ({ ...prev, searchQuery: '' }))
	}
</script>

{#snippet groupTitle(key: string)}
	{#if key === 'pinned'}
		<F defaultMessage="Pinned" />
	{:else if key === 'today'}
		<F defaultMessage="Today" />
	{:else if key === 'yesterday'}
		<F defaultMessage="Yesterday" />
	{:else if key === 'this-week'}
		<F defaultMessage="This week" />
	{:else if key === 'this-month'}
		<F defaultMessage="This month" />
	{:else}
		<F defaultMessage="Older" />
	{/if}
{/snippet}

{#snippet clearSearchLabel()}
	<F defaultMessage="Clear search" />
{/snippet}

<div
	data-drop-target-id={isHome ? homeWorkspaceId.current : `workspace:${activeWorkspaceId}`}
	data-workspace-id={activeWorkspaceId}
>
	{#each groups as group (group.key)}
		<TlaSidebarFileSection
			iconLeft={group.iconLeft}
			onePixelOfPaddingAtTheTop={group.onePixelOfPaddingAtTheTop}
		>
			{#snippet title()}
				{@render groupTitle(group.key)}
			{/snippet}
			{#each group.files as item, i (item.fileId)}
				<TlaSidebarFileLink
					workspaceId={activeWorkspaceId}
					{item}
					testId={`tla-file-link-${group.key}-${i}`}
				/>
			{/each}
		</TlaSidebarFileSection>
	{/each}
	{#if isSearching && groups.length === 0}
		<div class={styles.sidebarSearchEmpty} data-testid="tla-sidebar-search-empty">
			<F defaultMessage="No files found" />
		</div>
	{/if}
	{#if isSearching}
		<!-- The same section wrapper as the workspace action rows, so the button gets the same
		     full width and vertical rhythm. The gap above comes from the file sections' own
		     bottom margin. -->
		<div class={styles.sidebarSection}>
			<TlaSidebarActionButton
				label={clearSearchLabel}
				onClick={handleClearSearch}
				testId="tla-sidebar-search-clear-button"
			/>
		</div>
	{/if}
</div>
