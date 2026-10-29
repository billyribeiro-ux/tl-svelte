<script lang="ts">
	let {
		label,
		value,
		onChange,
		min,
		max,
		step,
		defaultValue,
	}: {
		label: string
		value: number
		onChange(v: number): void
		min: number
		max: number
		step: number
		defaultValue: number
	} = $props()

	// local value follows the parent unless the user is mid-drag
	let localValue = $state(0)
	let isDragging = false

	$effect.pre(() => {
		if (!isDragging) localValue = value
	})

	const isDefault = $derived(localValue === defaultValue)

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		isDragging = true
		localValue = Number(e.currentTarget.value)
	}

	function handleCommit() {
		if (!isDragging) return
		isDragging = false
		onChange(localValue)
	}
</script>

<div class="custom-theme-slider">
	<div class="custom-theme-slider__header">
		<span class="custom-theme-slider__label">{label}</span>
		<span class="custom-theme-slider__value" data-default={isDefault}>
			{localValue % 1 === 0 ? localValue : localValue.toFixed(2)}
		</span>
	</div>
	<input
		type="range"
		{min}
		{max}
		{step}
		value={localValue}
		oninput={handleInput}
		onpointerup={handleCommit}
	/>
</div>
