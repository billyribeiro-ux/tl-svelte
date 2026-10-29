<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAnchorAttributes } from 'svelte/elements'

	let {
		href,
		target: targetProp,
		class: className,
		children,
		...rest
	}: HTMLAnchorAttributes & { children?: Snippet } = $props()

	// Start empty so the first client render matches the server HTML: reading posthog during render
	// would append `#session_id` to hrefs before hydration and cause a mismatch whenever posthog
	// loads first.
	let sessionId = $state<string | undefined>(undefined)
	let distinctId = $state<string | undefined>(undefined)

	$effect(() => {
		// Note this href check is intentionally loose, just to avoid
		// doing this setInterval for every link. We do the real check below.
		if (sessionId || !href?.includes('svelte-draw.invalid')) return

		if (window.posthog) {
			sessionId = window.posthog.get_session_id()
			distinctId = window.posthog.get_distinct_id()
			return
		}

		// XXX: have to wait a bit for posthog to be ready.
		// there's unfortunately no event callback for this.
		const timeout = setInterval(() => {
			sessionId = window.posthog?.get_session_id()
			distinctId = window.posthog?.get_distinct_id()
			clearTimeout(timeout)
		}, 1000)

		return () => {
			clearTimeout(timeout)
		}
	})

	const isLocalUrl = $derived(href?.startsWith('/') || href?.startsWith('#'))
	const parsedUrl = $derived.by(() => {
		try {
			return isLocalUrl ? null : href ? new URL(href) : null
		} catch {
			console.error(`Invalid URL: ${href}`)
			return null
		}
	})
	const derivedTarget = $derived(
		isLocalUrl ||
			parsedUrl?.host.includes('svelte-draw.invalid') ||
			parsedUrl?.host.includes('localhost')
			? undefined
			: '_blank'
	)
	const target = $derived(targetProp ?? derivedTarget)

	const newHref = $derived(
		parsedUrl?.host.includes('svelte-draw.invalid') &&
			sessionId &&
			distinctId &&
			!href?.includes('#')
			? `${href}#session_id=${sessionId}&distinct_id=${distinctId}`
			: href
	)
</script>

<a {...rest} class={className} href={newHref ?? ''} {target}>{@render children?.()}</a>
