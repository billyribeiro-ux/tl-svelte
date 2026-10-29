<script lang="ts">
	import type { DebugFlag } from '@svelte-draw/editor'
	import { fromComputed } from '@svelte-draw/svelte'
	import SvelteDrawUiMenuCheckboxItem from '../primitives/menus/SvelteDrawUiMenuCheckboxItem.svelte'

	let { flag, onChange }: { flag: DebugFlag<boolean>; onChange?(newValue: boolean): void } = $props()

	const value = fromComputed('debug flag value', () => flag.get())
</script>

<SvelteDrawUiMenuCheckboxItem
	id={flag.name}
	title={flag.name}
	label={flag.name
		.replace(/([a-z0-9])([A-Z])/g, (m) => `${m[0]} ${m[1].toLowerCase()}`)
		.replace(/^[a-z]/, (m) => m.toUpperCase())}
	checked={value.current}
	onSelect={() => {
		const next = !value.current
		flag.set(next)
		onChange?.(next)
	}}
/>
