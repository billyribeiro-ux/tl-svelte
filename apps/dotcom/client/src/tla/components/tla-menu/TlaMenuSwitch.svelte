<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import styles from './menu.module.css'

	let {
		id,
		checked,
		onChange,
		disabled,
		...rest
	}: Omit<HTMLInputAttributes, 'onchange' | 'checked' | 'type' | 'id'> & {
		id: string
		checked: boolean
		onChange?(checked: boolean): void
		disabled?: boolean
	} = $props()
</script>

<div class={['tla-switch', styles.menuSwitchContainer, disabled && styles.menuSwitchDisabled]}>
	<div class={styles.menuSwitch} data-checked={checked}></div>
	<input
		{id}
		name="shared"
		{disabled}
		role="switch"
		type="checkbox"
		bind:checked={() => checked, (next) => onChange?.(next)}
		{...rest}
	/>
</div>
