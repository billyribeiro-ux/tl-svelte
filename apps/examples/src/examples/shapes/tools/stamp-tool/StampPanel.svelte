<script lang="ts">
	import { SvelteDrawUiButton, fromComputed, fromSignal, getEditor } from 'svelte-draw'
	import { currentStamp, getStampId, stampList, uploadStamp } from './StampTool'

	// [7]
	const editor = getEditor()
	const stamps = fromSignal(stampList)
	const current = fromSignal(currentStamp)
	const isStampToolActive = fromComputed('is stamp tool active', () => editor.getCurrentToolId() === 'stamp')
	const currentStampId = $derived(getStampId(current.current))
</script>

<div class="tlui-menu stamp-panel">
	{#each stamps.current as stamp (getStampId(stamp))}
		<SvelteDrawUiButton
			type="icon"
			class="stamp-panel-button"
			data-active={isStampToolActive.current && currentStampId === getStampId(stamp)}
			onclick={() => {
				currentStamp.set(stamp)
				editor.setCurrentTool('stamp')
			}}
		>
			{#if stamp.type === 'emoji'}
				{stamp.emoji}
			{:else}
				<img class="stamp-panel-thumbnail" src={stamp.src} alt="custom stamp" />
			{/if}
		</SvelteDrawUiButton>
	{/each}
	<SvelteDrawUiButton
		type="icon"
		class="stamp-panel-button stamp-panel-upload"
		title="Upload a stamp"
		onclick={() => uploadStamp(editor)}
	>
		+
	</SvelteDrawUiButton>
</div>
