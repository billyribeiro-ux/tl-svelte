<script lang="ts" module>
	import { defineMessages, type TLI18nMessage } from '@svelte-draw/editor'
	import type { AlertSeverity } from '../context/toasts'
	import type { TLUiIconType } from '../icon-types'

	const messages = defineMessages({
		toastClose: { id: 'toast.close', defaultMessage: 'Close' },
	})

	const DEFAULT_TOAST_DURATION = 4000

	/** How far (px) a toast must be swiped before it is dismissed. */
	const SWIPE_THRESHOLD = 50

	const SEVERITY_TO_ICON: { [msg in AlertSeverity]: TLUiIconType } = {
		success: 'check-circle',
		warning: 'warning-triangle',
		error: 'cross-circle',
		info: 'info-circle',
	}

	/** @internal */
	// Keyed on the severity rather than written at the call site, which used to compose the id from
	// `severity` and so hid all four from the extractor. The `Record` keeps it complete: a new
	// severity won't compile until it has a label.
	const severityMessages: Record<AlertSeverity, TLI18nMessage> = defineMessages({
		success: { id: 'toast.success', defaultMessage: 'Success' },
		info: { id: 'toast.info', defaultMessage: 'Info' },
		warning: { id: 'toast.warning', defaultMessage: 'Warning' },
		error: { id: 'toast.error', defaultMessage: 'Error' },
	})
</script>

<script lang="ts">
	import { getToasts, type TLUiToast } from '../context/toasts'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from './primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonLabel from './primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiIcon from './primitives/SvelteDrawUiIcon.svelte'

	/** @internal */
	let { toast }: { toast: TLUiToast } = $props()

	const { removeToast } = getToasts()
	const msg = getTranslation()

	function close() {
		removeToast(toast.id)
	}

	const hasActions = $derived(toast.actions && toast.actions.length > 0)
	const icon = $derived(toast.icon || (toast.severity && SEVERITY_TO_ICON[toast.severity]))
	const iconLabel = $derived(
		toast.iconLabel || (toast.severity ? msg(severityMessages[toast.severity]) : '')
	)
	const duration = $derived(toast.keepOpen ? Infinity : DEFAULT_TOAST_DURATION)

	// Auto-dismiss timer. It pauses while the pointer or focus is on the toast, or the window is
	// blurred, and resumes with whatever time was left.
	let timer = -1
	let remaining = 0
	let startedAt = 0
	let isPausedByPointer = false
	let isPausedByFocus = false
	let isPausedByWindow = false

	function startTimer() {
		if (!Number.isFinite(remaining)) return
		startedAt = Date.now()
		timer = window.setTimeout(close, remaining)
	}

	function pauseTimer() {
		if (timer === -1) return
		clearTimeout(timer)
		timer = -1
		remaining -= Date.now() - startedAt
	}

	function syncTimer() {
		const shouldPause = isPausedByPointer || isPausedByFocus || isPausedByWindow
		if (shouldPause) pauseTimer()
		else if (timer === -1) startTimer()
	}

	$effect(() => {
		remaining = duration
		isPausedByPointer = false
		isPausedByFocus = false
		isPausedByWindow = false
		startTimer()
		return () => {
			clearTimeout(timer)
			timer = -1
		}
	})

	// Swipe to dismiss (to the right, like Radix's default `swipeDirection`).
	let swipe = $state<'move' | 'cancel' | 'end' | undefined>(undefined)
	let swipeStyle = $state<string | undefined>(undefined)
	let swipeOrigin: { x: number; y: number } | null = null

	function onpointerdown(e: PointerEvent) {
		if (e.button !== 0) return
		swipeOrigin = { x: e.clientX, y: e.clientY }
	}

	function onpointermove(e: PointerEvent) {
		if (!swipeOrigin) return
		const x = Math.max(0, e.clientX - swipeOrigin.x)
		const y = e.clientY - swipeOrigin.y
		if (swipe === undefined) {
			if (x <= 1) return
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		}
		swipe = 'move'
		swipeStyle = `--radix-toast-swipe-move-x: ${x}px; --radix-toast-swipe-move-y: ${y}px;`
	}

	function onpointerup(e: PointerEvent) {
		if (!swipeOrigin) return
		const x = Math.max(0, e.clientX - swipeOrigin.x)
		const y = e.clientY - swipeOrigin.y
		swipeOrigin = null
		if (swipe === undefined) return
		const elm = e.currentTarget as HTMLElement
		if (elm.hasPointerCapture(e.pointerId)) elm.releasePointerCapture(e.pointerId)
		if (x >= SWIPE_THRESHOLD) {
			swipe = 'end'
			swipeStyle = `--radix-toast-swipe-end-x: ${x}px; --radix-toast-swipe-end-y: ${y}px;`
			close()
		} else {
			swipe = 'cancel'
			swipeStyle = undefined
		}
		// A swipe is not a click on whatever the pointer ends up over.
		elm.addEventListener('click', (ev) => ev.preventDefault(), { once: true, capture: true })
	}
</script>

<svelte:window
	onblur={() => {
		isPausedByWindow = true
		syncTimer()
	}}
	onfocus={() => {
		isPausedByWindow = false
		syncTimer()
	}}
/>

<!-- The toast is announced by the viewport's live region, so the item itself is aria-live="off". -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<li
	role="status"
	aria-live="off"
	aria-atomic="true"
	tabindex={0}
	class="tlui-toast__container"
	data-state="open"
	data-swipe={swipe}
	data-swipe-direction="right"
	data-severity={toast.severity}
	style={swipeStyle}
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	onpointerenter={() => {
		isPausedByPointer = true
		syncTimer()
	}}
	onpointerleave={() => {
		isPausedByPointer = false
		syncTimer()
	}}
	onfocusin={() => {
		isPausedByFocus = true
		syncTimer()
	}}
	onfocusout={() => {
		isPausedByFocus = false
		syncTimer()
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			e.stopPropagation()
			close()
		}
	}}
>
	{#if icon}
		<div class="tlui-toast__icon">
			<SvelteDrawUiIcon label={iconLabel} {icon} />
		</div>
	{/if}
	<div
		class="tlui-toast__main"
		data-title={!!toast.title}
		data-description={!!toast.description}
		data-actions={!!toast.actions}
	>
		<div class="tlui-toast__content">
			{#if toast.title}
				<div class="tlui-toast__title">{toast.title}</div>
			{/if}
			{#if toast.description}
				<div class="tlui-toast__description">{toast.description}</div>
			{/if}
		</div>
		{#if toast.actions}
			<div class="tlui-toast__actions">
				{#each toast.actions as action, i (i)}
					<SvelteDrawUiButton
						type={action.type}
						onclick={() => {
							action.onClick()
							close()
						}}
					>
						<SvelteDrawUiButtonLabel>{action.label}</SvelteDrawUiButtonLabel>
					</SvelteDrawUiButton>
				{/each}
				<SvelteDrawUiButton
					type="normal"
					class="tlui-toast__close"
					style="margin-left: auto"
					onclick={close}
				>
					<SvelteDrawUiButtonLabel>
						{toast.closeLabel ?? msg(messages.toastClose)}
					</SvelteDrawUiButtonLabel>
				</SvelteDrawUiButton>
			</div>
		{/if}
	</div>
	{#if !hasActions}
		<SvelteDrawUiButton type="normal" class="tlui-toast__close" onclick={close}>
			<SvelteDrawUiButtonLabel>
				{toast.closeLabel ?? msg(messages.toastClose)}
			</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{/if}
</li>
