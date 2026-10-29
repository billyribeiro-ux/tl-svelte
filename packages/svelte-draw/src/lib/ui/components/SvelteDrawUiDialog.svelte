<script lang="ts">
	import { getContainer } from '@svelte-draw/svelte'
	import { Dialog } from 'bits-ui'
	import { getDialogs, type TLUiDialog } from '../context/dialogs'
	import { getDirection } from '../hooks/useTranslation/useTranslation.svelte'

	/** @internal */
	let { id, component: ModalContent, preventBackgroundClose }: TLUiDialog = $props()

	const { removeDialog } = getDialogs()
	const container = getContainer()
	const dir = getDirection()

	let open = $state(true)
	let contentRef = $state<HTMLElement | null>(null)

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			removeDialog(id)
		}
	}

	function handleInteractOutside(e: PointerEvent) {
		// Bits UI's dismissible layers are layer-aware: an interaction outside the
		// topmost layer dismisses only that layer — an open select, or a dialog
		// stacked on top — leaving lower layers open. onInteractOutside fires for
		// the pointer press outside the dialog; opt out when the dialog asks to stay
		// open on background interactions (escape still closes it).

		// A touch press is checked against the layers at the following click rather
		// than at the press itself, so a press that closes a dialog stacked on top of
		// this one arrives here once this one is topmost, and reads as a press
		// outside it. A press inside another dialog is never outside this one, and
		// stays so after that dialog unmounts and takes the press's target with it.
		const target = e.target
		const pressedDialog = target instanceof Element ? target.closest('.tlui-dialog__content') : null
		if (preventBackgroundClose || (pressedDialog && pressedDialog !== contentRef)) {
			e.preventDefault()
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal to={container}>
		<!-- The scrim and content are siblings. The positioner sits on top of the scrim and centers
		     the content, scrolling and padding it when it's taller than the viewport. -->
		<Dialog.Overlay dir={dir.current} class="tlui-dialog__overlay" />
		<div dir={dir.current} class="tlui-dialog__positioner">
			<Dialog.Content
				bind:ref={contentRef}
				dir={dir.current}
				class="tlui-dialog__content"
				aria-describedby={undefined}
				onInteractOutside={handleInteractOutside}
			>
				<ModalContent onClose={() => handleOpenChange(false)} />
			</Dialog.Content>
		</div>
	</Dialog.Portal>
</Dialog.Root>
