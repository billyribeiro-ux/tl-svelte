<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'
	import type { TLUiDialogProps } from '../../context/dialogs'

	/** @public */
	export type TLUiKeyboardShortcutsDialogProps = TLUiDialogProps & {
		children?: Snippet
	}

	const messages = defineMessages({
		shortcutsDialogDisabledNotice: {
			id: 'shortcuts-dialog.disabled-notice',
			defaultMessage:
				'Keyboard shortcuts are turned off. Turn them back on under Preferences > Accessibility.',
		},
		shortcutsDialogTitle: { id: 'shortcuts-dialog.title', defaultMessage: 'Keyboard shortcuts' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiDialogBody from '../primitives/SvelteDrawUiDialogBody.svelte'
	import SvelteDrawUiDialogCloseButton from '../primitives/SvelteDrawUiDialogCloseButton.svelte'
	import SvelteDrawUiDialogHeader from '../primitives/SvelteDrawUiDialogHeader.svelte'
	import SvelteDrawUiDialogTitle from '../primitives/SvelteDrawUiDialogTitle.svelte'
	import DefaultKeyboardShortcutsDialogContent from './DefaultKeyboardShortcutsDialogContent.svelte'


	// `onClose` is part of the dialog contract but this dialog closes through the close button.
	let { children }: TLUiKeyboardShortcutsDialogProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const breakpoint = getBreakpoint()
	const areKeyboardShortcutsEnabled = fromComputed('areKeyboardShortcutsEnabled', () =>
		editor.user.getAreKeyboardShortcutsEnabled()
	)
</script>

<SvelteDrawUiDialogHeader class="tlui-shortcuts-dialog__header">
	<SvelteDrawUiDialogTitle>{msg(messages.shortcutsDialogTitle)}</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
{#if !areKeyboardShortcutsEnabled.current}
	<div
		class="tlui-shortcuts-dialog__disabled-notice"
		data-testid="kbd.disabled-notice"
		role="status"
	>
		{msg(messages.shortcutsDialogDisabledNotice)}
	</div>
{/if}
<SvelteDrawUiDialogBody
	class={classNames('tlui-shortcuts-dialog__body', {
		'tlui-shortcuts-dialog__body__mobile': breakpoint.current <= PORTRAIT_BREAKPOINT.MOBILE_XS,
		'tlui-shortcuts-dialog__body__tablet': breakpoint.current <= PORTRAIT_BREAKPOINT.TABLET,
	})}
>
	<SvelteDrawUiMenuContextProvider type="keyboard-shortcuts" sourceId="kbd">
		{#if children}
			{@render children()}
		{:else}
			<DefaultKeyboardShortcutsDialogContent />
		{/if}
	</SvelteDrawUiMenuContextProvider>
</SvelteDrawUiDialogBody>
<div class="tlui-dialog__scrim"></div>
