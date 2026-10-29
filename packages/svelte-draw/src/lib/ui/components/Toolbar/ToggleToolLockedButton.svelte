<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	/** @public */
	export interface ToggleToolLockedButtonProps {
		activeToolId?: string
	}

	const messages = defineMessages({
		actionToggleToolLock: { id: 'action.toggle-tool-lock', defaultMessage: 'Toggle tool lock' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getActions } from '../../context/actions.svelte'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { kbdStr } from '../../kbd-utils'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiTooltip from '../primitives/SvelteDrawUiTooltip.svelte'

	let { activeToolId }: ToggleToolLockedButtonProps = $props()

	const editor = getEditor()
	const breakpoint = getBreakpoint()
	const msg = getTranslation()
	const actions = getActions()

	const isToolLocked = fromComputed('is tool locked', () => editor.getInstanceState().isToolLocked)
	const tool = fromComputed('current tool', () => editor.getCurrentTool())

	const toggleLockAction = $derived(actions['toggle-tool-lock'])
	const tooltipContent = $derived(
		toggleLockAction?.kbd
			? `${msg(messages.actionToggleToolLock)} ${kbdStr(toggleLockAction.kbd)}`
			: msg(messages.actionToggleToolLock)
	)
</script>

{#if activeToolId && tool.current.isLockable}
	<SvelteDrawUiTooltip content={tooltipContent}>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="normal"
				data-testid="tool-lock"
				class={classNames('tlui-main-toolbar__lock-button', {
					'tlui-main-toolbar__lock-button__mobile': breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM,
				})}
				onclick={() => editor.updateInstanceState({ isToolLocked: !isToolLocked.current })}
			>
				<SvelteDrawUiButtonIcon icon={isToolLocked.current ? 'lock' : 'unlock'} small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiTooltip>
{/if}
