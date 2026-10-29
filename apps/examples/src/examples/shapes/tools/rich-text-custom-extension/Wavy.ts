import { Mark, mergeAttributes } from 'svelte-draw'

interface WavyExtensionOptions {
	HTMLAttributes: object
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		wavy: {
			setWavy(): ReturnType
			toggleWavy(): ReturnType
			unsetWavy(): ReturnType
		}
	}
}

// [1]
export const Wavy = Mark.create<WavyExtensionOptions>({
	name: 'wavy',

	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span.wavy',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, { class: 'wavy' }, HTMLAttributes),
			0,
		]
	},

	addCommands() {
		return {
			setWavy:
				() =>
				({ commands }) =>
					commands.setMark(this.name),
			toggleWavy:
				() =>
				({ commands }) =>
					commands.toggleMark(this.name),
			unsetWavy:
				() =>
				({ commands }) =>
					commands.unsetMark(this.name),
		}
	},
})
