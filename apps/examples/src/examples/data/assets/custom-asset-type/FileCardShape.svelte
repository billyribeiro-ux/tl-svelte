<script lang="ts">
	import { HTMLContainer, fromComputed, getEditor, type TLAssetId } from 'svelte-draw'
	import type { TLFileAsset } from './FileAssetUtil'

	let { assetId }: { assetId: TLAssetId | null } = $props()

	const editor = getEditor()

	const asset = fromComputed('file card asset', () =>
		assetId ? editor.getAsset<TLFileAsset>(assetId) : null
	)

	const name = $derived(asset.current?.props.name ?? 'Unknown file')
	const size = $derived(asset.current?.props.size ?? 0)
	const src = $derived(asset.current?.props.src)

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B'
		const units = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(1024))
		const value = bytes / Math.pow(1024, i)
		return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`
	}
</script>

<HTMLContainer>
	<div
		style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-background); border: 1px solid var(--color-muted-2); border-radius: 8px; height: 100%; box-sizing: border-box; font-family: sans-serif; overflow: hidden"
	>
		<div style="font-size: 24px; flex-shrink: 0">📄</div>
		<div style="overflow: hidden; flex: 1; min-width: 0">
			<div
				style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-1)"
			>
				<!-- [8] -->
				{#if src}
					<a
						href={src}
						target="_blank"
						rel="noreferrer"
						style="color: inherit; text-decoration: underline"
					>
						{name}
					</a>
				{:else}
					{name}
				{/if}
			</div>
			<div style="font-size: 11px; color: var(--color-text-3); margin-top: 2px">
				{formatFileSize(size)}
			</div>
		</div>
	</div>
</HTMLContainer>
