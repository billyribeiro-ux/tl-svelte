<script lang="ts">
	import { tlenv, type TLAssetId, type TLBookmarkAsset } from '@svelte-draw/editor'
	import { fromComputed, getEditor, getSvgExportContext, HTMLContainer } from '@svelte-draw/svelte'
	import { convertCommonTitleHTMLEntities } from '../../utils/text/text'
	import HyperlinkButton from '../shared/HyperlinkButton.svelte'
	import { LINK_ICON } from '../shared/icons-editor'
	import { nativeEvents } from '../shared/nativeEvents'
	import { getRotatedBoxShadow } from '../shared/rotated-box-shadow'
	import { getHumanReadableAddress, getResolvedBookmarkAssetId } from './bookmarks'

	let {
		assetId,
		rotation,
		url,
		h,
		showImageContainer = true,
	}: {
		assetId: TLAssetId | null
		rotation: number
		h: number
		url: string
		showImageContainer?: boolean
	} = $props()

	const editor = getEditor()

	const asset = fromComputed('bookmarkAsset', () => {
		const resolvedAssetId = getResolvedBookmarkAssetId(editor, assetId, url)
		return resolvedAssetId ? (editor.getAsset(resolvedAssetId) as TLBookmarkAsset) : null
	})

	const isSafariExport = !!getSvgExportContext() && tlenv.isSafari

	const address = $derived(getHumanReadableAddress(url))

	let isFaviconValid = $state(true)
	const onFaviconError = () => {
		isFaviconValid = false
	}

	function markAsHandledOnShiftKey(e: PointerEvent) {
		if (!editor.inputs.getShiftKey()) editor.markEventAsHandled(e)
	}

	const linkEvents = nativeEvents({
		pointerdown: markAsHandledOnShiftKey,
		pointerup: markAsHandledOnShiftKey,
	})

	const mask = `url("${LINK_ICON}") center 100% / 100% no-repeat`
	const boxShadow = $derived(isSafariExport ? undefined : getRotatedBoxShadow(rotation))
</script>

<HTMLContainer>
	<div
		class={['tl-bookmark__container', isSafariExport && 'tl-bookmark__container--safariExport']}
		style:box-shadow={boxShadow}
		style:max-height="{h}px"
	>
		{#if showImageContainer && (!asset.current || asset.current.props.image)}
			<div class="tl-bookmark__image_container">
				{#if asset.current}
					<img
						class="tl-bookmark__image"
						draggable={false}
						referrerpolicy="strict-origin-when-cross-origin"
						src={asset.current.props.image}
						alt={asset.current.props.title || ''}
					/>
				{:else}
					<div class="tl-bookmark__placeholder"></div>
				{/if}
				{#if asset.current?.props.image}<HyperlinkButton {url} />{/if}
			</div>
		{/if}
		<div class="tl-bookmark__copy_container">
			{#if asset.current?.props.title}
				<a
					class="tl-bookmark__link"
					href={url || ''}
					target="_blank"
					rel="noopener noreferrer"
					draggable={false}
					{@attach linkEvents}
				>
					<h2 class="tl-bookmark__heading">
						{convertCommonTitleHTMLEntities(asset.current.props.title)}
					</h2>
				</a>
			{/if}
			{#if asset.current?.props.description && asset.current?.props.image}
				<p class="tl-bookmark__description">{asset.current.props.description}</p>
			{/if}
			<a
				class="tl-bookmark__link"
				href={url || ''}
				target="_blank"
				rel="noopener noreferrer"
				draggable={false}
				{@attach linkEvents}
			>
				{#if isFaviconValid && asset.current?.props.favicon}
					<img
						class="tl-bookmark__favicon"
						src={asset.current.props.favicon}
						referrerpolicy="strict-origin-when-cross-origin"
						onerror={onFaviconError}
						alt={`favicon of ${address}`}
					/>
				{:else}
					<div class="tl-hyperlink__icon" style:mask style:-webkit-mask={mask}></div>
				{/if}
				<span>{address}</span>
			</a>
		</div>
	</div>
</HTMLContainer>
