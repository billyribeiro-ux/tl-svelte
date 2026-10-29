import { fromComputed } from '@svelte-draw/svelte'
import { getContext, setContext } from 'svelte'
import type { SvelteDrawAgent } from './SvelteDrawAgent'
import type { SvelteDrawAgentApp } from './SvelteDrawAgentApp'

/**
 * The agent app only exists after the editor has mounted, so the context value is a holder whose
 * `current` is `null` until then (React passed the app itself through a Provider that was only
 * rendered once the app existed). Components read `holder.current` inside `{#if}` / `$derived`.
 */
export interface AgentAppHolder {
	readonly current: SvelteDrawAgentApp | null
}

const AGENT_APP_CONTEXT = Symbol('svelte-draw-agent-app')

/**
 * Provide the holder to descendants. Call during component initialisation. This replaces both
 * `SvelteDrawAgentAppContextProvider` (React) and the context set by `SvelteDrawAgentAppProvider`.
 */
export function setAgentAppHolder(holder: AgentAppHolder) {
	setContext(AGENT_APP_CONTEXT, holder)
}

/** The holder, or `null` outside a provider. */
export function tryGetAgentAppHolder(): AgentAppHolder | null {
	return getContext<AgentAppHolder | undefined>(AGENT_APP_CONTEXT) ?? null
}

/**
 * Get the SvelteDrawAgentApp instance from context. Call during component initialisation, from a
 * component that is only rendered once the app exists (under `{#if holder.current}`).
 *
 * @throws Error if called outside of a provider, or before the app exists
 */
export function getSvelteDrawAgentApp(): SvelteDrawAgentApp {
	const holder = tryGetAgentAppHolder()
	const app = holder?.current
	if (!app) {
		throw new Error('getSvelteDrawAgentApp must be used inside a SvelteDrawAgentAppProvider')
	}
	return app
}

/**
 * Reactive view of the default SvelteDrawAgent. Read `.current` (guaranteed non-null) in a
 * template or `$derived`. Call during component initialisation.
 *
 * @throws Error when read and no agent exists
 */
export function getAgent(): { readonly current: SvelteDrawAgent } {
	const app = getSvelteDrawAgentApp()
	const agent = fromComputed('agent', () => app.agents.getAgent())
	return {
		get current() {
			const value = agent.current
			if (!value) {
				throw new Error('No agent found. Make sure an agent has been created.')
			}
			return value
		},
	}
}

/**
 * Reactive array of all SvelteDrawAgent instances; updates when agents are added or removed.
 * Call during component initialisation.
 */
export function getAgents(): { readonly current: SvelteDrawAgent[] } {
	const app = getSvelteDrawAgentApp()
	return fromComputed('agents', () => app.agents.getAgents())
}
