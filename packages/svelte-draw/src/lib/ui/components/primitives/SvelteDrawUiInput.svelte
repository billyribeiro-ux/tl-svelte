<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
	import type { TLUiIconType } from '../../icon-types'

	/** @public */
	export interface TLUiInputProps {
		disabled?: boolean
		label?: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		icon?: TLUiIconType | Exclude<string, TLUiIconType>
		iconLeft?: TLUiIconType | Exclude<string, TLUiIconType>
		iconLabel?: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		autoFocus?: boolean
		autoSelect?: boolean
		children?: Snippet
		defaultValue?: string
		/** Maximum number of characters the input will accept. */
		maxLength?: number
		placeholder?: string
		onComplete?(value: string): void
		onValueChange?(value: string): void
		onCancel?(value: string): void
		onBlur?(value: string): void
		onFocus?(): void
		class?: string
		/**
		 * Usually on iOS when you focus an input, the browser will adjust the viewport to bring the input
		 * into view. Sometimes this doesn't work properly though - for example, if the input is newly
		 * created, iOS seems to have a hard time adjusting the viewport for it. This prop allows you to
		 * opt-in to some extra code to manually bring the input into view when the visual viewport of the
		 * browser changes, but we don't want to use it everywhere because generally the native behavior
		 * looks nicer in scenarios where it's sufficient.
		 */
		shouldManuallyMaintainScrollPositionWhenFocused?: boolean
		value?: string
		'data-testid'?: string
		'aria-label'?: string
		/** The `<input>` element. */
		ref?: HTMLInputElement | null
	}
</script>

<script lang="ts">
	import { tlenv, tltime, type Editor } from '@svelte-draw/editor'
	import { tryGetEditor } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import type { Attachment } from 'svelte/attachments'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	function requestFrame(editor: Editor | null, fn: () => void) {
		if (editor) {
			editor.timers.requestAnimationFrame(fn)
		} else {
			tltime.requestAnimationFrame('anon', fn)
		}
	}

	let {
		class: className,
		label,
		icon,
		iconLeft,
		iconLabel,
		autoSelect = false,
		autoFocus = false,
		defaultValue,
		maxLength,
		placeholder,
		onComplete,
		onValueChange,
		onCancel,
		onFocus,
		onBlur,
		shouldManuallyMaintainScrollPositionWhenFocused = false,
		children,
		value,
		'data-testid': dataTestId,
		disabled,
		'aria-label': ariaLabel,
		ref = $bindable(null),
	}: TLUiInputProps = $props()

	const editor = tryGetEditor()
	const msg = getTranslation()
	// svelte-ignore state_referenced_locally
	const initialValue = defaultValue ?? ''

	let isComposing = false
	let isFocused = $state(false)

	function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		isFocused = true
		const elm = e.currentTarget
		if (autoSelect) {
			requestFrame(editor, () => elm.select())
		}
		onFocus?.()
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		onValueChange?.(e.currentTarget.value)
	}

	// We use keydown capture, because we want to get the escape key event.
	function handleKeyDownCapture(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		switch (e.key) {
			case 'Enter': {
				// In Chrome, if the user presses the Enter key while using the IME and calls
				// `e.currentTarget.blur()` in the event callback here, it will trigger an
				// `onChange` with a duplicated text value.
				if (isComposing) return
				e.currentTarget.blur()
				e.stopPropagation()
				onComplete?.(e.currentTarget.value)
				break
			}
			case 'Escape': {
				e.currentTarget.value = initialValue
				onCancel?.(e.currentTarget.value)
				e.currentTarget.blur()
				e.stopPropagation()
				break
			}
		}
	}

	function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		isFocused = false
		onBlur?.(e.currentTarget.value)
	}

	// Equivalent of React's `autoFocus`: focus the element when it mounts.
	const autoFocusOnMount: Attachment<HTMLInputElement> = (element) => {
		if (autoFocus) element.focus()
	}

	$effect(() => {
		if (!tlenv.isIos) return undefined

		const win = editor?.getContainerWindow() ?? window
		const visualViewport = win.visualViewport
		if (isFocused && shouldManuallyMaintainScrollPositionWhenFocused && visualViewport) {
			const onViewportChange = () => {
				ref?.scrollIntoView({ block: 'center' })
			}
			visualViewport.addEventListener('resize', onViewportChange)
			visualViewport.addEventListener('scroll', onViewportChange)
			requestFrame(editor, onViewportChange)

			return () => {
				visualViewport.removeEventListener('resize', onViewportChange)
				visualViewport.removeEventListener('scroll', onViewportChange)
			}
		}

		return undefined
	})
</script>

<div draggable={false} class="tlui-input__wrapper">
	{@render children?.()}
	<!-- Matches the React primitive: the label is visual and has no `for`. -->
	<!-- svelte-ignore a11y_label_has_associated_control -->
	{#if label}<label>{msg(label as TLUiTranslationKey)}</label>{/if}
	{#if iconLeft}
		<SvelteDrawUiIcon
			label={iconLabel ? msg(iconLabel as TLUiTranslationKey) : ''}
			icon={iconLeft}
			class="tlui-icon-left"
			small
		/>
	{/if}
	<input
		bind:this={ref}
		{@attach autoFocusOnMount}
		class={classNames('tlui-input', className)}
		type="text"
		value={value ?? defaultValue}
		maxlength={maxLength}
		onkeydowncapture={handleKeyDownCapture}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		oncompositionstart={() => (isComposing = true)}
		oncompositionend={() => (isComposing = false)}
		aria-label={ariaLabel}
		{placeholder}
		data-testid={dataTestId}
		{disabled}
	/>
	{#if icon}
		<SvelteDrawUiIcon
			label={iconLabel ? msg(iconLabel as TLUiTranslationKey) : ''}
			{icon}
			small={!!label}
		/>
	{/if}
</div>
