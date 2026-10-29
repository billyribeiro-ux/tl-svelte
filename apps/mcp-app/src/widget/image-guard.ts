import type { TLUiOverrides } from 'svelte-draw'

export function extractImageFiles(data: DataTransfer | null): File[] {
	if (!data) return []
	const result: File[] = []
	for (const item of data.items) {
		if (item.kind === 'file' && item.type.startsWith('image/')) {
			const file = item.getAsFile()
			if (file) result.push(file)
		}
	}
	if (result.length > 0) return result
	return [...data.files].filter((f) => f.type.startsWith('image/'))
}

const COMING_SOON_TOAST = {
	id: 'feature-coming-soon',
	title: 'Coming soon',
	description: 'This feature is coming soon!',
	severity: 'info' as const,
}

/** Override actions/tools to block media, embeds, and flatten. */
export const uiOverrides: TLUiOverrides = {
	actions(_editor, actions, helpers) {
		const { 'insert-media': _media, 'insert-embed': _embed, ...rest } = actions
		return {
			...rest,
			'flatten-to-image': {
				...actions['flatten-to-image'],
				onSelect() {
					helpers.addToast(COMING_SOON_TOAST)
				},
			},
		}
	},
	tools(_editor, tools) {
		// Remove the asset tool (image/media picker from toolbar)
		const { asset: _asset, ...rest } = tools
		return rest
	},
}
