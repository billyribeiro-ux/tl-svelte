<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	let {
		name,
		type,
		value,
		checked,
		onchange,
	}: {
		name: string
		type?: HTMLInputAttributes['type']
		value?: string | number
		checked?: boolean
		onchange?: (event: Event & { currentTarget: HTMLInputElement }) => void
	} = $props()
</script>

<label for="opt-{name}" style="flex-grow: 2">
	{name}
</label>
<input
	id="opt-{name}"
	{name}
	{type}
	style="max-width: 64px; justify-self: flex-end"
	value={value ?? ''}
	checked={!!checked}
	oninput={onchange}
/>
