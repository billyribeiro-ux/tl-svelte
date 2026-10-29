<script lang="ts">
	/** Collects every action and tool that has a kbd. Tests only. */
	import { SKIP_KBDS } from '../../../lib/ui/hooks/useKeyboardShortcuts.svelte'
	import { getTools } from '../../../lib/ui/hooks/useTools.svelte'
	import { getActions } from '../../../lib/ui/context/actions.svelte'

	export interface ShortcutEntry {
		id: string
		kbd: string
	}

	let { onCapture }: { onCapture(entries: ShortcutEntry[]): void } = $props()

	const actions = getActions()
	const tools = getTools()

	$effect(() => {
		const entries: ShortcutEntry[] = []
		for (const action of Object.values(actions)) {
			if (!action.kbd || SKIP_KBDS.includes(action.id)) continue
			entries.push({ id: `action.${action.id}`, kbd: action.kbd })
		}
		for (const tool of Object.values(tools.current)) {
			if (!tool.kbd || SKIP_KBDS.includes(tool.id)) continue
			entries.push({ id: `tool.${tool.id}`, kbd: tool.kbd })
		}
		onCapture(entries)
	})
</script>
