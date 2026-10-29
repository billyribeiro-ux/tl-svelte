import type { Editor } from '@svelte-draw/editor'
import { fireEvent as domFireEvent } from '@testing-library/dom'
import { flushSync, mount, unmount, type Component } from 'svelte'
import { expect, vi } from 'vitest'
import type { SvelteDrawProps } from '../../lib/SvelteDraw.svelte'
import { flush } from './helpers'
import './setup'
import SvelteDrawHost from './SvelteDrawHost.svelte'

export interface RenderedSvelteDraw {
	editor: Editor
	/** The element the editor was mounted into. */
	target: HTMLElement
	/** `screen.findByTestId` equivalent, scoped to the document. */
	findByTestId(id: string): Promise<HTMLElement>
	unmount(): void
}

/** `data-testid` lookup on the whole document (the equivalent of RTL's `screen`). */
export function byTestId(id: string): HTMLElement | null {
	return document.querySelector(`[data-testid="${id.replace(/["\\]/g, '\\$&')}"]`)
}

/** `screen.findByTestId` equivalent that does not hand the element to `vi.waitFor`. */
async function findByTestIdInDocument(id: string): Promise<HTMLElement> {
	await vi.waitFor(
		() => {
			if (!byTestId(id)) throw new Error(`no element with data-testid=${id}`)
		},
		{ timeout: 5000 }
	)
	return byTestId(id)!
}

/**
 * Mounts `<SvelteDraw />` and resolves once the canvas is rendered and `onMount` fired. The
 * equivalent of React's `renderSvelteDrawComponentWithEditor`. `waitForPatterns` waits for the
 * pre-rendered fill patterns.
 */
export async function renderSvelteDraw(
	props: Partial<SvelteDrawProps> = {},
	{
		waitForPatterns = false,
		child,
		childProps,
	}: {
		waitForPatterns?: boolean
		/** A component rendered inside the editor and UI context (React's JSX children). */
		child?: Component<any>
		childProps?: Record<string, unknown>
	} = {}
): Promise<RenderedSvelteDraw> {
	const target = document.createElement('div')
	document.body.appendChild(target)
	let editor: Editor | undefined
	const userOnMount = props.onMount
	const component = mount(SvelteDrawHost, {
		target,
		props: {
			drawProps: {
				...props,
				onMount: (e: Editor) => {
					editor = e
					return userOnMount?.(e)
				},
			} as SvelteDrawProps,
			child,
			childProps,
		},
	})
	flushSync()
	await vi.waitFor(() => expect(editor).toBeDefined(), { timeout: 5000 })
	await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas"]')).not.toBeNull(), {
		timeout: 5000,
	})
	if (waitForPatterns) {
		await vi.waitFor(() => expect(byTestId('ready-pattern-fill-defs')).not.toBeNull(), {
			timeout: 5000,
		})
	}
	return {
		editor: editor!,
		target,
		findByTestId: (id) => findByTestIdInDocument(id),
		unmount() {
			unmount(component)
			target.remove()
		},
	}
}

export { screen, waitFor, within } from '@testing-library/dom'

/**
 * The equivalent of React's `act`: runs `fn`, then flushes Svelte effects (and, for an async `fn`,
 * its pending microtasks) before returning.
 */
export function act(fn: () => void): void
export function act(fn: () => Promise<void>): Promise<void>
export function act(fn: () => void | Promise<void>): void | Promise<void> {
	const result = fn()
	if (result && typeof (result as Promise<void>).then === 'function') {
		return (result as Promise<void>).then(async () => {
			await flush()
		})
	}
	flushSync()
}

type FireEvent = typeof domFireEvent
function wrapFire(): FireEvent {
	const wrapped = ((el: Element | Document | Window, event: Event) => {
		const result = domFireEvent(el, event)
		flushSync()
		return result
	}) as FireEvent
	for (const key of Object.keys(domFireEvent) as (keyof FireEvent)[]) {
		;(wrapped as any)[key] = (el: Element, init?: object) => {
			const result = (domFireEvent as any)[key](el, init)
			flushSync()
			return result
		}
	}
	return wrapped
}
/** `@testing-library/dom`'s `fireEvent`, flushing Svelte effects after every event. */
export const fireEvent = wrapFire()
