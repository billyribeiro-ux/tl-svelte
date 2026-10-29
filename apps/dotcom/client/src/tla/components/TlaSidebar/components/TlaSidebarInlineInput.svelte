<script lang="ts">
	import { SvelteDrawUiInput } from 'svelte-draw'
	import styles from '../sidebar.module.css'

	let {
		defaultValue = '',
		placeholder,
		onComplete,
		onCancel,
		class: className,
		wrapperClass,
		autoFocus = true,
		active = false,
		'data-testid': dataTestId,
	}: {
		defaultValue?: string
		placeholder?: string
		onComplete(value: string): void
		onCancel(): void
		class?: string
		wrapperClass?: string
		autoFocus?: boolean
		active?: boolean
		'data-testid'?: string
	} = $props()

	let ref = $state<HTMLInputElement | null>(null)
	let wasSaved = false

	function handleSave() {
		if (wasSaved) return
		const elm = ref
		if (!elm) return
		const value = elm.value.slice(0, 200).trim()

		if (value) {
			wasSaved = true
			onComplete(value)
		} else {
			onCancel()
		}
	}

	function handleCancel() {
		wasSaved = true
		onCancel()
	}
</script>

<div class={[styles.sidebarFileListItemRenameInputWrapper, wrapperClass]}>
	<SvelteDrawUiInput
		bind:ref
		data-testid={dataTestId}
		class={[
			styles.sidebarFileListItemRenameInput,
			'tla-text_ui__regular',
			active && styles.sidebarFileListItemRenameInputActive,
			className,
		]
			.filter(Boolean)
			.join(' ')}
		{defaultValue}
		{placeholder}
		onComplete={handleSave}
		onCancel={handleCancel}
		onBlur={handleSave}
		autoSelect
		{autoFocus}
	/>
</div>
