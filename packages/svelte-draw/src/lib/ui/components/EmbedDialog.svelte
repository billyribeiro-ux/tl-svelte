<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		embedDialogBack: { id: 'embed-dialog.back', defaultMessage: 'Back' },
		embedDialogCancel: { id: 'embed-dialog.cancel', defaultMessage: 'Cancel' },
		embedDialogCreate: { id: 'embed-dialog.create', defaultMessage: 'Create' },
		embedDialogInstruction: {
			id: 'embed-dialog.instruction',
			defaultMessage: 'Paste in the site’s URL to create the embed.',
		},
		embedDialogInvalidUrl: {
			id: 'embed-dialog.invalid-url',
			defaultMessage: 'We could not create an embed from that URL.',
		},
		embedDialogLearnMore: { id: 'embed-dialog.learn-more', defaultMessage: 'Learn more' },
		embedDialogTitle: { id: 'embed-dialog.title', defaultMessage: 'Insert embed' },
		embedDialogUrl: { id: 'embed-dialog.url', defaultMessage: 'URL' },
	})
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import {
		isCustomEmbedDefinition,
		isDefaultEmbedDefinitionType,
		type TLEmbedDefinition,
	} from '../../defaultEmbedDefinitions'
	import type { TLEmbedResult } from '../../utils/embeds/embeds'
	import { getAssetUrlsHolder } from '../context/asset-urls'
	import type { TLUiDialogProps } from '../context/dialogs'
	import { getEmbedDefinition } from '../hooks/useGetEmbedDefinition'
	import { getEmbedDefinitions } from '../hooks/useGetEmbedDefinitions'
	import { getTranslation, untranslated } from '../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from './primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonLabel from './primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDialogBody from './primitives/SvelteDrawUiDialogBody.svelte'
	import SvelteDrawUiDialogCloseButton from './primitives/SvelteDrawUiDialogCloseButton.svelte'
	import SvelteDrawUiDialogFooter from './primitives/SvelteDrawUiDialogFooter.svelte'
	import SvelteDrawUiDialogHeader from './primitives/SvelteDrawUiDialogHeader.svelte'
	import SvelteDrawUiDialogTitle from './primitives/SvelteDrawUiDialogTitle.svelte'
	import SvelteDrawUiInput from './primitives/SvelteDrawUiInput.svelte'

	let { onClose }: TLUiDialogProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const assetUrls = getAssetUrlsHolder()

	// The embed definition for the user's selected embed (set by the user clicking on an embed in stage 1)
	let embedDefinition = $state.raw<null | TLEmbedDefinition>(null)

	// The URL that the user has typed into (in stage 2)
	let url = $state('')

	// The embed info for the user's selected embed (based on the URL they've entered in stage 2)
	let embedInfoForUrl = $state.raw<null | TLEmbedResult>(null)

	// Should we show the "invalid URL" error message?
	let showError = $state(false)
	let showErrorTimeout: ReturnType<typeof editor.timers.setTimeout> | undefined

	const definitions = getEmbedDefinitions()
	const getDefinition = getEmbedDefinition()

	$effect(() => () => clearTimeout(showErrorTimeout))

	function handleValueChange(value: string, definition: TLEmbedDefinition) {
		// Set the url that the user has typed into the input
		url = value

		// Set the embed info to either the embed info for the URL (if
		// that embed info can be found and of a type that matches the
		// user's selected definition type)
		const embedInfo = getDefinition(value)
		embedInfoForUrl = embedInfo && embedInfo.definition.type === definition.type ? embedInfo : null

		// We want to hide the error when the user enters text,
		// and then show an error after a short delay if the user
		// has not yet entered a valid URL.
		showError = false
		clearTimeout(showErrorTimeout)

		showErrorTimeout = editor.timers.setTimeout(() => {
			showError = !embedInfo
		}, 320)
	}
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		{embedDefinition
			? `${msg(messages.embedDialogTitle)} — ${embedDefinition.title}`
			: msg(messages.embedDialogTitle)}
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
{#if embedDefinition}
	{@const definition = embedDefinition}
	<SvelteDrawUiDialogBody class="tlui-embed-dialog__enter">
		<SvelteDrawUiInput
			class="tlui-embed-dialog__input"
			label={messages.embedDialogUrl.id}
			placeholder="https://example.com"
			autoFocus
			onValueChange={(value) => handleValueChange(value, definition)}
		/>
		{#if url === ''}
			<div class="tlui-embed-dialog__instruction">
				<span>{msg(messages.embedDialogInstruction)}</span>{' '}
				{#if definition.instructionLink}
					<a
						target="_blank"
						rel="noopener noreferrer"
						href={definition.instructionLink}
						class="tlui-embed-dialog__instruction__link"
					>
						{msg(messages.embedDialogLearnMore)}
					</a>.
				{/if}
			</div>
		{:else}
			<div class="tlui-embed-dialog__warning">
				{showError ? msg(messages.embedDialogInvalidUrl) : '\xa0'}
			</div>
		{/if}
	</SvelteDrawUiDialogBody>
	<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
		<SvelteDrawUiButton
			type="normal"
			onclick={() => {
				embedDefinition = null
				embedInfoForUrl = null
				url = ''
			}}
		>
			<SvelteDrawUiButtonLabel>{msg(messages.embedDialogBack)}</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<div class="tlui-embed__spacer"></div>
		<SvelteDrawUiButton type="normal" onclick={() => onClose()}>
			<SvelteDrawUiButtonLabel>{msg(messages.embedDialogCancel)}</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<SvelteDrawUiButton
			type="primary"
			disabled={!embedInfoForUrl}
			onclick={() => {
				if (!embedInfoForUrl) return

				editor.putExternalContent({
					type: 'embed',
					url,
					point: editor.getViewportPageBounds().center,
					embed: embedInfoForUrl.definition,
				})

				onClose()
			}}
		>
			<SvelteDrawUiButtonLabel>{msg(messages.embedDialogCreate)}</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</SvelteDrawUiDialogFooter>
{:else}
	<SvelteDrawUiDialogBody class="tlui-embed-dialog__list">
		{#each definitions as def (def.type)}
			{@const icon = isDefaultEmbedDefinitionType(def.type)
				? assetUrls.current.embedIcons[def.type]
				: isCustomEmbedDefinition(def)
					? def.icon
					: undefined}
			<SvelteDrawUiButton type="menu" onclick={() => (embedDefinition = def)}>
				<SvelteDrawUiButtonLabel>{untranslated(def.title)}</SvelteDrawUiButtonLabel>
				{#if icon}
					<div class="tlui-embed-dialog__item__image" style:background-image="url({icon})"></div>
				{/if}
			</SvelteDrawUiButton>
		{/each}
	</SvelteDrawUiDialogBody>
{/if}
