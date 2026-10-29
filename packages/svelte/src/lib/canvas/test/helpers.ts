import './setup'
import { flushSync } from 'svelte'

/** Flushes Svelte effects and pending microtasks/timers: the equivalent of React's `act(async)`. */
export async function flush(ms = 0) {
	flushSync()
	await new Promise((resolve) => setTimeout(resolve, ms))
	flushSync()
}
