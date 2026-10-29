<script lang="ts">
	let {
		prop,
		label,
		value,
		onChange,
	}: {
		prop: string
		label: string
		value: boolean
		onChange: (prop: string, value: boolean) => void
	} = $props()
</script>

<label class="shader-config-panel__control shader-config-panel__control--boolean">
	<span class="shader-config-panel__label">{label}</span>
	<input
		type="checkbox"
		checked={value ?? false}
		onchange={(e) => onChange(prop, e.currentTarget.checked)}
		class="shader-config-panel__boolean-input"
	/>
</label>
