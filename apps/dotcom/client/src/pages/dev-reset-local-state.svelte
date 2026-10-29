<script lang="ts">
	import { getClerk } from '../utils/clerk.svelte'

	/* eslint-disable svelte-draw/jsx-no-literals, svelte-draw/no-direct-storage */

	type ResetState =
		| { status: 'running'; completed: string[] }
		| { status: 'complete'; completed: string[] }
		| { status: 'error'; completed: string[]; error: string }

	function deleteIndexedDb(name: string) {
		return new Promise<void>((resolve) => {
			const request = indexedDB.deleteDatabase(name)
			request.onsuccess = () => resolve()
			request.onerror = () => resolve()
			request.onblocked = () => resolve()
		})
	}

	async function clearIndexedDbs() {
		if (!('indexedDB' in window)) return
		if (!indexedDB.databases) return

		const databases = await indexedDB.databases()
		const names = databases.flatMap((database) => (database.name ? [database.name] : []))
		await Promise.all(names.map((name) => deleteIndexedDb(name)))
	}

	async function clearCacheStorage() {
		if (!('caches' in window)) return
		const keys = await caches.keys()
		await Promise.all(keys.map((key) => caches.delete(key)))
	}

	async function unregisterServiceWorkers() {
		if (!('serviceWorker' in navigator)) return
		const registrations = await navigator.serviceWorker.getRegistrations()
		await Promise.all(registrations.map((registration) => registration.unregister()))
	}

	function clearAccessibleCookies() {
		const cookies = document.cookie
			.split(';')
			.map((cookie) => cookie.trim().split('=')[0])
			.filter(Boolean)

		for (const name of cookies) {
			document.cookie = `${name}=; Max-Age=0; path=/`
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
		}
	}

	const clerk = getClerk()
	let state = $state<ResetState>({ status: 'running', completed: [] })

	$effect(() => {
		let cancelled = false
		const completed: string[] = []

		function mark(label: string) {
			completed.push(label)
			if (!cancelled) {
				state = { status: 'running', completed: [...completed] }
			}
		}

		async function run() {
			try {
				await clerk.signOut().catch(() => undefined)
				mark('Signed out')

				localStorage.clear()
				mark('Cleared local storage')

				sessionStorage.clear()
				mark('Cleared session storage')

				await clearCacheStorage()
				mark('Cleared cache storage')

				clearAccessibleCookies()
				mark('Cleared accessible cookies')

				await clearIndexedDbs()
				mark('Cleared IndexedDB databases')

				await unregisterServiceWorkers()
				mark('Unregistered service workers')

				if (!cancelled) {
					state = { status: 'complete', completed }
				}
			} catch (error) {
				if (!cancelled) {
					state = {
						status: 'error',
						completed,
						error: error instanceof Error ? error.message : String(error),
					}
				}
			}
		}

		run()

		return () => {
			cancelled = true
		}
	})
</script>

<svelte:head>
	<meta name="robots" content="noindex, noimageindex, nofollow" />
</svelte:head>

<main
	style="min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f7f7f4; color: #111; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
>
	<section
		style="width: min(100%, 520px); border: 1px solid #d7d7d2; background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 8px 28px rgb(0 0 0 / 8%);"
	>
		<h1 style="font-size: 22px; line-height: 1.2; margin: 0 0 12px;">Local dev state reset</h1>
		<p style="margin: 0 0 20px; color: #555; line-height: 1.5;">
			{state.status === 'complete'
				? 'Browser-local state for this origin has been cleared.'
				: state.status === 'error'
					? 'The reset did not finish.'
					: 'Clearing browser-local state for this origin...'}
		</p>
		<ul style="margin: 0 0 20px; padding-left: 20px; line-height: 1.8;">
			{#each state.completed as item (item)}
				<li>{item}</li>
			{/each}
		</ul>
		{#if state.status === 'error'}
			<p style="color: #b42318; margin: 0 0 20px;">{state.error}</p>
		{/if}
		<a style="color: #1f6feb; font-weight: 600;" href="/">Return home</a>
	</section>
</main>
