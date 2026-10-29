<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { twJoin } from 'tailwind-merge'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import { type SearchSession, hitHref } from '#lib/search/search.svelte.js'
	import SearchResults from './SearchResults.svelte'

	let { session, onClose }: { session: SearchSession; onClose: () => void } = $props()

	const listId = $props.id()

	let value = $state('')
	let activeIndex = $state(-1)

	function handleOpenChange(open: boolean) {
		if (!open) onClose()
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.value
		activeIndex = -1
		session.refineDebounced(value)
	}

	function handleKeyDown(e: KeyboardEvent) {
		const count = session.hits.length
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			activeIndex = Math.min(activeIndex + 1, count - 1)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			activeIndex = Math.max(activeIndex - 1, -1)
		} else if (e.key === 'Enter') {
			const hit = activeIndex >= 0 ? session.hits[activeIndex] : undefined
			if (hit) {
				// Choosing a result: navigate to it and close the dialog.
				void goto(hitHref(hit))
				onClose()
				return
			}
			const searchPath = page.url.pathname.startsWith('/blog') ? '/search/blog' : '/search'
			void goto(`${searchPath}?query=${encodeURIComponent(value.trim())}`)
		}
	}
</script>

<div
	class={twJoin(
		'fixed w-screen h-screen left-0 top-14 sm:top-[6.5rem] md:top-0 z-40',
		'bg-white/90 dark:bg-zinc-950/90 pointer-events-none'
	)}
>
	<Dialog.Root open onOpenChange={handleOpenChange}>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content class="fixed inset-0 z-50" style="pointer-events: none">
				<div class="sr-only">
					<Dialog.Title>Search</Dialog.Title>
					<Dialog.Description>Search dialog</Dialog.Description>
				</div>
				<div class="w-full max-w-3xl mx-auto px-5 lg:px-12 pt-[4.5rem]">
					<div
						class={twJoin(
							'pointer-events-auto bg-zinc-50 dark:bg-zinc-900 rounded-lg',
							'overflow-hidden focus-within:ring-2 focus-within:ring-blue-500'
						)}
					>
						<div class="w-full h-10 flex items-center px-4">
							<div class="flex h-full grow items-center gap-3">
								<Heroicon name="20/solid/MagnifyingGlass" class="h-4 shrink-0" />
								<input
									class="h-full w-full mr-4 focus:outline-none text-black dark:text-white bg-transparent"
									type="text"
									role="combobox"
									aria-expanded="true"
									aria-controls={listId}
									aria-activedescendant={activeIndex >= 0
										? `${listId}-option-${activeIndex}`
										: undefined}
									aria-autocomplete="list"
									autocomplete="off"
									placeholder="Search..."
									{value}
									oninput={handleInput}
									onkeydown={handleKeyDown}
								/>
							</div>
						</div>
						<SearchResults
							hits={session.hits}
							{activeIndex}
							{listId}
							variant="dialog"
							onactivate={(index) => (activeIndex = index)}
						/>
					</div>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>
