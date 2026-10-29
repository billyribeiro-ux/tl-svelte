<script lang="ts">
	import {
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
		SvelteDrawUiToolbar,
		SvelteDrawUiToolbarButton,
		ToolbarItem,
		fromComputed,
		getEditor,
		tlmenus,
	} from 'svelte-draw'
	import MathematicalIcon from './icons/MathematicalIcon.svelte'
	import { MATH_MENU_ID } from './mathMenu'

	// Custom toolbar item that provides mathematical operation nodeslity
	const id = 'mathematical'
	const labelStr = 'Math'
	const editor = getEditor()
	const isOpen = fromComputed('isOpen', () => tlmenus.isMenuOpen(MATH_MENU_ID, editor.contextId))
</script>

<SvelteDrawUiPopover
	id={MATH_MENU_ID}
	open={isOpen.current}
	onOpenChange={() => {
		tlmenus.addOpenMenu(MATH_MENU_ID, editor.contextId)
	}}
>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiToolbarButton
				{...props}
				aria-label={labelStr}
				data-testid={`tools.${id}`}
				data-value={id}
				title={labelStr}
				type="tool"
			>
				<MathematicalIcon />
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent side="right" align="center">
		<SvelteDrawUiToolbar label={labelStr} id={`${id}_math`}>
			<ToolbarItem tool="node-add" />
			<ToolbarItem tool="node-subtract" />
			<ToolbarItem tool="node-multiply" />
			<ToolbarItem tool="node-divide" />
		</SvelteDrawUiToolbar>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
