<script lang="ts">
	import SvelteDrawUiMenuActionItem, {
		type TLUiMenuActionItemProps,
	} from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuActionItem.svelte'

	let props: TLUiMenuActionItemProps = $props()
</script>

<SvelteDrawUiMenuActionItem {...props} />
