<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createIntl, setIntl, type IntlMessages } from './intl'

	/** `<IntlProvider>`: makes `getIntl()` work for the children. */
	let {
		locale,
		messages,
		children,
	}: { locale: string; messages: IntlMessages; children: Snippet } = $props()

	// A fresh Intl per (locale, messages) change; the holder itself never changes identity.
	const intl = $derived(createIntl({ locale, messages }))
	setIntl({
		get current() {
			return intl
		},
	})
</script>

{@render children()}
