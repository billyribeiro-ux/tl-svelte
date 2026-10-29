import { CommentTool } from '@svelte-draw/commenting'

// [1]
export const MODE_TOOLS = {
	ignore: [CommentTool],
	record: [CommentTool.configure({ history: 'record' })],
	drag: [CommentTool.configure({ dragHistory: 'record' })],
}

export type HistoryMode = keyof typeof MODE_TOOLS

export const MODES = Object.keys(MODE_TOOLS) as HistoryMode[]

export const MODE_LABELS: Record<HistoryMode, string> = {
	ignore: 'Ignore (default)',
	record: 'Record everything',
	drag: 'Record pin drags only',
}

export const MODE_HINTS: Record<HistoryMode, string> = {
	ignore: 'Undo rewinds the shape. Comments and pin positions stay put.',
	record: 'Undo rewinds comments too — the last thing you did, whatever it was.',
	drag: 'Undo rewinds the shape and pin drags, but never a posted comment.',
}
