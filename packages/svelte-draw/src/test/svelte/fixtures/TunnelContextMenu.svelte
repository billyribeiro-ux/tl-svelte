<script lang="ts">
	import DefaultContextMenu, {
		type TLUiContextMenuProps,
	} from '../../../lib/ui/components/ContextMenu/DefaultContextMenu.svelte'

	let props: TLUiContextMenuProps = $props()
</script>

<DefaultContextMenu {...props}>
	<button data-testid="abc123">Hello</button>
</DefaultContextMenu>
