<script lang="ts" module>
	export const ROOM_CONTEXT = {
		PUBLIC_MULTIPLAYER: 'public-multiplayer',
		PUBLIC_READONLY: 'public-readonly',
		PUBLIC_SNAPSHOT: 'public-snapshot',
		HISTORY_SNAPSHOT: 'history-snapshot',
		HISTORY: 'history',
		LOCAL: 'local',
	} as const
	type RoomContext = (typeof ROOM_CONTEXT)[keyof typeof ROOM_CONTEXT]

	const EMBEDDED_STATE = {
		IFRAME_OK: 'iframe-ok',
		IFRAME_NOT_ALLOWED: 'iframe-not-allowed',
		NOT_IFRAME: 'not-iframe',
	} as const
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getUrl } from '../hooks/useUrl.svelte'
	import TlaIcon from '../tla/components/TlaIcon/TlaIcon.svelte'
	import { trackEvent } from '../utils/analytics'
	import { getParentOrigin, isInIframe } from '../utils/iFrame'

	let {
		slug,
		context,
		children,
	}: { slug: string; context: RoomContext; children: Snippet } = $props()

	// Which routes do we allow to be embedded
	const WHITELIST_CONTEXT: RoomContext[] = [
		ROOM_CONTEXT.PUBLIC_MULTIPLAYER,
		ROOM_CONTEXT.PUBLIC_READONLY,
		ROOM_CONTEXT.PUBLIC_SNAPSHOT,
	]

	const embeddedState = $derived.by(() => {
		if (!isInIframe()) return EMBEDDED_STATE.NOT_IFRAME
		return WHITELIST_CONTEXT.includes(context)
			? EMBEDDED_STATE.IFRAME_OK
			: EMBEDDED_STATE.IFRAME_NOT_ALLOWED
	})

	const url = getUrl()

	$effect(() => {
		if (embeddedState === EMBEDDED_STATE.IFRAME_NOT_ALLOWED) {
			trackEvent('connect_to_room_in_iframe', { slug, context, origin: getParentOrigin() })
		}
	})
</script>

{#if embeddedState === EMBEDDED_STATE.IFRAME_NOT_ALLOWED}
	<!-- We're in an iframe and its not one of ours. -->
	<div class="svelte-draw__editor tl-container">
		<div class="iframe-warning__container">
			<a class="iframe-warning__link" href={url.current} rel="noopener noreferrer" target="_blank">
				Visit this page on svelte-draw.invalid
				<TlaIcon icon="external" inline />
			</a>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
