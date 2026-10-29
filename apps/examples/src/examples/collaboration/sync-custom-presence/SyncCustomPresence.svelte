<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import { SvelteDraw, atom, getDefaultUserPresence } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	let { roomId }: { roomId?: string } = $props()

	// [1]
	const timer = atom('timer', Date.now())
	$effect(() => {
		let frame = requestAnimationFrame(function tick() {
			timer.set(Date.now())
			frame = requestAnimationFrame(tick)
		})
		return () => cancelAnimationFrame(frame)
	})

	// [2]
	const sync = createSyncDemo(() => ({
		roomId: roomId!,
		getUserPresence(store, user) {
			// [3]
			const defaults = getDefaultUserPresence(store, user)
			if (!defaults) return null

			return {
				...defaults,

				// [4]
				camera: undefined,

				// [5]
				cursor: {
					...defaults.cursor,
					x: defaults.cursor.x + 20 * Math.sin(timer.get() / 200),
					y: defaults.cursor.y + 20 * Math.cos(timer.get() / 200),
				},
			}
		},
	}))
</script>

<div class="svelte-draw__editor">
	<SvelteDraw store={sync.current} options={{ deepLinks: true }} />
</div>

<!--
Presence is the per-user state (cursor, camera, selection, and so on) that sync broadcasts to every
other client. `getUserPresence` lets you change what gets sent: strip out fields your app doesn't
need, or add to them.

[1]
A timer that ticks every frame, held in an atom. `getUserPresence` runs inside a computed signal, so
reading the atom there re-derives the presence whenever it changes. You don't need this in a real
app; it's only here to animate the cursor.

[2]
`createSyncDemo` accepts a `getUserPresence` function that replaces the default derivation.

[3]
Start from `getDefaultUserPresence` so the usual fields are still sent. It returns null before the
editor's instance state exists, so pass that through.

[4]
Setting a field to `undefined` drops it, and the record falls back to its default (`null` here). Other
clients won't be able to follow this user's viewport.

[5]
Offset the cursor by the timer, so it orbits its true position on other clients' screens.
-->
