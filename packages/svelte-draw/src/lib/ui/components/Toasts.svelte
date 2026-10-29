<script lang="ts">
	import { fromSignal } from '@svelte-draw/svelte'
	import { getToasts } from '../context/toasts'
	import SvelteDrawUiToast from './SvelteDrawUiToast.svelte'

	/** @public */
	const { toasts } = getToasts()
	const toastsArray = fromSignal(toasts)

	let viewport = $state<HTMLOListElement | null>(null)
</script>

<!-- F8 moves focus to the toast viewport, matching the "Notifications (F8)" label. -->
<svelte:document
	onkeydown={(e) => {
		if (e.key === 'F8' && toastsArray.current.length > 0) viewport?.focus()
	}}
/>

{#each toastsArray.current as toast (toast.id)}
	<!-- Visually hidden live region so screen readers hear the toast when it appears. -->
	<div
		role="status"
		aria-live="assertive"
		aria-atomic="true"
		style="position: absolute; border: 0; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; word-wrap: normal;"
	>
		{toast.title ?? ''}
		{toast.description ?? ''}
	</div>
{/each}
<div
	role="region"
	aria-label="Notifications (F8)"
	tabindex={-1}
	style:pointer-events={toastsArray.current.length > 0 ? undefined : 'none'}
>
	<ol bind:this={viewport} tabindex={-1} class="tlui-toast__viewport">
		{#each toastsArray.current as toast (toast.id)}
			<SvelteDrawUiToast {toast} />
		{/each}
	</ol>
</div>
