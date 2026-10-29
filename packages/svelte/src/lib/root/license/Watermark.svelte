<script lang="ts" module>
	import { watermarkDesktopSvg, watermarkMobileSvg } from '../editorInternals'

	const WATERMARK_DESKTOP_LOCAL_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkDesktopSvg)}`
	const WATERMARK_MOBILE_LOCAL_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkMobileSvg)}`
</script>

<script lang="ts">
	import { LicenseManager, preventDefault, runtime } from '@svelte-draw/editor'
	import { on } from 'svelte/events'
	import type { Attachment } from 'svelte/attachments'
	import { usePassThroughWheelEvents } from '../../canvas/passThroughWheelEvents'
	import { useCanvasEvents } from '../../canvas/useCanvasEvents.svelte'
	import { getEditor } from '../../context/editor'
	import { fromComputed } from '../../state/fromSignal'
	import { getLicenseManagerAccessor } from './licenseContext'
	import { createLicenseManagerState } from './licenseManagerState.svelte'
	import { getLicenseStylesCss } from './watermarkStyles'

	const getManager = getLicenseManagerAccessor()
	const licenseManager = $derived(getManager())
	const editor = getEditor()

	const isMobileSignal = fromComputed('is mobile', () => editor.getViewportScreenBounds().width < 700)
	const isDebugModeSignal = fromComputed('debug mode', () => editor.getInstanceState().isDebugMode)
	const isMobile = $derived(isMobileSignal.current)
	const isDebugMode = $derived(isDebugModeSignal.current)

	const licenseManagerStateSignal = $derived(createLicenseManagerState(licenseManager))
	const licenseManagerState = $derived(licenseManagerStateSignal.current)
	const isUnlicensed = $derived(licenseManagerState === 'unlicensed')

	const src = $derived(isMobile ? WATERMARK_MOBILE_LOCAL_SRC : WATERMARK_DESKTOP_LOCAL_SRC)
	const maskCss = $derived(`url('${src}') center 100% / 100% no-repeat`)

	const className = LicenseManager.className
	const css = getLicenseStylesCss(className)

	const UNLICENSED_URL =
		'https://tldraw.dev/pricing?utm_source=sdk&utm_medium=organic&utm_campaign=watermark'
	const LICENSED_URL = 'https://tldraw.dev/?utm_source=sdk&utm_medium=organic&utm_campaign=watermark'

	// Native listeners rather than `onpointerdown` / `onclick` attributes: those are delegated to the
	// root, so they would run after the canvas events on the parent, which stops `click` from
	// propagating and needs to see the pointerdown already marked as handled.
	function buttonEvents(openUrl: () => void): Attachment<HTMLElement> {
		return (button) => {
			const offPointerDown = on(button, 'pointerdown', (e) => {
				editor.markEventAsHandled(e)
				preventDefault(e)
			})
			const offClick = on(button, 'click', openUrl)
			return () => {
				offPointerDown()
				offClick()
			}
		}
	}

	const attachCanvasEvents = useCanvasEvents().attach()
	const wheel = usePassThroughWheelEvents()
	const licensedButton = buttonEvents(() => {
		runtime.openWindow(LICENSED_URL, '_blank')
	})
	// allow referrer
	const unlicensedButton = buttonEvents(() => {
		runtime.openWindow(UNLICENSED_URL, '_blank', true)
	})
</script>

{#if licenseManagerState === 'licensed-with-watermark' || licenseManagerState === 'unlicensed'}
	<svelte:element this={'style'} nonce={editor.options.nonce}>{css}</svelte:element>
	{#if isUnlicensed}
		<div
			class={className}
			data-debug={isDebugMode}
			data-mobile={isMobile}
			data-unlicensed={true}
			data-testid="tl-watermark-unlicensed"
			draggable={false}
			{@attach attachCanvasEvents}
			{@attach wheel}
		>
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<button
				draggable={false}
				role="button"
				title="The tldraw SDK requires a license key to work in production. You can get a free 100-day trial license at tldraw.dev/pricing."
				{@attach unlicensedButton}
			>
				Get a license for production
			</button>
		</div>
	{:else}
		<div
			class={className}
			data-debug={isDebugMode}
			data-mobile={isMobile}
			data-testid="tl-watermark-licensed"
			draggable={false}
			{@attach attachCanvasEvents}
			{@attach wheel}
		>
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<button
				draggable={false}
				role="button"
				title="Build infinite canvas applications with the tldraw SDK. Learn more at https://tldraw.dev."
				style="mask: {maskCss}; -webkit-mask: {maskCss}"
				{@attach licensedButton}
			></button>
		</div>
	{/if}
{/if}
