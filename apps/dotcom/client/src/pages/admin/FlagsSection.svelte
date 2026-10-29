<script lang="ts" module>
	import type { FeatureFlagValue } from '@svelte-draw/dotcom-shared'

	const FLAG_TYPE_ORDER: FeatureFlagValue['type'][] = ['boolean', 'percentage', 'allowlist']

	// Flags whose name title-cased does not say what they do. `Mcp Server Enabled` reads like a
	// capability toggle; it is the switch that takes the whole server down, and somebody reaching for it
	// under pressure should not have to infer that.
	const FLAG_LABELS: Record<string, string> = {
		mcp_server_access: 'MCP server access',
	}

	// Access a flag grants on top of whatever the panel is showing. Kept per flag rather than written
	// into AllowlistFlag: the staff bypass belongs to `canUseMcpServer`, not to allowlists in general,
	// and a second allowlist flag inheriting this sentence would be the panel stating an access rule
	// that does not hold for it.
	const FLAG_IMPLICIT_ACCESS: Record<string, string> = {
		mcp_server_access: '@svelte-draw.invalid accounts have access either way.',
	}

	// Rendered above the rest rather than interleaved alphabetically with commenting and version
	// chains: this is the one flag that decides whether an outside caller can drive the product at all,
	// and it is the one an operator comes to this page to find.
	const MCP_FLAGS = ['mcp_server_access']

	function flagLabel(flagName: string) {
		return (
			FLAG_LABELS[flagName] ??
			flagName
				.split('_')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
		)
	}
</script>

<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AllowlistFlag from './AllowlistFlag.svelte'
	import styles from './admin.module.css'
	import PercentageFlag from './PercentageFlag.svelte'
	import { createTransientMessage, getResponseError } from './shared.svelte'

	let flags = $state.raw<Record<string, FeatureFlagValue>>({})
	let isLoading = $state(true)
	let isSaving = $state(false)
	let error = $state<string | null>(null)
	const successMessage = createTransientMessage()

	async function loadFlags() {
		isLoading = true
		error = null
		try {
			const res = await fetch('/api/app/admin/feature-flags')
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			const data = await res.json()
			flags = data
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load flags'
		} finally {
			isLoading = false
		}
	}

	$effect(() => {
		loadFlags()
	})

	async function saveFlag(
		flag: string,
		update: {
			enabled?: boolean
			percentage?: number
			emails?: string[]
			allowEveryone?: boolean
		}
	) {
		isSaving = true
		error = null
		successMessage.set(null)
		try {
			const res = await fetch('/api/app/admin/feature-flags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ flag, ...update }),
			})
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			// Merge what the server stored, not what was sent: an allowlist save sends emails but
			// stores resolved { userId, email } entries, and the response carries them back.
			const { success: _success, flag: _flag, ...stored } = await res.json()
			flags = { ...flags, [flag]: { ...flags[flag], ...stored } }
			if (update.percentage !== undefined) {
				successMessage.set(
					update.percentage === 0
						? `${flag} disabled (0%)`
						: `${flag} set to ${update.percentage}% of users`
				)
			} else if (update.emails !== undefined) {
				successMessage.set(
					update.emails.length === 0
						? `${flag} allowlist cleared`
						: `${flag} allowed for ${update.emails.length} user(s)`
				)
			} else if (update.allowEveryone !== undefined) {
				successMessage.set(
					update.allowEveryone ? `${flag} set to allow all` : `${flag} set to user list`
				)
			} else {
				successMessage.set(`${flag} ${update.enabled ? 'enabled' : 'disabled'}`)
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update flag'
		} finally {
			isSaving = false
		}
	}

	const sortedFlags = $derived(
		Object.entries(flags)
			.filter(([name]) => !MCP_FLAGS.includes(name))
			.sort(([a], [b]) => {
				// Grouped by type — boolean, then percentage, then allowlist — and alphabetical
				// within a group. Ranked rather than compared pairwise so the ordering stays a
				// total one as types are added.
				const rank = (name: string) => FLAG_TYPE_ORDER.indexOf(flags[name].type ?? 'boolean')
				return rank(a) - rank(b) || a.localeCompare(b)
			})
	)
	const mcpFlags = $derived(MCP_FLAGS.filter((name) => flags[name]))
