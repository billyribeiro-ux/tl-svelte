<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAnchorAttributes } from 'svelte/elements'
	import { trackEvent } from '../../../utils/analytics'

	/**
	 * React took `to` (react-router `Link`); an anchor takes `href`. Use an absolute path or URL.
	 */
	let {
		eventName,
		children,
		onclick,
		...rest
	}: Omit<HTMLAnchorAttributes, 'children' | 'target' | 'rel'> & {
		eventName?: string
		children?: Snippet
	} = $props()
</script>

<a
	{...rest}
	target="_blank"
	rel="noopener noreferrer"
	onclick={(e) => {
		if (eventName) trackEvent(eventName, { link: rest.href ?? '' })
		onclick?.(e)
	}}
>
	{@render children?.()}
</a>
