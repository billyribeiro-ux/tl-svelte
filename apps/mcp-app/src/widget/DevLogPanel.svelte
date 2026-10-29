<script lang="ts">
	import { DEV_LOG_PANEL_HEIGHT } from './dev-log.svelte'

	let { entries, isFullscreen }: { entries: string[]; isFullscreen: boolean } = $props()
</script>

<div
	style:flex={isFullscreen ? '0 0 160px' : undefined}
	style:min-height="80px"
	style:max-height={isFullscreen ? '200px' : `${DEV_LOG_PANEL_HEIGHT}px`}
	style:overflow="auto"
	style:padding="12px"
	style:border="1px solid var(--tl-color-muted-2)"
	style:border-radius="8px"
	style:background="var(--tl-color-panel)"
	style:font-family="monospace"
	style:font-size="12px"
	style:line-height="1.5"
	style:white-space="pre-wrap"
>
	{entries.length > 0 ? entries.join('\n') : 'Dev log ready.'}
</div>
