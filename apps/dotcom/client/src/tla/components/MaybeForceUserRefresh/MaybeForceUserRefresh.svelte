<script lang="ts">
	import type { Snippet } from 'svelte'
	import { F, fromSignal } from 'svelte-draw'
	import { isClientTooOld$ } from '../../hooks/useAppState.svelte'
	import TlaButton from '../TlaButton/TlaButton.svelte'
	import styles from './MaybeForceUserRefresh.module.css'

	let { children }: { children?: Snippet } = $props()

	const isClientTooOld = fromSignal(isClientTooOld$)
	let forceDismiss = $state(false)

	const showModal = $derived(isClientTooOld.current && !forceDismiss)
</script>

<div class={styles.container}>
	<div
		class={styles.container}
		style:pointer-events={showModal ? 'none' : 'all'}
		style:opacity={showModal ? 0.5 : 1}
	>
		{@render children?.()}
	</div>
	<!-- A custom overlay rather than SvelteDrawUiDialog: it renders at the app-provider root
	     to dim the whole app when the client is outdated — a context where the dialog primitives
	     and their UI-context readers are not available. -->
	{#if showModal}
		<div class={styles.modal}>
			<div class={styles.modalContent}>
				<div class={styles.modalTitle}>
					<F defaultMessage="Please reload the page" />
				</div>
				<div>
					<F defaultMessage="This version of svelte-draw is no longer supported." />
				</div>
				<div class={styles.modalActions}>
					<TlaButton
						class={styles.modalButton}
						variant="secondary"
						onclick={() => {
							forceDismiss = true
						}}
					>
						<F defaultMessage="Later" />
					</TlaButton>
					<TlaButton
						class={styles.modalButton}
						onclick={() => {
							window.location.reload()
						}}
					>
						<F defaultMessage="Reload" />
					</TlaButton>
				</div>
			</div>
		</div>
	{/if}
</div>
