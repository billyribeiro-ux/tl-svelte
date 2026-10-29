<script lang="ts">
	import { parseAllowlistEmails, type AllowlistFeatureFlag } from '@svelte-draw/dotcom-shared'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	// The list is edited as free text, one email address per line, rather than as a row of chips with an
	// add button. It is a short hand-maintained list that is pasted into as often as it is typed into,
	// and the textarea makes "replace the whole list" the obvious operation — which is what the save
	// does. The addresses are resolved to user ids server-side at save time, so an address with no
	// svelte-draw account is rejected rather than stored; matching on the request path is always by id.
	let {
		flagName,
		label,
		flagValue,
		isSaving,
		implicitAccess,
		onSaveEmails,
		onSetAllowEveryone,
	}: {
		flagName: string
		label: string
		flagValue: AllowlistFeatureFlag
		isSaving: boolean
		implicitAccess: string | undefined
		onSaveEmails(emails: string[]): void
		onSetAllowEveryone(allowEveryone: boolean): void
	} = $props()

	const currentEmails = $derived((flagValue.users ?? []).map((entry) => entry.email))
	// Compared as a string, not by array identity, which is new on every change.
	const savedText = $derived(currentEmails.join('\n'))
	// Follows the saved list; the textarea overrides it while being edited.
	let text = $derived(savedText)

	// The server's own parser, not a second implementation of it: this count is what the confirm
	// dialog and the success message quote, and the worker is what decides what gets stored. Splitting
	// on newlines only — as this did — reported "1 user" for a comma-separated paste the server then
	// stored as five. A malformed address surfaces here rather than as a 400 after the confirm.
	const parseResult = $derived.by((): { parsed: string[]; parseError: string | null } => {
		try {
			return { parsed: parseAllowlistEmails(text), parseError: null }
		} catch (err) {
			return { parsed: [], parseError: err instanceof Error ? err.message : String(err) }
		}
	})
	const parsed = $derived(parseResult.parsed)
	const parseError = $derived(parseResult.parseError)
	// Both sides normalized before comparing. `parseAllowlistEmails` lowercases, while the stored list
	// carries each address as the *database* has it — the save resolves emails to accounts and keeps
	// the account's own casing — so comparing them raw leaves Save enabled forever on any list holding
	// one mixed-case address, and confirms a replace-the-whole-list save that changes nothing.
	const isDirty = $derived(
		parsed.join('\n') !== currentEmails.map((email) => email.toLowerCase()).join('\n')
	)

	const modes = [
		{ value: false, label: 'User list' },
		{ value: true, label: 'Allow all' },
	] as const

	let radioGroup = $state<HTMLElement | null>(null)
	// Controlled radios: after a handler the group shows the stored mode until the save lands.
	function resyncRadios() {
		if (!radioGroup) return
		for (const radio of radioGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
			radio.checked = (flagValue.allowEveryone === true) === (radio.value === 'true')
		}
	}
</script>

<!--
	The column modifier is what keeps the textarea usable: in the base row layout it is one
	flex item among many and shrinks to nothing beside the description.
-->
<div class={`${styles.featureFlagItem} ${styles.featureFlagItemColumn}`}>
	<div class={styles.featureFlagLabel}>
		<span>
			<strong>{label}</strong>
		</span>
		<!--
			No master toggle: an empty list already admits nobody, so an "off" beside it would be
			a second way to say the same thing — and on mcp_server_access it could not say it at
			all, since the staff bypass never consults this flag. The mode is the whole control.
		-->
		<div
			bind:this={radioGroup}
			role="radiogroup"
			aria-label={`${label} mode`}
			style="display: flex; align-items: center; gap: 12px; margin-top: 4px;"
		>
			<span style="opacity: 0.7;">Mode:</span>
			{#each modes as mode (String(mode.value))}
				<label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
					<input
						type="radio"
						name={`${flagName}-mode`}
						value={String(mode.value)}
						checked={(flagValue.allowEveryone === true) === mode.value}
						onchange={() => {
							onSetAllowEveryone(mode.value)
							resyncRadios()
						}}
						disabled={isSaving}
						style="cursor: pointer;"
					/>
					<span>{mode.label}</span>
				</label>
			{/each}
			{#if implicitAccess}<span style="opacity: 0.7;">{implicitAccess}</span>{/if}
		</div>
		<span class={flagValue.allowEveryone === true ? styles.featureFlagDisabled : ''}>
			{currentEmails.length} user(s)
		</span>
		<AdminButton
			onclick={() => onSaveEmails(parsed)}
			variant="primary"
			disabled={isSaving || !isDirty || !!parseError}
		>
			Save
		</AdminButton>
	</div>
	<!-- The label above is not tied to a control, so the textarea names itself. -->
	<!-- `searchInput` pins the 32px single-line height; `auto` hands control back to `rows`. -->
	<textarea
		value={text}
		oninput={(e) => {
			text = e.currentTarget.value
		}}
		disabled={isSaving}
		class={styles.searchInput}
		rows={4}
		aria-label={`${label} allowlist, one email per line`}
		aria-invalid={!!parseError}
		placeholder={'One email per line, e.g. someone@svelte-draw.invalid'}
		style="height: auto; padding: 6px 8px; font-family: monospace;"
	></textarea>
	{#if parseError}
		<span class={styles.errorMessage} role="alert">
			{parseError}
		</span>
	{/if}
	<!--
		An entry whose user id no longer resolves is a grant that looks live and matches nobody the
		admin can see — a deleted account, or one whose address moved. Named here rather than left
		to look like an ordinary line, since re-saving the list as displayed would 400 on it.
	-->
	{#if (flagValue.users ?? []).some((entry) => entry.missing)}
		<span class={styles.errorMessage} role="alert">
			No account for:{' '}
			{(flagValue.users ?? [])
				.filter((entry) => entry.missing)
				.map((entry) => entry.email)
				.join(', ')}
		</span>
	{/if}
	{#if flagValue.description}
		<span class={styles.featureFlagsDescription}>{flagValue.description}</span>
	{/if}
</div>
