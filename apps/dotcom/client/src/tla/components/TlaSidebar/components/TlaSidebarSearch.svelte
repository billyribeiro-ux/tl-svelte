<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		search: { defaultMessage: 'Search...' },
		clearSearch: { defaultMessage: 'Clear search' },
	})
</script>

<script lang="ts">
	import {
		fromComputed,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiInput,
	} from 'svelte-draw'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import styles from '../sidebar.module.css'

	/**
	 * The sidebar search action. It renders as a regular action row until the user
	 * clicks it, at which point it becomes an inline input (like renaming a file)
	 * that filters the file list below as you type. An X button — shown once the
	 * field has text — clears it, and clicking away from an empty field, or pressing
	 * Escape, exits search.
	 */
	const msg = getTranslation()
	const app = getApp()
	let isSearching = $state(false)
	let query = $state('')
	let inputRef = $state<HTMLInputElement | null>(null)

	const searchLbl = $derived(msg(messages.search))
	const clearLbl = $derived(msg(messages.clearSearch))

	function setQuery(searchQuery: string) {
		query = searchQuery
		app.current.sidebarState.update((prev) => ({ ...prev, searchQuery }))
	}

	function handleOpen() {
		isSearching = true
	}

	function handleClose() {
		isSearching = false
		setQuery('')
	}

	function handleClear() {
		const input = inputRef
		if (input) {
			input.value = ''
			// Clear without focusing the field: blur it if it currently has focus,
			// and leave it blurred if it doesn't. Clicking the X should never pull
			// focus into the search input.
			input.blur()
		}
		setQuery('')
	}

	function handleBlur(value: string) {
		// Leave search mode when focus moves away from an empty field. A
		// non-empty field stays open so the filter survives clicking a result.
		if (!value.trim()) handleClose()
	}

	// The search can also be cleared from outside this component (the "Clear
	// search" button at the bottom of the file list). When that happens the shared
	// query empties while our input still shows its text, so reset the input and
	// collapse back to the search action row, matching what the X button does.
	const searchQuery = fromComputed(
		'sidebar search query',
		() => app.current.sidebarState.get().searchQuery
	)
	$effect(() => {
		if (searchQuery.current === '' && query !== '') {
			if (inputRef) inputRef.value = ''
			handleClose()
		}
	})
</script>

{#if !isSearching}
	<button
		class={[styles.sidebarActionButton, styles.hoverable, 'tla-text_ui__regular']}
		onclick={handleOpen}
		data-testid="tla-sidebar-search"
	>
		<TlaIcon icon="search" />
		<span class={styles.sidebarActionButtonLabel}>{searchLbl}</span>
	</button>
{:else}
	<div class={[styles.sidebarSearch, styles.hoverable]} data-testid="tla-sidebar-search-row">
		<TlaIcon icon="search" class={styles.sidebarSearchIcon} />
		<SvelteDrawUiInput
			bind:ref={inputRef}
			class={[styles.sidebarSearchInput, 'tla-text_ui__regular'].join(' ')}
			placeholder={searchLbl}
			onValueChange={setQuery}
			onCancel={handleClose}
			onBlur={handleBlur}
			autoFocus
			autoSelect
			data-testid="tla-sidebar-search-input"
		/>
		{#if query.length > 0}
			<SvelteDrawUiButton
				type="icon"
				class={styles.sidebarSearchClear}
				onclick={handleClear}
				tooltip={clearLbl}
				title={clearLbl}
				data-testid="tla-sidebar-search-clear"
			>
				<TlaIcon icon="close" style="width: 12px; height: 12px" />
			</SvelteDrawUiButton>
		{/if}
	</div>
{/if}
