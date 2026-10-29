<script lang="ts">
	import type { Editor } from 'svelte-draw'
	import { getNodeDefinitions } from '../nodes/nodeTypes'
	import SidebarItem from './SidebarItem.svelte'

	const CATEGORY_LABELS: Record<string, string> = {
		input: 'Input',
		process: 'Process',
		output: 'Output',
		utility: 'Utility',
	}

	const CATEGORY_ORDER = ['input', 'process', 'output', 'utility']

	let { editor }: { editor: Editor } = $props()

	const defs = $derived(getNodeDefinitions(editor))

	// Group definitions by category
	const grouped = $derived.by(() => {
		const grouped: Record<string, (typeof defs)[keyof typeof defs][]> = {}
		for (const def of Object.values(defs)) {
			const cat = def.category
			if (!grouped[cat]) grouped[cat] = []
			if (def.hidden) continue
			grouped[cat].push(def)
		}
		return grouped
	})
</script>

<div class="ImagePipelineSidebar tl-theme__light">
	<div class="ImagePipelineSidebar-header">Nodes</div>
	<div class="ImagePipelineSidebar-list">
		{#each CATEGORY_ORDER as cat (cat)}
			{@const items = grouped[cat]}
			{#if items?.length}
				<div class="ImagePipelineSidebar-group">
					<div class="ImagePipelineSidebar-category">{CATEGORY_LABELS[cat] ?? cat}</div>
					{#each items as def (def.type)}
						<SidebarItem
							{editor}
							title={def.title}
							icon={def.icon}
							getDefault={() => def.getDefault()}
						/>
					{/each}
				</div>
			{/if}
		{/each}
	</div>
</div>
