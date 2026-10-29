<script lang="ts">
	import type { AgentIconType } from './agentIconTypes'
	import AtIcon from './AtIcon.svelte'
	import BrainIcon from './BrainIcon.svelte'
	import ChevronDownIcon from './ChevronDownIcon.svelte'
	import ChevronRightIcon from './ChevronRightIcon.svelte'
	import CommentIcon from './CommentIcon.svelte'
	import CrossIcon from './CrossIcon.svelte'
	import CursorIcon from './CursorIcon.svelte'
	import EllipsisIcon from './EllipsisIcon.svelte'
	import EyeIcon from './EyeIcon.svelte'
	import NoteIcon from './NoteIcon.svelte'
	import PencilIcon from './PencilIcon.svelte'
	import RefreshIcon from './RefreshIcon.svelte'
	import SearchIcon from './SearchIcon.svelte'
	import TargetIcon from './TargetIcon.svelte'
	import TrashIcon from './TrashIcon.svelte'

	let { type }: { type: AgentIconType } = $props()
</script>

{#if type === 'chevron-down'}
	<ChevronDownIcon />
{:else if type === 'chevron-right'}
	<ChevronRightIcon />
{:else if type === 'at'}
	<AtIcon />
{:else if type === 'brain'}
	<BrainIcon />
{:else if type === 'comment'}
	<CommentIcon />
{:else if type === 'cross'}
	<CrossIcon />
{:else if type === 'cursor'}
	<CursorIcon />
{:else if type === 'ellipsis'}
	<EllipsisIcon />
{:else if type === 'eye'}
	<EyeIcon />
{:else if type === 'note'}
	<NoteIcon />
{:else if type === 'pencil'}
	<PencilIcon />
{:else if type === 'refresh'}
	<RefreshIcon />
{:else if type === 'search'}
	<SearchIcon />
{:else if type === 'target'}
	<TargetIcon />
{:else if type === 'trash'}
	<TrashIcon />
{/if}
