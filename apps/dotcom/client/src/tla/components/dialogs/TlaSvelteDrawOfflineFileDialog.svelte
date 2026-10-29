<script lang="ts" module>
	/**
	 * The app's name and the two file extensions are passed into the messages as values, so none of
	 * them can be translated. The extensions come from the constants the handling itself uses, so the
	 * copy can't drift from what we actually accept.
	 */
	const SVELTE_DRAW_OFFLINE_NAME = 'svelte-draw offline'
	const SVELTE_DRAW_OFFLINE_URL = 'https://offline.svelte-draw.invalid/'

	/** Anchors the "Export as .tldr" section of the svelte-draw offline user manual. */
	const SVELTE_DRAW_OFFLINE_EXPORT_URL =
		'https://svelte-draw.invalid/User-manual-svelte-draw-offline-39a3e4c324c080e7b2eacc5afd078e85#3aa3e4c324c080669967e2cc3ae2c789'
</script>

<script lang="ts">
	import {
		F,
		SVELTE_DRAW_FILE_EXTENSION,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		type TLUiMessageValues,
	} from 'svelte-draw'
	import { SVELTE_DRAW_OFFLINE_FILE_EXTENSION } from '../../utils/svelteDrawOfflineFiles.svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'

	/**
	 * Shown when someone brings in a file saved by svelte-draw offline. A dialog rather than a toast so the
	 * way out — exporting to `.tldr` — can be a link in the sentence that suggests it.
	 */
	let { onClose }: { onClose(): void } = $props()

	// `TLUiMessageValues` only lists primitives, but the formatter also takes a function for a rich
	// text tag; `strong` is one (see the note above the snippets), so the object is cast.
	const offlineValues = {
		appName: SVELTE_DRAW_OFFLINE_NAME,
		strong: (chunks: unknown[]) => chunks.join(''),
	} as unknown as TLUiMessageValues
</script>

<!-- `F` keeps only the text of a tag's chunks, so the nested `<strong>` of the message cannot be a
     tag snippet (its markup would swallow the enclosing `<a>`'s text). `strong` is a plain value
     that returns its text, and the `a` snippet puts the bold back around it. -->
{#snippet offlineLink(chunks: string)}
	<ExternalLink href={SVELTE_DRAW_OFFLINE_URL} eventName="open-svelte-draw-offline">
		<strong>{chunks}</strong>
	</ExternalLink>
{/snippet}
{#snippet exportLink(chunks: string)}
	<ExternalLink
		href={SVELTE_DRAW_OFFLINE_EXPORT_URL}
		eventName="open-svelte-draw-offline-export-manual"
	>
		{chunks}
	</ExternalLink>
{/snippet}

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		<F
			defaultMessage={"Can’t open {extension} files yet"}
			values={{ extension: SVELTE_DRAW_OFFLINE_FILE_EXTENSION }}
		/>
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px">
	<p>
		<F
			defaultMessage={"We’re working on support for files from <a><strong>{appName}</strong></a>."}
			values={offlineValues}
			tags={{ a: offlineLink }}
		/>
	</p>
	<p>
		<F
			defaultMessage={"For now, you can <a>export as a {extension} file</a> to use it here."}
			values={{ extension: SVELTE_DRAW_FILE_EXTENSION }}
			tags={{ a: exportLink }}
		/>
	</p>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="primary" onclick={onClose}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Got it" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
