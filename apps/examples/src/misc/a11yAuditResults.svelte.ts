import type { A11yResults } from './a11y.svelte'

// The audit dialog is a component that only receives `onClose` from the dialogs manager, so the
// results it shows are handed over through this holder.
let results = $state.raw<A11yResults | null>(null)

export const a11yAuditResults = {
	get current() {
		return results
	},
	set(next: A11yResults | null) {
		results = next
	},
}