</script>

{#snippet renderFlag(flagName: string, flagValue: FeatureFlagValue)}
	{@const label = flagLabel(flagName)}
	{#if flagValue.type === 'percentage'}
		<PercentageFlag
			{flagName}
			{label}
			{flagValue}
			{isSaving}
			onToggle={(enabled) => {
				const action = enabled ? 'Enable' : 'Disable'
				if (!window.confirm(`${action} "${flagName}"?`)) return
				saveFlag(flagName, { enabled })
			}}
			onSavePercentage={(pct) => {
				if (!window.confirm(`Set "${flagName}" to ${pct}% of users?`)) return
				saveFlag(flagName, { percentage: pct })
			}}
		/>
	{:else if flagValue.type === 'allowlist'}
		<AllowlistFlag
			{flagName}
			{label}
			{flagValue}
			{isSaving}
			implicitAccess={FLAG_IMPLICIT_ACCESS[flagName]}
			onSetAllowEveryone={(allowEveryone) => {
				if (
					allowEveryone &&
					!window.confirm(
						`Open "${flagName}" to EVERY signed-in account? The list below is kept, and applies again on "User list".`
					)
				) {
					return
				}
				saveFlag(flagName, { allowEveryone })
			}}
			onSaveEmails={(emails) => {
				if (
					!window.confirm(
						`Set "${flagName}" to these ${emails.length} address(es)? This replaces the current list.`
					)
				) {
					return
				}
				saveFlag(flagName, { emails })
			}}
		/>
	{:else}
		<div class={styles.featureFlagItem}>
			<label for={flagName} class={styles.featureFlagLabel}>
				<input
					id={flagName}
					type="checkbox"
					checked={flagValue.enabled}
					onchange={(e) => {
						const input = e.currentTarget
						const enabled = input.checked
						const action = enabled ? 'enable' : 'disable'
						if (!window.confirm(`Are you sure you want to ${action} "${flagName}" for ALL users?`)) {
							// Controlled input: the box shows the stored value until the save lands.
							input.checked = flagValue.enabled
							return
						}
						saveFlag(flagName, { enabled })
						input.checked = flagValue.enabled
					}}
					disabled={isSaving}
				/>
				<span>
					<strong>{label}</strong>
				</span>
			</label>
			{#if flagValue.description}
				<span class={styles.featureFlagsDescription}>{flagValue.description}</span>
			{/if}
		</div>
	{/if}
{/snippet}

<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Feature flags</h3>
	<div class={styles.fileOperation}>
		{#if error}
			<div class={styles.errorMessage} role="alert">
				{error}
			</div>
		{/if}
		{#if successMessage.current}
			<div class={styles.successMessage} role="status" aria-live="polite">
				{successMessage.current}
			</div>
		{/if}

		<p class={styles.featureFlagsNote}>
			<strong>Global feature toggles.</strong> Server checks pick up changes within about 90 seconds,
			open tabs on their next page load after that. Some apply later still, as noted in their
			descriptions.
		</p>
		<p class={styles.featureFlagsDescription}>
			Boolean flags toggle on/off for everyone. Percentage flags roll out to X% of users (evaluated
			server-side per userId). Allowlist flags are on only for the people named, which is the one
			thing a percentage cannot do — it picks its own subset. Their lists are edited as emails and
			stored as user ids.
		</p>

		{#if isLoading}
			<p>Loading flags...</p>
		{:else}
			<div class={styles.featureFlagsContainer}>
				{#each mcpFlags as name (name)}
					{@render renderFlag(name, flags[name])}
				{/each}
				{#if mcpFlags.length > 0}<hr class={styles.featureFlagsDivider} />{/if}
				{#each sortedFlags as [flagName, flagValue] (flagName)}
					{@render renderFlag(flagName, flagValue)}
				{/each}
			</div>
		{/if}
	</div>
</section>
