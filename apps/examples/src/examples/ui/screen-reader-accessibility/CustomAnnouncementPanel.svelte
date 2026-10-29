<script lang="ts">
	import { SvelteDrawUiButton, getA11y, getEditor } from 'svelte-draw'

	const editor = getEditor()
	// [4]
	const a11y = getA11y()
	let isEnabled = $state(false)

	// [5]
	const handleActionConfirmation = () => {
		const selectedShapes = editor.getSelectedShapes()
		if (selectedShapes.length > 0) {
			a11y.announce({
				msg: `Action completed for ${selectedShapes.length} shape${selectedShapes.length === 1 ? '' : 's'}`,
				priority: 'polite',
			})
		} else {
			a11y.announce({
				msg: 'No shapes selected',
				priority: 'polite',
			})
		}
	}

	// [6]
	const handleValidation = () => {
		const selectedShapes = editor.getSelectedShapes()
		if (selectedShapes.length === 0) {
			a11y.announce({
				msg: 'Validation failed: No shapes selected',
				priority: 'assertive',
			})
		} else {
			const hasText = selectedShapes.some((shape) => {
				const util = editor.getShapeUtil(shape)
				return util.getText(shape)
			})
			if (!hasText) {
				a11y.announce({
					msg: 'Validation failed: Selected shapes must contain text',
					priority: 'assertive',
				})
			} else {
				a11y.announce({
					msg: 'Validation passed',
					priority: 'polite',
				})
			}
		}
	}

	// [7]
	const handleToggle = () => {
		isEnabled = !isEnabled
		a11y.announce({
			msg: `Feature ${isEnabled ? 'enabled' : 'disabled'}`,
			priority: 'polite',
		})
	}
</script>

<div class="tlui-menu announcement-panel">
	<SvelteDrawUiButton type="normal" onclick={handleActionConfirmation}>
		Perform action
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={handleValidation}>Validate selection</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={handleToggle}>
		{isEnabled ? 'Disable' : 'Enable'} feature
	</SvelteDrawUiButton>
</div>

<!--
[4]
`getA11y()` returns the accessibility context. It must be called during initialisation of a
component rendered inside `<SvelteDraw />`, such as this `TopPanel` component.

[5]
Polite announcements queue behind whatever the screen reader is currently
saying. Use them for confirmations and status updates.

[6]
Assertive announcements interrupt the current speech. Reserve them for
messages the user must hear now, like validation errors.

[7]
Announce state changes when the visible change alone (here, the button label
flipping) wouldn't be noticed by a screen reader user.
-->
