<script lang="ts">
	import type { Attachment } from 'svelte/attachments'
	import type { Example } from './examples.js'
	import HighlightedSearchText from './HighlightedSearchText.svelte'
	import SidebarIcon from './SidebarIcon.svelte'

	let {
		example,
		isActive,
		searchTerms,
		onInfo,
	}: {
		example: Example
		isActive?: boolean
		searchTerms: string[]
		onInfo(example: Example): void
	} = $props()

	// Keeps the active item in view when the list is scrolled away from it.
	const scrollIntoViewWhenActive: Attachment<HTMLLIElement> = (li) => {
		if (!isActive) return
		const rect = li.getBoundingClientRect()
		if (rect.top < 0 || rect.bottom > window.innerHeight) {
			li.scrollIntoView({ behavior: 'instant', block: 'start' })
		}
	}
</script>

<li {@attach scrollIntoViewWhenActive} class="examples__sidebar__item" data-active={isActive}>
	<a href={example.path} class="examples__sidebar__item__link" aria-label={example.title}></a>
	<div class="examples__sidebar__item__content">
		<span class="examples__sidebar__item__title">
			<HighlightedSearchText text={example.title} {searchTerms} />
		</span>
	</div>
	{#if isActive}
		<div class="example__sidebar__item__buttons">
			<button
				type="button"
				class="example__sidebar__item__button hoverable hoverable__small"
				onclick={() => onInfo(example)}
				aria-label="Info"
			>
				<SidebarIcon name="info" />
			</button>
			<a
				href="{example.path}/full"
				class="example__sidebar__item__button hoverable hoverable__small"
				aria-label="Standalone"
				title="View standalone example"
			>
				<SidebarIcon name="standalone" />
			</a>
		</div>
	{/if}
</li>
