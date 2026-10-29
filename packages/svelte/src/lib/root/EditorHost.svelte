<script lang="ts">
	import { Store, type SvelteDrawOptions, type TLCurrentUser } from '@svelte-draw/editor'
	import { setEditorComponents } from '../canvas/componentsContext'
	import { setContainer } from '../context/editor'
	import DefaultErrorFallback from './DefaultErrorFallback.svelte'
	import EditorWithLoadingStore from './EditorWithLoadingStore.svelte'
	import EditorWithOwnStore from './EditorWithOwnStore.svelte'
	import EditorWithReadyStore from './EditorWithReadyStore.svelte'
	import type { SvelteDrawEditorAllProps } from './types'

	let {
		container,
		props,
		user,
		options,
	}: {
		container: HTMLElement
		props: SvelteDrawEditorAllProps
		user: TLCurrentUser
		options: Partial<SvelteDrawOptions> | undefined
	} = $props()

	// The container is fixed for the lifetime of this component: it is only rendered once the
	// container element exists.
	// svelte-ignore state_referenced_locally
	setContainer(container)
	setEditorComponents(() => props.components, { ErrorFallback: DefaultErrorFallback })
</script>

{#if props.store}
	{#if props.store instanceof Store}
		<!-- Store is ready to go, whether externally synced or not -->
		<EditorWithReadyStore {props} store={props.store} {user} {options} />
	{:else}
		<!-- Store is a synced store, so handle syncing stages internally -->
		<EditorWithLoadingStore {props} store={props.store} {user} {options} />
	{/if}
{:else}
	<!-- We have no store (it's undefined) so create one and possibly sync it -->
	<EditorWithOwnStore {props} {user} {options} />
{/if}
