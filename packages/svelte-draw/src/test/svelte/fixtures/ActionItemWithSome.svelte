<script lang="ts">
	import SvelteDrawUiMenuActionItem from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SomeEnabled from './SomeEnabled.svelte'

	let { id }: { id: string } = $props()
</script>

<SvelteDrawUiMenuActionItem actionId={id} />
<SomeEnabled ids={[id]} />
