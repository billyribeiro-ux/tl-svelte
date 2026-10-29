<script lang="ts">
	import { fetch } from 'svelte-draw'
	import { MULTIPLAYER_SERVER } from '../../utils/config'

	let elem = $state<HTMLDivElement | null>(null)
	let isAutoScroll = true

	async function onClear() {
		await fetch('/api/app/__debug-tail/clear', { method: 'POST' })
		elem!.innerHTML = ''
	}

	$effect(() => {
		const el = elem
		if (!el) return
		const socket = new WebSocket(MULTIPLAYER_SERVER + '/app/__debug-tail')
		socket.onmessage = (msg) => {
			const div = document.createElement('pre')
			div.textContent = msg.data
			el.appendChild(div)
			if (isAutoScroll) {
				el.scrollTo({ top: el.scrollHeight })
			}
		}
		socket.onerror = (err) => {
			console.error(err)
		}
		socket.onclose = () => {
			setTimeout(() => {
				window.location.reload()
			}, 500)
		}

		const onScroll = () => {
			isAutoScroll = el.scrollTop + el.clientHeight > el.scrollHeight - 100
		}
		const onKeyPress = (ev: KeyboardEvent) => {
			if (ev.key === 'k') {
				onClear()
			}
		}
		el.addEventListener('scroll', onScroll)
		window.addEventListener('keypress', onKeyPress)
		return () => {
			socket.close()
			el.removeEventListener('scroll', onScroll)
			window.removeEventListener('keypress', onKeyPress)
		}
	})
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	style="padding: 4px 8px; cursor: pointer; position: fixed; top: 0; right: 0"
	onclick={onClear}
>
	🗑️
</div>
<div bind:this={elem} style="font-family: monospace; overflow: scroll; height: 100vh"></div>
