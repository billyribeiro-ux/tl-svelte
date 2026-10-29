<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import {
		fromComputed,
		getEditor,
		nativeEvents,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuGroup,
		SvelteDrawUiDropdownMenuItem,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
	} from 'svelte-draw'
	import { getNodeOutputPortInfo } from './nodePorts'
	import type { NodeShape } from './NodeShapeUtil'
	import { getNodeDefinition } from './nodeTypes'

	let { shape }: { shape: NodeShape } = $props()

	const editor = getEditor()

	const outputInfoValue = $derived(
		fromComputed('output info', () => getNodeOutputPortInfo(editor, shape.id))
	)
	const outputInfo = $derived(outputInfoValue.current)

	// Find any image output that has a valid URL
	const imageUrl = $derived(
		Object.values(outputInfo).find(
			(info) =>
				info.dataType === 'image' &&
				typeof info.value === 'string' &&
				info.value &&
				info.value !== ''
		)?.value as string | undefined
	)

	const node = $derived(shape.props.node as Record<string, unknown>)
	const definition = $derived(getNodeDefinition(editor, shape.props.node))
	const resultKeys = $derived(definition.resultKeys)
	const defaults = $derived(definition.getDefault() as Record<string, unknown>)
	const hasResult = $derived(
		resultKeys ? resultKeys.some((key) => node[key] !== defaults[key]) : false
	)
	const textOutput = $derived(
		Object.values(outputInfo).find(
			(info) => info.dataType === 'text' && typeof info.value === 'string' && info.value !== ''
		)?.value as string | undefined
	)
	const textResult = $derived(
		textOutput ??
			(typeof node.lastResultText === 'string' && node.lastResultText !== ''
				? (node.lastResultText as string)
				: null)
	)

	function handleDuplicate() {
		editor.markHistoryStoppingPoint('duplicate node')
		editor.duplicateShapes([shape.id])
	}

	async function handleDownloadImage() {
		if (!imageUrl) return
		const response = await fetch(imageUrl)
		const blob = await response.blob()
		const ext = blob.type.split('/')[1] ?? 'png'
		const blobUrl = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = blobUrl
		a.download = `image.${ext}`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(blobUrl)
	}

	async function handleCopyText() {
		if (!textResult) return
		await navigator.clipboard.writeText(textResult)
	}

	function handleClearResult() {
		if (!resultKeys || resultKeys.length === 0) return
		const updates: Record<string, unknown> = {}
		for (const key of resultKeys) {
			updates[key] = defaults[key]
		}

		editor.updateShape({
			id: shape.id,
			type: shape.type,
			props: {
				node: { ...(shape.props.node as any), ...updates },
				isOutOfDate: true,
			},
		})
	}

	// Native listener: a delegated handler would run after the editor's own pointerdown listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<div class="NodeFooterMenu" {@attach stopPointerDown}>
	<SvelteDrawUiDropdownMenuRoot id={`node-menu-${shape.id}`}>
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton
					type="icon"
					title="More options"
					{...props}
					class="NodeFooterMenu-trigger"
				>
					<svg width="12" height="12" viewBox="0 0 12 12">
						<circle cx="6" cy="2" r="1.2" fill="currentColor" />
						<circle cx="6" cy="6" r="1.2" fill="currentColor" />
						<circle cx="6" cy="10" r="1.2" fill="currentColor" />
					</svg>
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<SvelteDrawUiDropdownMenuContent side="top" align="end" sideOffset={4} alignOffset={0}>
			<SvelteDrawUiDropdownMenuGroup>
				<SvelteDrawUiDropdownMenuItem>
					{#snippet child({ props })}
						<SvelteDrawUiButton {...mergeProps(props, { onclick: handleDuplicate })} type="menu">
							<SvelteDrawUiButtonLabel>Duplicate</SvelteDrawUiButtonLabel>
						</SvelteDrawUiButton>
					{/snippet}
				</SvelteDrawUiDropdownMenuItem>
				{#if imageUrl}
					<SvelteDrawUiDropdownMenuItem>
						{#snippet child({ props })}
							<SvelteDrawUiButton
								{...mergeProps(props, { onclick: handleDownloadImage })}
								type="menu"
							>
								<SvelteDrawUiButtonLabel>Download image</SvelteDrawUiButtonLabel>
							</SvelteDrawUiButton>
						{/snippet}
					</SvelteDrawUiDropdownMenuItem>
				{/if}
				{#if textResult}
					<SvelteDrawUiDropdownMenuItem>
						{#snippet child({ props })}
							<SvelteDrawUiButton {...mergeProps(props, { onclick: handleCopyText })} type="menu">
								<SvelteDrawUiButtonLabel>Copy text</SvelteDrawUiButtonLabel>
							</SvelteDrawUiButton>
						{/snippet}
					</SvelteDrawUiDropdownMenuItem>
				{/if}
				{#if hasResult}
					<SvelteDrawUiDropdownMenuItem>
						{#snippet child({ props })}
							<SvelteDrawUiButton
								{...mergeProps(props, { onclick: handleClearResult })}
								type="menu"
							>
								<SvelteDrawUiButtonLabel>Clear result</SvelteDrawUiButtonLabel>
							</SvelteDrawUiButton>
						{/snippet}
					</SvelteDrawUiDropdownMenuItem>
				{/if}
			</SvelteDrawUiDropdownMenuGroup>
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiDropdownMenuRoot>
</div>
