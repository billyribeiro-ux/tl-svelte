<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fetch } from 'svelte-draw'
	import { enMessages } from '../../utils/enMessages'
	import { reportError } from '../../utils/errorReporting'
	import IntlProvider from '../../utils/IntlProvider.svelte'
	import type { IntlMessages } from '../../utils/intl'

	let { locale, children }: { locale: string; children: Snippet } = $props()

	let messages = $state.raw<IntlMessages>(enMessages)

	$effect(() => {
		const current = locale
		// Guard against a slower fetch for a previous locale landing after this one's and
		// overwriting it, and against a missing/invalid locale file becoming an unhandled rejection.
		let cancelled = false
		async function fetchMessages() {
			if (current === 'en') {
				messages = enMessages
				return
			}

			const res = await fetch(`/tla/locales-compiled/${current}.json`)
			if (!res.ok) throw new Error(`Failed to load locale ${current}: ${res.status}`)
			const loaded = (await res.json()) as IntlMessages
			if (cancelled) return
			messages = {
				...enMessages,
				...loaded,
			}
		}
		fetchMessages().catch((e) => {
			reportError(e)
			if (!cancelled) messages = enMessages
		})
		return () => {
			cancelled = true
		}
	})
</script>

<IntlProvider {locale} {messages}>
	{@render children()}
</IntlProvider>
