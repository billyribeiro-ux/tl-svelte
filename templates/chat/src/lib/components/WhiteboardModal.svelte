<script lang="ts" module>
	import type { TLComponents, SvelteDrawOptions } from 'svelte-draw'
	import WhiteboardActions from './WhiteboardActions.svelte'

	const options: Partial<SvelteDrawOptions> = {
		// disable the ability to create new pages:
		maxPages: 1,
		// make sure the action shortcuts are always in the top-right menu area, not on the toolbar:
		actionShortcutsLocation: 'menu',
		// disable font pre-loading to avoid the ui popping in after the modal appears:
		maxFontsToLoadBeforeRender: 0,
	}

	// components are used to override parts of the svelte-draw ui. they shouldn't change often, so
	// it's important that we define them outside the svelte-draw component.
	const components: TLComponents = {
		// The "SharePanel" is in the top-right of the editor. Here we want it to show our save
		// and cancel buttons:
		SharePanel: WhiteboardActions,
	}
</script>

<script lang="ts">
	import { SvelteDraw, type Editor, type TLEditorSnapshot } from 'svelte-draw'
	import InsideOfSvelteDrawContext from './InsideOfSvelteDrawContext.svelte'
	import type { WhiteboardImage } from './types'
	import { setWhiteboardActions } from './whiteboardContext'

	let {
		initialSnapshot,
		onCancel,
		onAccept,
		imageId,
		uploadedFile,
		imageName,
	}: {
		initialSnapshot?: TLEditorSnapshot
		onCancel: () => void
		onAccept: (image: WhiteboardImage) => void
		imageId?: string
		uploadedFile?: File
		imageName?: string
	} = $props()

	let editor = $state.raw<Editor | null>(null)

	async function handleSave() {
		if (!editor) return

		// if there are no shapes, we don't want to save the image:
		const shapes = editor.getCurrentPageShapes()
		if (shapes.length === 0) {
			onCancel()
			return
		}

		// when the user clicks save, we convert the current whiteboard to an image:
		const image = await editor.toImageDataUrl(shapes, { format: 'png' })

		// we also take a snapshot of the editor state, so we can still edit
		// it if we open it up again later, and we pass the image data and the
		// snapshot to the parent component, so it can add it to the chat input:
		onAccept({
			id: imageId ?? crypto.randomUUID(),
			name: imageName ?? 'svelte-draw whiteboard.png',
			snapshot: editor.getSnapshot(),
			type: 'image/png',
			...image,
		})
	}

	setWhiteboardActions({
		get imageId() {
			return imageId
		},
		onCancel: () => onCancel(),
		onSave: () => handleSave(),
	})

	// when the user clicks outside the modal, we close it. we add their image to the chat input in
	// case they wanted it - they can easily delete it if not.
	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleSave()
		}
	}

	function handleMount(mountedEditor: Editor) {
		editor = mountedEditor

		mountedEditor.user.updateUserPreferences({ colorScheme: 'light' })
		mountedEditor.selectNone()
		mountedEditor.zoomToSelection()
	}
</script>

<!-- the overlay closes the modal when it is clicked, the editor inside handles its own keyboard -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleOverlayClick}>
	<SvelteDraw
		{components}
		forceMobile
		{options}
		snapshot={initialSnapshot}
		onMount={handleMount}
	>
		<!-- if the user uploaded a file, we insert it in a special component. this means we can use
		functions that depend on svelte-draw's ui to do things like show a toast if something goes
		wrong. -->
		<InsideOfSvelteDrawContext {uploadedFile} />
	</SvelteDraw>
</div>
