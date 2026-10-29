<script lang="ts">
	import { getDialogs } from 'svelte-draw'
	import { getSvelteDrawAppUiEvents, type TLAppUiEventSource } from '../../../utils/app-ui-events'
	import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'
	import styles from '../top.module.css'
	import TlaFileNameEditorInput from './TlaFileNameEditorInput.svelte'
	import TlaRenameFileDialog from './TlaRenameFileDialog.svelte'
	import { withDialogProps } from '../../../../utils/withDialogProps'

	let {
		fileName,
		onChange,
		onEnd,
		isRenaming,
		source,
	}: {
		fileName: string
		onChange?(name: string): void
		onEnd?(): void
		isRenaming?: boolean
		source: TLAppUiEventSource
	} = $props()

	let isEditing = $state(false)
	const trackEvent = getSvelteDrawAppUiEvents()
	const { addDialog } = getDialogs()

	function handleEditingStart() {
		if (!onChange) return
		if (getIsCoarsePointer()) {
			addDialog({
				component: withDialogProps(TlaRenameFileDialog, { fileName, onSubmit: onChange }),
			})
		} else {
			isEditing = true
		}
	}

	function handleEditingEnd() {
		if (!onChange) return
		isEditing = false
		onEnd?.()
	}

	function handleEditingComplete(name: string) {
		if (!onChange) return
		isEditing = false
		onChange(name)
		onEnd?.()
		trackEvent('rename-file', { name, source })
	}

	$effect(() => {
		if (isRenaming && !isEditing) {
			// Wait a tick, otherwise the blur event immediately exits the input.
			setTimeout(() => {
				isEditing = true
			}, 0)
		}
	})
</script>

<div class={[styles.topLeftInputWrapper, onChange && styles.topLeftInputWrapperEditable]}>
	{#if isEditing}
		<TlaFileNameEditorInput {fileName} onComplete={handleEditingComplete} onBlur={handleEditingEnd} />
	{:else}
		<button
			class={styles.topLeftInputNameWidthSetter}
			onclick={onChange ? handleEditingStart : undefined}
			data-testid="tla-file-name"
		>
			{fileName.replace(/ /g, '\u00a0')}
		</button>
	{/if}
</div>
