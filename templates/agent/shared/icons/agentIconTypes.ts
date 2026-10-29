export const AGENT_ICON_TYPES = [
	'chevron-down',
	'chevron-right',
	'at',
	'brain',
	'comment',
	'cross',
	'cursor',
	'ellipsis',
	'eye',
	'note',
	'pencil',
	'refresh',
	'search',
	'target',
	'trash',
] as const

export type AgentIconType = (typeof AGENT_ICON_TYPES)[number]
