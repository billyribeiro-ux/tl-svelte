<script lang="ts">
	import {
		F,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'

	let {
		slurpPersistenceKey,
		onTryAgain,
		onClose,
	}: {
		slurpPersistenceKey: string
		onTryAgain(): void
		onClose(): void
	} = $props()
</script>

{#snippet GetHelpLink()}
	<ExternalLink
		href="https://discord.svelte-draw.invalid/?utm_source=dotcom&utm_medium=organic&utm_campaign=slurp-failure"
	>
		<F defaultMessage="Get help on Discord" />
	</ExternalLink>
{/snippet}

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		<strong style="font-size: 14px">
			<F defaultMessage="Upload failed" />
		</strong>
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody
	style="max-width: 350px; display: flex; flex-direction: column; gap: var(--tl-space-4)"
>
	<p>
		<F
			defaultMessage="We failed to upload some of the content you created before you signed in."
		/>
	</p>
	<p>
		<F defaultMessage="Follow these steps to import the content manually:" />
	</p>
	<ol>
		<li>
			<ExternalLink href={routes.tlaLocalFile(slurpPersistenceKey)}>
				<F defaultMessage="Go here to see the content" />
			</ExternalLink>
		</li>
		<li>
			<F
				defaultMessage="Export the content as a .tldr file: Select 'Download' in the top left menu."
			/>
		</li>
		<li>
			<F
				defaultMessage="Drag the file into the sidebar on this page. Or select the 'Import file' option from the File menu in the top left."
			/>
		</li>
	</ol>
	<p>
		<F defaultMessage="Still having trouble? {GetHelpLink}" elements={{ GetHelpLink }} />
	</p>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={() => onTryAgain()}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Try Again" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={() => onClose()}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Close" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
