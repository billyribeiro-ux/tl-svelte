<script lang="ts">
	import { twJoin } from 'tailwind-merge'
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import { cn } from '#utils/cn.js'
	import Search from './Search.svelte'

	function isEditableElement(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return false
		return (
			target.isContentEditable ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT'
		)
	}

	let {
		type,
		layout,
		class: className,
	}: {
		type: 'docs' | 'blog'
		layout: 'mobile' | 'desktop' | 'keyboard-shortcut-only'
		class?: string
	} = $props()

	// The dialog is open for one page only: remembering where it was opened closes it on navigation.
	let openedOn = $state<string | null>(null)
	const open = $derived(openedOn === page.url.pathname)
	const setOpen = (value: boolean) => (openedOn = value ? page.url.pathname : null)

	$effect(() => {
		if (layout !== 'desktop' && layout !== 'keyboard-shortcut-only') return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/') {
				// A bare "/" is only a shortcut outside text fields, otherwise typing a path into
				// the feedback textarea opens the dialog and steals focus mid-word.
				if (isEditableElement(e.target)) return
				e.preventDefault()
				setOpen(true)
			} else if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				setOpen(!open)
			} else if (e.key === 'Escape') {
				setOpen(false)
			}
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	})

</script>

{#if layout === 'keyboard-shortcut-only'}
	{#if open}
		<Search {type} onClose={() => setOpen(false)} />
	{/if}
{:else}
	<div class={cn('group', className)}>
		<button
			class={cn(
				'flex items-center text-black dark:text-white focus:outline-none',
				layout === 'desktop' &&
					twJoin(
						'w-full h-10 justify-between bg-zinc-50 dark:bg-zinc-900 px-4 cursor-text',
						'hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg focus:ring-2',
						'focus:ring-blue-500'
					),
				layout === 'mobile' && 'w-8 h-8 justify-center rounded focus:bg-zinc-100 dark:focus:bg-zinc-800'
			)}
			onclick={() => setOpen(!open)}
		>
			<div class="flex items-center gap-3">
				{#if open}
					<Heroicon name="24/solid/XMark" class="h-6 md:hidden" />
				{:else}
					<Heroicon
						name="20/solid/MagnifyingGlass"
						class={cn('h-4', layout === 'mobile' && 'hidden')}
					/>
					<Heroicon
						name="24/solid/MagnifyingGlass"
						class={cn('h-6', layout === 'desktop' && 'hidden')}
					/>
				{/if}
				{#if !open}
					<span
						class={cn(
							'capitalize text-sm text-zinc-400 dark:text-zinc-600',
							layout === 'mobile' && 'hidden'
						)}
					>
						Search {type}…
					</span>
				{/if}
			</div>
			<span class={cn('text-xs', layout === 'mobile' && 'hidden')}>⌘K</span>
		</button>

		{#if open}
			<Search {type} onClose={() => setOpen(false)} />
		{/if}
	</div>
{/if}
