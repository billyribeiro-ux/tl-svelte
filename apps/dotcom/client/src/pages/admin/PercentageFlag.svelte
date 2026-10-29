<script lang="ts">
	import type { PercentageFeatureFlag } from '@svelte-draw/dotcom-shared'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	let {
		flagName,
		label,
		flagValue,
		isSaving,
		onToggle,
		onSavePercentage,
	}: {
		flagName: string
		label: string
		flagValue: PercentageFeatureFlag
		isSaving: boolean
		onToggle(enabled: boolean): void
		onSavePercentage(percentage: number): void
	} = $props()

	const currentPct = $derived(flagValue.percentage)
	// Starts from, and follows, the saved percentage; the field overrides it while being edited.
	let pct = $derived(currentPct)
</script>

<div class={styles.featureFlagItem}>
	<div class={styles.featureFlagLabel}>
		<label for={flagName} style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
			<input
				id={flagName}
				type="checkbox"
				checked={flagValue.enabled}
				onchange={(e) => {
					const input = e.currentTarget
					onToggle(input.checked)
					// Controlled input: the box shows the stored value until the save lands.
					input.checked = flagValue.enabled
				}}
				disabled={isSaving}
				style="cursor: pointer;"
			/>
			<span>
				<strong>{label}</strong>
			</span>
		</label>
		<input
			type="text"
			value={pct}
			oninput={(e) => {
				const input = e.currentTarget
				const n = Number(input.value)
				if (!Number.isNaN(n)) pct = Math.max(0, Math.min(100, n))
				input.value = String(pct)
			}}
			disabled={isSaving || !flagValue.enabled}
			class={styles.searchInput}
			style="width: 60px;"
		/>
		<span class={!flagValue.enabled ? styles.featureFlagDisabled : ''}>%</span>
		<AdminButton
			onclick={() => onSavePercentage(pct)}
			variant="primary"
			disabled={isSaving || !flagValue.enabled || pct === currentPct}
		>
			Save
		</AdminButton>
	</div>
	{#if flagValue.description}
		<span class={styles.featureFlagsDescription}>{flagValue.description}</span>
	{/if}
</div>
