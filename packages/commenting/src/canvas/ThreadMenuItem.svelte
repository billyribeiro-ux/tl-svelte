<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import { SvelteDrawUiDropdownMenuItem } from 'svelte-draw'

	let {
		label,
		danger,
		noClose,
		onClick,
	}: {
		label: string
		danger?: boolean
		noClose?: boolean
		onClick(): void
	} = $props()
</script>

<SvelteDrawUiDropdownMenuItem {noClose}>
	{#snippet child({ props })}
		<button
			{...mergeProps(props, { onclick: onClick })}
			type="button"
			class={danger ? 'tlui-cmt-menu-item tlui-cmt-menu-item--danger' : 'tlui-cmt-menu-item'}
		>
			<span>{label}</span>
		</button>
	{/snippet}
</SvelteDrawUiDropdownMenuItem>
