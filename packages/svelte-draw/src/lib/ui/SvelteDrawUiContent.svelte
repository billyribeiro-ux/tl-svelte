<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		focusModeToggleFocusMode: {
			id: 'focus-mode.toggle-focus-mode',
			defaultMessage: 'Toggle focus mode',
		},
	})
</script>

<script lang="ts">
	import { tlenv } from '@svelte-draw/editor'
	import { fromComputed, getContainer, getEditor, quickReactor } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import SvelteDrawUiButton from './components/primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from './components/primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import { PORTRAIT_BREAKPOINT, PORTRAIT_BREAKPOINTS } from './constants'
	import { getActions } from './context/actions.svelte'
	import { getBreakpoint } from './context/breakpoints'
	import { getUiComponents } from './context/components'
	import { setupEditorEvents } from './hooks/useEditorEvents.svelte'
	import { createReadonly } from './hooks/useReadonly'
	import { getDirection, getTranslation } from './hooks/useTranslation/useTranslation.svelte'
	import { getUiWiring } from './uiWiring'

	const editor = getEditor()
	const msg = getTranslation()
	const breakpoint = getBreakpoint()
	const isReadonlyMode = createReadonly()
	const isFocusMode = fromComputed('focus', () => editor.getInstanceState().isFocusMode)
	const isDebugMode = fromComputed('debug', () => editor.getInstanceState().isDebugMode)

	const container = getContainer()
	const dir = getDirection()
	const locale = fromComputed('locale', () => editor.user.getLocale())
	$effect(() => {
		container.dir = dir.current
		container.lang = locale.current
	})

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
	const SkipToMainContent = getUiWiring('SkipToMainContent')

	setupEditorEvents()

	let isEditingAnything = false
	let hidingTimeout = -1
	let hideToolbarWhileEditing = $state(false)

	$effect(() =>
		quickReactor('update hide toolbar while delayed', () => {
			const isMobileEnvironment = tlenv.isIos || tlenv.isAndroid
			if (!isMobileEnvironment) return

			const editingShape = editor.getEditingShapeId()
			if (editingShape === null) {
				if (isEditingAnything) {
					isEditingAnything = false
					clearTimeout(hidingTimeout)
					if (tlenv.isAndroid) {
						// On Android, hide it after 150ms
						hidingTimeout = editor.timers.setTimeout(() => {
							hideToolbarWhileEditing = false
						}, 150)
					} else {
						// On iOS, just hide it immediately
						hideToolbarWhileEditing = false
					}
				}
				return
			}

			if (!isEditingAnything) {
				isEditingAnything = true
				clearTimeout(hidingTimeout)
				hideToolbarWhileEditing = true
			}
		})
	)

	const actions = getActions()

	const breakpointsAbove = $derived(
		PORTRAIT_BREAKPOINTS.map((_, bp) => bp)
			.slice(0, breakpoint.current + 1)
			.join(' ')
	)
	const breakpointsBelow = $derived(
		PORTRAIT_BREAKPOINTS.map((_, bp) => bp)
			.slice(breakpoint.current + 1)
			.join(' ')
	)
</script>

<!--
	The outer editor container has role="application" so that desktop screen readers treat
	the canvas as an interactive surface. Mark the UI layer as role="document" so that the
	toolbar, menus, and dialogs stay navigable to assistive tech — especially mobile screen
	readers like VoiceOver and TalkBack that do not announce role="application". See
	https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/application_role
	When the virtual keyboard is opening we want it to hide immediately.
	But when the virtual keyboard is closing we want to wait a bit before showing it again.
-->
<div
	class={classNames('tlui-layout', {
		'tlui-layout__mobile': breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM,
	})}
	role="document"
	data-iseditinganything={hideToolbarWhileEditing}
	data-breakpoint={breakpoint.current}
	data-breakpoints-above={breakpointsAbove}
	data-breakpoints-below={breakpointsBelow}
>
	<SkipToMainContent />
	{#if isFocusMode.current}
		<div class="tlui-layout__top">
			<SvelteDrawUiButton
				type="icon"
				class="tlui-focus-button"
				title={msg(messages.focusModeToggleFocusMode)}
				onclick={() => actions['toggle-focus-mode'].onSelect('menu')}
			>
				<SvelteDrawUiButtonIcon icon="dot" />
			</SvelteDrawUiButton>
		</div>
	{:else}
		<div class="tlui-layout__top">
			<div class="tlui-layout__top__left">
				{#if components.MenuPanel}
					{@const MenuPanel = components.MenuPanel}
					<MenuPanel />
				{/if}
				{#if components.HelperButtons}
					{@const HelperButtons = components.HelperButtons}
					<HelperButtons />
				{/if}
			</div>
			<div class="tlui-layout__top__center">
				{#if components.TopPanel}
					{@const TopPanel = components.TopPanel}
					<TopPanel />
				{/if}
			</div>
			<div class="tlui-layout__top__right">
				{#if components.SharePanel}
					{@const SharePanel = components.SharePanel}
					<SharePanel />
				{/if}
				{#if components.StylePanel && breakpoint.current >= PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode.current}
					{@const StylePanel = components.StylePanel}
					<StylePanel />
				{/if}
			</div>
		</div>
		<div class="tlui-layout__bottom">
			<div class="tlui-layout__bottom__main">
				{#if components.NavigationPanel}
					{@const NavigationPanel = components.NavigationPanel}
					<NavigationPanel />
				{/if}
				{#if components.Toolbar}
					{@const Toolbar = components.Toolbar}
					<Toolbar />
				{/if}
				{#if components.HelpMenu}
					{@const HelpMenu = components.HelpMenu}
					<HelpMenu />
				{/if}
			</div>
			{#if isDebugMode.current && components.DebugPanel}
				{@const DebugPanel = components.DebugPanel}
				<DebugPanel />
			{/if}
			{#if components.A11y}
				{@const A11y = components.A11y}
				<A11y />
			{/if}
		</div>
	{/if}
	{#if components.FollowingIndicator}
		{@const FollowingIndicator = components.FollowingIndicator}
		<FollowingIndicator />
	{/if}
	{#if components.Toasts}
		{@const Toasts = components.Toasts}
		<Toasts />
	{/if}
	{#if components.Dialogs}
		{@const Dialogs = components.Dialogs}
		<Dialogs />
	{/if}
</div>
