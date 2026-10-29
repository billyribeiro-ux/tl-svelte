<script lang="ts" module>
	import type { ReadonlySharedStyleMap } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiStylePanelProps {
		isMobile?: boolean
		styles?: ReadonlySharedStyleMap | null
		children?: Snippet
	}
</script>

<script lang="ts">
	import { fromComputed, getEditor, usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import type { Attachment } from 'svelte/attachments'
	import { createRelevantStyles } from '../../hooks/useRelevantStyles'
	import DefaultStylePanelContent from './DefaultStylePanelContent.svelte'
	import StylePanelContextProvider from './StylePanelContextProvider.svelte'

	let { isMobile, styles, children }: TLUiStylePanelProps = $props()

	const editor = getEditor()
	const enhancedA11yMode = fromComputed('enhancedA11yMode', () =>
		editor.user.getEnhancedA11yMode()
	)

	const passThroughWheelEvents = usePassThroughWheelEvents()

	// `styles === undefined` means "use the relevant styles"; an explicit `null` hides the panel.
	const defaultStyles = createRelevantStyles()
	const resolvedStyles = $derived(styles === undefined ? defaultStyles.current : styles)

	const panelEvents: Attachment<HTMLDivElement> = (elm) => {
		function handlePointerMove(event: PointerEvent) {
			// Mark the event as handled so the canvas's pointermove listener
			// (on document.body) ignores it. We use markEventAsHandled instead
			// of stopPropagation to avoid interfering with the slider's internal
			// pointer capture handling, which breaks slider drags on Safari.
			editor.markEventAsHandled(event)
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && elm.contains(editor.getContainerDocument().activeElement)) {
				event.stopPropagation()
				editor.getContainer().focus()
			}
		}

		elm.addEventListener('pointermove', handlePointerMove)
		elm.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			elm.removeEventListener('pointermove', handlePointerMove)
			elm.removeEventListener('keydown', handleKeyDown, { capture: true })
		}
	}
</script>

{#if resolvedStyles}
	<div
		{@attach passThroughWheelEvents}
		{@attach panelEvents}
		data-testid="style.panel"
		class={classNames('tlui-style-panel', { 'tlui-style-panel__wrapper': !isMobile })}
		data-ismobile={isMobile}
		data-enhanced-a11y-mode={enhancedA11yMode.current}
	>
		<StylePanelContextProvider styles={resolvedStyles}>
			{#if children}
				{@render children()}
			{:else}
				<DefaultStylePanelContent />
			{/if}
		</StylePanelContextProvider>
	</div>
{/if}
