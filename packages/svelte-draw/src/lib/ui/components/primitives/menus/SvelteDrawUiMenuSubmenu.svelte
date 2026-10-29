<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiMenuSubmenuProps<Translation extends string = string> {
		id: string
		label?: Translation | { [key: string]: Translation }
		disabled?: boolean
		children: Snippet
		size?: 'tiny' | 'small' | 'medium' | 'wide'
	}
</script>

<script lang="ts" generics="Translation extends string = string">
	import { getContainer } from '@svelte-draw/svelte'
	import { ContextMenu, DropdownMenu, mergeProps } from 'bits-ui'
	import { getDirection, getTranslation } from '../../../hooks/useTranslation/useTranslation.svelte'
	import { unwrapLabel } from '../../../context'
	import type { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
	import SvelteDrawUiButton from '../Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiButtonLabel from '../Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDropdownMenuSub from '../SvelteDrawUiDropdownMenuSub.svelte'
	import SvelteDrawUiDropdownMenuSubContent from '../SvelteDrawUiDropdownMenuSubContent.svelte'
	import SvelteDrawUiDropdownMenuSubTrigger from '../SvelteDrawUiDropdownMenuSubTrigger.svelte'
	import ContextMenuSubWithMenu from './ContextMenuSubWithMenu.svelte'
	import { getSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'

	let {
		id,
		disabled = false,
		label,
		size = 'small',
		children,
	}: TLUiMenuSubmenuProps<Translation> = $props()

	const menu = getSvelteDrawUiMenuContext()
	const container = getContainer()
	const msg = getTranslation()
	const dir = getDirection()

	const labelToUse = $derived(unwrapLabel(label, menu.type))
	const labelStr = $derived(labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined)
</script>

{#if menu.type === 'menu'}
	<SvelteDrawUiDropdownMenuSub id={`${menu.sourceId}-sub.${id}`}>
		<SvelteDrawUiDropdownMenuSubTrigger
			id={`${menu.sourceId}-sub.${id}-button`}
			{disabled}
			label={labelStr!}
		/>
		<SvelteDrawUiDropdownMenuSubContent id={`${menu.sourceId}-sub.${id}-content`} {size}>
			{@render children()}
		</SvelteDrawUiDropdownMenuSubContent>
	</SvelteDrawUiDropdownMenuSub>
{:else if menu.type === 'context-menu'}
	{#if !disabled}
		<ContextMenuSubWithMenu id={`${menu.sourceId}-sub.${id}`}>
			<ContextMenu.SubTrigger {disabled}>
				{#snippet child({ props })}
					<SvelteDrawUiButton
						type="menu"
						class="tlui-menu__submenu__trigger"
						{...mergeProps(props, {
							dir: dir.current,
							'data-testid': `${menu.sourceId}-sub.${id}-button`,
						})}
					>
						<SvelteDrawUiButtonLabel>{labelStr}</SvelteDrawUiButtonLabel>
						<SvelteDrawUiButtonIcon
							icon={dir.current === 'rtl' ? 'chevron-left' : 'chevron-right'}
							small
						/>
					</SvelteDrawUiButton>
				{/snippet}
			</ContextMenu.SubTrigger>
			<ContextMenu.Portal to={container}>
				<ContextMenu.SubContent
					data-testid={`${menu.sourceId}-sub.${id}-content`}
					class="tlui-menu tlui-menu__submenu__content"
					alignOffset={-1}
					sideOffset={-4}
					collisionPadding={4}
					data-size={size}
				>
					{@render children()}
				</ContextMenu.SubContent>
			</ContextMenu.Portal>
		</ContextMenuSubWithMenu>
	{/if}
{:else}
	<!-- no submenus in actions -->
	{@render children()}
{/if}
