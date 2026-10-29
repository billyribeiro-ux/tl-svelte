<script lang="ts">
	import { AlertDialog } from 'bits-ui'
	import type { Example } from './examples.js'
	import SidebarIcon from './SidebarIcon.svelte'

	let { example, onClose }: { example: Example; onClose(): void } = $props()

	// Failures are logged, as before; the dialog then simply shows no description.
	const content = $derived(
		example.loadContent().catch((error) => {
			console.error(error)
			return { description: '', details: '' }
		})
	)
</script>

<AlertDialog.Root
	open
	onOpenChange={(open) => {
		if (!open) onClose()
	}}
>
	<AlertDialog.Overlay class="example__dialog__overlay" onpointerdown={() => onClose()} />
	<AlertDialog.Content class="example__dialog__content">
		<div class="example__dialog__header">
			<AlertDialog.Title class="example__dialog__title">{example.title}</AlertDialog.Title>
			<AlertDialog.Cancel class="example__dialog__header__close" aria-label="Close">
				<SidebarIcon name="close" />
			</AlertDialog.Cancel>
		</div>
		<AlertDialog.Description>
			{#snippet child({ props })}
				<div {...props} class="example__dialog__body">
					{#await content then loaded}
						<div class="examples__markdown example__dialog__markdown">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- html rendered from the README by the Vite plugin -->
							{@html loaded.description}
						</div>
						<div class="examples__markdown example__dialog__markdown">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- html rendered from the README by the Vite plugin -->
							{@html loaded.details}
						</div>
					{/await}
				</div>
			{/snippet}
		</AlertDialog.Description>
		<div class="example__dialog__actions">
			<a href={example.codeUrl}>
				View Source <SidebarIcon name="external" />
			</a>
			<AlertDialog.Cancel class="example__dialog__close">Close</AlertDialog.Cancel>
		</div>
	</AlertDialog.Content>
</AlertDialog.Root>
