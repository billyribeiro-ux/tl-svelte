<script lang="ts">
	import throttle from 'lodash/throttle'
	import { DefaultSpinner, SvelteDraw, createTLStore, getSnapshot, loadSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// There's a guide at the bottom of this file!

	const PERSISTENCE_KEY = 'example-3'

	// [1]
	const store = createTLStore()
	// [2]
	let loadingState = $state<
		{ status: 'loading' } | { status: 'ready' } | { status: 'error'; error: string }
	>({
		status: 'loading',
	})
	// [3]
	$effect.pre(() => {
		loadingState = { status: 'loading' }

		const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY)

		if (persistedSnapshot) {
			try {
				const snapshot = JSON.parse(persistedSnapshot)
				loadSnapshot(store, snapshot)
				loadingState = { status: 'ready' }
			} catch (error: any) {
				loadingState = { status: 'error', error: error.message }
			}
		} else {
			loadingState = { status: 'ready' }
		}

		// [4]
		const cleanupFn = store.listen(
			throttle(() => {
				const snapshot = getSnapshot(store)
				localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot))
			}, 500)
		)

		return () => {
			cleanupFn()
		}
	})
</script>

<!-- [5] -->
{#if loadingState.status === 'loading'}
	<div class="svelte-draw__editor">
		<h2>
			<DefaultSpinner />
		</h2>
	</div>
{:else if loadingState.status === 'error'}
	<div class="svelte-draw__editor">
		<h2>Error!</h2>
		<p>{loadingState.error}</p>
	</div>
{:else}
	<div class="svelte-draw__editor">
		<SvelteDraw {store} />
	</div>
{/if}

<!--
If all you want is local persistence, pass a `persistenceKey` to `SvelteDraw` and it will
save to IndexedDB for you. This example does the load/save loop by hand against
`localStorage` so you can see the pieces, and swap `localStorage` for your own backend.

[1]
Create the store ourselves rather than letting `SvelteDraw` do it, so we can load a snapshot
into it before the editor mounts. A component's instance script runs once, so the store is
stable.

[2]
A discriminated union for the loading state keeps the "error" branch from needing an
`error` field on the other states.

[3]
`$effect.pre` runs before the DOM updates, so if there's a saved snapshot the store
is populated before `SvelteDraw` renders. `loadSnapshot` replaces the store's contents and
runs any migrations needed for an older snapshot.

[4]
`store.listen` fires on every change. Serializing the whole document each time would be
wasteful, so the listener is throttled. The returned function removes the listener when
the component unmounts.

[5]
Render a spinner while loading, an error if the saved data couldn't be parsed, and the
editor once the store is ready.
-->
