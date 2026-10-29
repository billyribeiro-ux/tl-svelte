<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { SvelteDrawAgentApp } from './SvelteDrawAgentApp'

	export interface SvelteDrawAgentAppProviderProps {
		children?: Snippet
		/**
		 * Callback fired when the app is created. Use this to pass the app
		 * to components outside the SvelteDraw component, e.g. by storing it in a holder
		 * passed to `setAgentAppHolder`.
		 */
		onMount?: (app: SvelteDrawAgentApp) => void
		/**
		 * Callback fired when the app is disposed.
		 */
		onUnmount?: () => void
	}
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import { getToasts } from 'svelte-draw'
	import { setAgentAppHolder } from './agentAppContext'
	import { SvelteDrawAgentApp as AgentApp } from './SvelteDrawAgentApp'

	/**
	 * Component that creates and manages a SvelteDrawAgentApp instance for the current editor.
	 *
	 * This component should be rendered inside a `<SvelteDraw>` component to have access to the editor context.
	 * It creates a SvelteDrawAgentApp instance, provides it via context, and cleans up on unmount.
	 *
	 * The provider waits until the app and agent exist before rendering children,
	 * ensuring `getAgent()` always returns a valid agent.
	 *
	 * For components defined in SvelteDraw's `components` prop, those are rendered inside the
	 * `<SvelteDraw>` subtree of whoever renders it: call `setAgentAppHolder` there (see `App.svelte`)
	 * and use `onMount` to fill the holder.
	 *
	 * @example
	 * ```svelte
	 * // in the parent's script block:
	 * let app = $state.raw<SvelteDrawAgentApp | null>(null)
	 * setAgentAppHolder({ get current() { return app } })
	 *
	 * // in the parent's markup:
	 * <SvelteDraw {components}>
	 *   <SvelteDrawAgentAppProvider onMount={(a) => (app = a)} onUnmount={() => (app = null)} />
	 * </SvelteDraw>
	 * ```
	 */
	let { children, onMount, onUnmount }: SvelteDrawAgentAppProviderProps = $props()

	const editor = getEditor()
	const toasts = getToasts()
	let app = $state.raw<AgentApp | null>(null)

	// Children read the app through context; it is null until the effect below has run.
	setAgentAppHolder({
		get current() {
			return app
		},
	})

	// Error handler for agent errors
	function handleError(e: any) {
		const message = typeof e === 'string' ? e : e instanceof Error && e.message
		toasts.addToast({
			title: 'Error',
			description: message || 'An error occurred',
			severity: 'error',
		})
		console.error(e)
	}

	// Create the SvelteDrawAgentApp instance
	$effect(() => {
		const instance = new AgentApp(editor, { onError: handleError })

		// Load persisted state first (this will create agents from persisted data)
		instance.persistence.loadState()

		// Ensure at least one agent exists (creates one if none were loaded)
		const defaultAgent = instance.agents.ensureAtLeastOneAgent()

		// Start auto-saving (must be after loadState to avoid saving during load)
		instance.persistence.startAutoSave()

		app = instance

		// Notify parent
		onMount?.(instance)

		// Expose to window for debugging
		;(window as any).agentApp = instance
		;(window as any).agent = defaultAgent
		;(window as any).editor = editor

		return () => {
			instance.dispose()
			app = null
			onUnmount?.()
			delete (window as any).agentApp
			delete (window as any).agent
			delete (window as any).editor
		}
	})
</script>

<!-- Don't render children until app exists -->
{#if app}
	{@render children?.()}
{/if}
