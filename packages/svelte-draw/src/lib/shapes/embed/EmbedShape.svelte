<script lang="ts">
	import { toDomPrecision, type TLEmbedShape } from '@svelte-draw/editor'
	import {
		createColorMode,
		fromComputed,
		getEditor,
		getSvgExportContext,
		HTMLContainer,
		useIsEditing,
	} from '@svelte-draw/svelte'
	import {
		embedShapePermissionDefaults,
		unknownEmbedShapePermissionOverrides,
	} from '../../defaultEmbedDefinitions'
	import BookmarkShapeComponent from '../bookmark/BookmarkShapeComponent.svelte'
	import { getDisplayValues } from '../shared/getDisplayValues'
	import { getRotatedBoxShadow } from '../shared/rotated-box-shadow'
	import { styleToString } from '../shared/styleToString'
	import EmbedGist from './EmbedGist.svelte'
	import { getSandboxPermissions } from './embedHelpers'
	import type { EmbedShapeUtil } from './EmbedShapeUtil'

	let { util, shape }: { util: EmbedShapeUtil; shape: TLEmbedShape } = $props()

	const editor = getEditor()
	const svgExport = getSvgExportContext()
	const isEditing = useIsEditing(() => shape.id)
	const colorMode = createColorMode(editor, () => svgExport?.colorMode)
	const theme = fromComputed('theme', () => editor.getCurrentTheme())
	const dv = $derived.by(() => {
		void theme.current
		return getDisplayValues(util, shape, colorMode.current)
	})

	const w = $derived(shape.props.w)
	const h = $derived(shape.props.h)
	const url = $derived(shape.props.url)
	const embedInfo = $derived(util.getEmbedDefinition(url))

	const isHoveringWhileEditingSameShape = fromComputed('is hovering', () => {
		const { editingShapeId, hoveredShapeId } = editor.getCurrentPageState()

		if (editingShapeId && hoveredShapeId !== editingShapeId) {
			const editingShape = editor.getShape(editingShapeId)
			if (editingShape && editor.isShapeOfType(editingShape, 'embed')) {
				return true
			}
		}

		return false
	})

	const pageRotation = fromComputed('pageRotation', () =>
		editor.getShapePageTransform(shape.id)!.rotation()
	)

	const isInteractive = $derived(isEditing.current || isHoveringWhileEditingSameShape.current)

	// Prevent nested embedding of svelte-draw
	const isIframe =
		typeof window !== 'undefined' && (window !== window.top || window.self !== window.parent)
	const isNestedSvelteDraw = $derived(isIframe && embedInfo?.definition.type === 'svelte-draw')

	const sandbox = $derived(
		getSandboxPermissions({
			...embedShapePermissionDefaults,
			...(embedInfo
				? (embedInfo.definition.overridePermissions ?? {})
				: unknownEmbedShapePermissionOverrides),
		})
	)

	const gist = $derived.by(() => {
		if (embedInfo?.definition.type !== 'github_gist') return null
		const idFromGistUrl = embedInfo.url.split('/').pop()
		if (!idFromGistUrl) throw Error('No gist id!')

		// Gist embeds use srcDoc, so we must disable allow-same-origin. Otherwise
		// the embedded script shares the parent's origin and can escape the sandbox.
		const gistSandbox = getSandboxPermissions({
			...embedShapePermissionDefaults,
			...(embedInfo?.definition?.overridePermissions ?? {}),
			'allow-same-origin': false,
		})
		return { id: idFromGistUrl, sandbox: gistSandbox }
	})

	const iframeSrc = $derived(embedInfo?.embedUrl ?? url)
</script>

{#if svgExport}
	<!-- for SVG exports, we show a blank embed -->
	<HTMLContainer class="tl-embed-container" id={shape.id}>
		<div
			class="tl-embed"
			style={styleToString({
				border: 0,
				boxShadow: dv.showShadow ? getRotatedBoxShadow(pageRotation.current) : 'none',
				borderRadius: embedInfo?.definition.overrideOutlineRadius ?? 8,
				background: embedInfo?.definition.backgroundColor ?? 'var(--tl-color-background)',
				width: w,
				height: h,
			})}
		></div>
	</HTMLContainer>
{:else if isNestedSvelteDraw}
	<!-- Prevent nested embedding of svelte-draw -->
{:else if gist}
	<HTMLContainer class="tl-embed-container" id={shape.id}>
		<EmbedGist
			id={gist.id}
			sandbox={gist.sandbox}
			width={toDomPrecision(w)!}
			height={toDomPrecision(h)!}
			{isInteractive}
			pageRotation={pageRotation.current}
			showShadow={dv.showShadow}
		/>
	</HTMLContainer>
{:else}
	<HTMLContainer class="tl-embed-container" id={shape.id}>
		{#if iframeSrc}
			<!-- svelte-ignore a11y_missing_attribute, a11y_no_noninteractive_tabindex -->
			<iframe
				class="tl-embed"
				{sandbox}
				src={iframeSrc}
				width={toDomPrecision(w)}
				height={toDomPrecision(h)}
				draggable={false}
				frameborder="0"
				referrerpolicy="strict-origin-when-cross-origin"
				tabindex={isEditing.current ? 0 : -1}
				allowfullscreen
				style={styleToString({
					border: 0,
					// Fill the container exactly. Relying on the fixed pixel width/height causes
					// the flex-centered iframe to be rounded independently from its box at
					// fractional sizes/zooms, leaving a 1-2px background sliver on one edge.
					width: '100%',
					height: '100%',
					pointerEvents: isInteractive ? 'auto' : 'none',
					// Fix for safari <https://stackoverflow.com/a/49150908>
					zIndex: isInteractive ? '' : '-1',
					boxShadow: dv.showShadow ? getRotatedBoxShadow(pageRotation.current) : 'none',
					borderRadius: embedInfo?.definition?.overrideOutlineRadius ?? 8,
					background: embedInfo?.definition?.backgroundColor,
				})}
			></iframe>
		{:else}
			<BookmarkShapeComponent
				{url}
				{h}
				rotation={pageRotation.current}
				assetId={null}
				showImageContainer={false}
			/>
		{/if}
	</HTMLContainer>
{/if}
