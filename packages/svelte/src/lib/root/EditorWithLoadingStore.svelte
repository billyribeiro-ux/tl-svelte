<script lang="ts">
	import { getGlobalWindow, type TLCurrentUser, type TLStoreWithStatus } from '@svelte-draw/editor'
	import type { SvelteDrawOptions } from '@svelte-draw/editor'
	import { getEditorComponents } from '../canvas/componentsContext'
	import { getContainer } from '../context/editor'
	import Crash from './Crash.svelte'
	import EditorWithReadyStore from './EditorWithReadyStore.svelte'
	import type { SvelteDrawEditorAllProps } from './types'

	let {
		props,
		store,
		user,
		options,
	}: {
		props: SvelteDrawEditorAllProps
		store: TLStoreWithStatus
		user: TLCurrentUser
		options: Partial<SvelteDrawOptions> | undefined
	} = $props()

	const container = getContainer()
	const components = getEditorComponents()
	const LoadingScreen = $derived(components.LoadingScreen)

	$effect.pre(() => {
		// Resolve the scheme the same way UserPreferencesManager.getIsDarkMode will once the
		// editor mounts, so a 'system' user on a dark OS doesn't get a light loading screen that
		// flips dark on mount.
		const scheme = user.userPreferences.get().colorScheme ?? props.colorScheme ?? 'light'
		const isDark =
			scheme === 'dark' ||
			(scheme === 'system' &&
				typeof window !== 'undefined' &&
				!!getGlobalWindow().matchMedia?.('(prefers-color-scheme: dark)').matches)
		if (isDark) {
			container.classList.remove('tl-theme__light')
			container.classList.add('tl-theme__dark')
		}
	})
</script>

<!--
	for error handling, we fall back to the default error boundary. if users want to handle this
	error differently, they can render their own error screen before the SvelteDrawEditor component
-->
{#if store.status === 'error'}
	<Crash error={store.error} />
{:else if store.status === 'loading'}
	{#if LoadingScreen}
		<LoadingScreen />
	{/if}
{:else}
	<EditorWithReadyStore {props} store={store.store} {user} {options} />
{/if}
