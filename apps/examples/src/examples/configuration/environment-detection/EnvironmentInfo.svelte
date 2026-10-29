<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiIcon, tlenv, tlenvReactive } from 'svelte-draw'
	import { fromComputed } from '@svelte-draw/svelte'

	// [1]
	const isCoarsePointer = fromComputed('coarse pointer', () => tlenvReactive.get().isCoarsePointer)

	// [2]
	const buttonSize = $derived(isCoarsePointer.current ? '48px' : '32px')
</script>

<div class="tlui-menu environment-info">
	<!-- [3] -->
	<div>
		<strong>Platform (tlenv):</strong>
		{#if tlenv.isIos}iOS{/if}
		{#if tlenv.isDarwin && !tlenv.isIos}macOS{/if}
		{#if tlenv.isAndroid}Android{/if}
		{#if !tlenv.isDarwin && !tlenv.isIos && !tlenv.isAndroid}Other{/if}
	</div>
	<div>
		<strong>Browser:</strong>
		{#if tlenv.isSafari}Safari{/if}
		{#if tlenv.isFirefox}Firefox{/if}
		{#if tlenv.isChromeForIos}Chrome for iOS{/if}
		{#if !tlenv.isSafari && !tlenv.isFirefox && !tlenv.isChromeForIos}Other{/if}
	</div>
	<div>
		<strong>Modifier key:</strong>
		{tlenv.isDarwin ? '⌘ Cmd' : 'Ctrl'}
	</div>
	<div>
		<strong>Pointer type (tlenvReactive):</strong>
		{isCoarsePointer.current ? 'Touch' : 'Mouse'}
	</div>
	<SvelteDrawUiButton
		type="normal"
		style="width: {buttonSize}; height: {buttonSize}; border: 1px solid var(--tl-color-text-3);"
		onclick={() => alert(`Button size: ${buttonSize}`)}
	>
		<SvelteDrawUiIcon icon="dot" label="Dot" />
	</SvelteDrawUiButton>
</div>
