<script lang="ts">
	import { SvelteDrawUiInput } from 'svelte-draw'
	import styles from '../top.module.css'

	let {
		fileName,
		onComplete,
		onBlur,
	}: {
		fileName: string
		onComplete(name: string): void
		onBlur(): void
	} = $props()

	// Mirrors the state so blur reads the latest value: SvelteDrawUiInput passes '' on blur after Escape,
	// which would otherwise commit an empty rename.
	// svelte-ignore state_referenced_locally
	let temporaryNameMirror = fileName
	// svelte-ignore state_referenced_locally
	let temporaryFileName = $state(fileName)

	function handleCancel() {
		// restore original filename from file
		temporaryFileName = fileName
		temporaryNameMirror = fileName
		onBlur()
	}

	function handleBlur() {
		// dispatch the new filename via onComplete
		const newFileName = temporaryNameMirror.replace(/\s+/g, ' ').trim()
		if (newFileName === fileName) return handleCancel()
		temporaryFileName = newFileName
		temporaryNameMirror = newFileName
		onComplete(newFileName)
		onBlur()
	}

	function handleValueChange(value: string) {
		temporaryFileName = value
		temporaryNameMirror = value
	}
</script>

<SvelteDrawUiInput
	data-testid="tla-file-name-input"
	value={temporaryFileName}
	onValueChange={handleValueChange}
	onCancel={handleCancel}
	onBlur={handleBlur}
	autoSelect
	autoFocus
/>
<div class={styles.topLeftInputNameWidthSetter}>
	{temporaryFileName.replace(/ /g, '\u00a0')}
</div>
