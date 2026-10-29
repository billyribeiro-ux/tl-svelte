import { Mark, mergeAttributes } from 'svelte-draw'

interface OutlineExtensionOptions {
	HTMLAttributes: object
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		outline: {
			setOutline(): ReturnType
			toggleOutline(): ReturnType
			unsetOutline(): ReturnType
		}
	}
}

// [1]
export const Outline = Mark.create<OutlineExtensionOptions>({
	name: 'outline',

	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span.outlined',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, { class: 'outlined filled' }, HTMLAttributes),
			0,
		]
	},

	addCommands() {
		return {
			setOutline:
				() =>
				({ commands }) =>
					commands.setMark(this.name),
			toggleOutline:
				() =>
				({ commands }) =>
					commands.toggleMark(this.name),
			unsetOutline:
				() =>
				({ commands }) =>
					commands.unsetMark(this.name),
		}
	},
})
