<script lang="ts" module>
	interface ScopedRoomId {
		roomId: string
		deployId: string
	}

	function getExampleKey(exampleSlug: string) {
		return `svelte-draw-example-room-${exampleSlug}`
	}

	function getRoomId(exampleSlug: string) {
		const key = getExampleKey(exampleSlug)
		const stored = JSON.parse(localStorage.getItem(key) ?? 'null') as null | ScopedRoomId
		if (stored && stored.deployId === process.env.SVELTE_DRAW_DEPLOY_ID) {
			return stored.roomId
		}
		return uniqueId()
	}

	function storeRoomId(exampleSlug: string, slug: string) {
		const key = getExampleKey(exampleSlug)
		localStorage.setItem(
			key,
			JSON.stringify({
				roomId: slug,
				deployId: process.env.SVELTE_DRAW_DEPLOY_ID!,
			} satisfies ScopedRoomId)
		)
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { uniqueId } from 'svelte-draw'
	import { onDestroy } from 'svelte'
	import type { Example, ExampleComponent } from '#lib/examples.js'

	let { example, component: Component }: { example: Example; component: ExampleComponent } =
		$props()

	let confirm = $state(false)
	let confirmTimeout: number | null = null

	function confirmFn() {
		if (confirmTimeout) {
			clearTimeout(confirmTimeout)
		}
		confirm = true
		confirmTimeout = window.setTimeout(() => {
			confirm = false
			confirmTimeout = null
		}, 3000)
	}

	onDestroy(() => {
		if (confirmTimeout) {
			clearTimeout(confirmTimeout)
		}
	})

	const exampleSlug = $derived(example.path.replace(/^\/?/g, ''))
	const roomIdParam = $derived(page.url.searchParams.get('roomId'))
	const roomId = $derived.by(() => {
		if (!example.multiplayer) return null
		const param = roomIdParam
		if (!param || typeof param !== 'string' || encodeURIComponent(param) !== param) {
			return getRoomId(exampleSlug)
		}
		return param
	})

	$effect(() => {
		if (roomId === null || roomId === roomIdParam) return
		storeRoomId(exampleSlug, roomId)
		const nextUrl = new URL(page.url.href)
		nextUrl.searchParams.set('roomId', roomId)
		void goto(nextUrl, { replace: true, reset: false })
	})
</script>

{#if !example.multiplayer}
	<Component />
{:else if roomId !== null}
	<div class="MultiplayerExampleWrapper">
		<div class="MultiplayerExampleWrapper-picker">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				width={16}
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
				/>
			</svg>
			<div>Live Example</div>
			<button
				class="MultiplayerExampleWrapper-copy"
				onclick={() => {
					// copy current url with roomId=roomId to clipboard
					const url = new URL(window.location.href)
					url.searchParams.set('roomId', roomId)
					navigator.clipboard.writeText(url.toString())
					confirmFn()
				}}
				aria-label="join"
			>
				Copy link
				{#if confirm}<div class="MultiplayerExampleWrapper-copied">Copied!</div>{/if}
			</button>
		</div>
		<div class="MultiplayerExampleWrapper-example">
			<Component {roomId} />
		</div>
	</div>
{/if}
