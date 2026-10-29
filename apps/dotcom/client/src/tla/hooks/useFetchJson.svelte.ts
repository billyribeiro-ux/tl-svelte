import { fetch } from 'svelte-draw'

/** `.current` is undefined while loading and null if the request fails. */
export function getFetchJson<T>(url: () => string): { readonly current: T | null | undefined } {
	let result = $state.raw<{ url: string; data: T | null }>()

	$effect(() => {
		const currentUrl = url()
		const controller = new AbortController()
		const { signal } = controller

		async function load(): Promise<T | null> {
			const res = await fetch(currentUrl, { signal })
			return res.ok ? ((await res.json()) as T) : null
		}

		load()
			.catch(() => null)
			.then((data) => {
				if (!signal.aborted) result = { url: currentUrl, data }
			})

		return () => controller.abort()
	})

	return {
		get current() {
			return result?.url === url() ? result.data : undefined
		},
	}
}
