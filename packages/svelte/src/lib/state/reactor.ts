import { EffectScheduler } from '@svelte-draw/state'

/**
 * Runs `fn` immediately and again, synchronously, whenever a signal it reads changes. Returns a
 * function that stops the reactor. Call it from `$effect` and return the result as its teardown.
 *
 * @example
 * ```ts
 * $effect(() => quickReactor('position layers', () => { el.style.transform = getTransform(editor) }))
 * ```
 */
export function quickReactor(name: string, fn: () => void): () => void {
	const scheduler = new EffectScheduler(name, fn)
	scheduler.attach()
	scheduler.execute()
	return () => scheduler.detach()
}
