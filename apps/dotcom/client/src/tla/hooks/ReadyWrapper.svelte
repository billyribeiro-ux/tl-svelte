<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './useIsReady.module.css'
	import { getReadyState, setReadyState } from './useIsReady.svelte'

	let { children }: { children: Snippet } = $props()

	const parent = getReadyState()
	let isReady = $state(false)

	setReadyState({
		get isReady() {
			return isReady
		},
		setIsReady() {
			isReady = true
		},
		isRoot: false,
	})
</script>

{#if !parent.isRoot}
	<!-- already wrapped at a higher level -->
	{@render children()}
{:else}
	<div class={[styles.container, isReady && styles.isReady]}>
		<div class={[styles.innerContainer, isReady && styles.isReady]} inert={!isReady}>
			{@render children()}
		</div>
	</div>
{/if}
