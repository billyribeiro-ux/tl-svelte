<script lang="ts">
	import { Select } from 'bits-ui'
	import {
		getContainer,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		type TLUiDialogProps,
	} from 'svelte-draw'

	let { onClose }: TLUiDialogProps = $props()

	const container = getContainer()
	let value = $state('a')
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>Dialog with a select</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px;">
	<p>A select opened inside a modal is its own dismissable layer.</p>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			data-testid="dialog-select.trigger"
			style="display: flex; align-items: center; gap: 8px;"
		>
			Option {value}
			<span aria-hidden="true">▾</span>
		</Select.Trigger>
		<Select.Portal to={container}>
			<Select.Content
				data-testid="dialog-select.content"
				sideOffset={4}
				style="background-color: var(--tl-color-panel); box-shadow: var(--tl-shadow-3); border-radius: var(--tl-radius-2); padding: 4px; z-index: var(--tl-layer-canvas-overlays);"
			>
				<Select.Viewport>
					{#each ['a', 'b', 'c'] as v (v)}
						<Select.Item
							data-testid={`dialog-select.item-${v}`}
							style="padding: 4px 8px; cursor: pointer;"
							value={v}
							label={`Option ${v}`}
						>
							Option {v}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="primary" onclick={onClose}>
		<SvelteDrawUiButtonLabel>Done</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
