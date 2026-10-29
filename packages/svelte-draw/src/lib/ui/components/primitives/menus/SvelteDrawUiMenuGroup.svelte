<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiMenuGroupProps<TranslationKey extends string = string> {
		id: string
		/**
		 * The label to display on the item. If it's a string, it will be translated. If it's an object, the keys will be used as the language keys and the values will be translated.
		 */
		label?: TranslationKey | { [key: string]: TranslationKey }
		class?: string
		children?: Snippet
	}
</script>

<script lang="ts" generics="TranslationKey extends string = string">
	import classNames from 'classnames'
	import { getDirection, getTranslation } from '../../../hooks/useTranslation/useTranslation.svelte'
	import { unwrapLabel } from '../../../context'
	import type { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
	import SvelteDrawUiColumn from '../SvelteDrawUiColumn.svelte'
	import SvelteDrawUiDropdownMenuGroup from '../SvelteDrawUiDropdownMenuGroup.svelte'
	import SvelteDrawUiGrid from '../SvelteDrawUiGrid.svelte'
	import SvelteDrawUiRow from '../SvelteDrawUiRow.svelte'
	import { getSvelteDrawUiOrientation } from '../layout.svelte'
	import { getSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'

	let { id, label, class: className, children: contents }: TLUiMenuGroupProps<TranslationKey> = $props()

	const menu = getSvelteDrawUiMenuContext()
	const orientationCtx = getSvelteDrawUiOrientation()
	const msg = getTranslation()
	const dir = getDirection()

	const labelToUse = $derived(unwrapLabel(label, menu.type))
	const labelStr = $derived(labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined)
	const testId = $derived(`${menu.sourceId}-group.${id}`)
</script>

{#if menu.type === 'menu'}
	<SvelteDrawUiDropdownMenuGroup class={className} data-testid={testId}>
		{@render contents?.()}
	</SvelteDrawUiDropdownMenuGroup>
{:else if menu.type === 'context-menu'}
	<div dir={dir.current} class={classNames('tlui-menu__group', className)} data-testid={testId}>
		{@render contents?.()}
	</div>
{:else if menu.type === 'keyboard-shortcuts'}
	<!-- todo: if groups need a label, let's give em a label -->
	<div class="tlui-shortcuts-dialog__group" data-testid={testId}>
		<h2 class="tlui-shortcuts-dialog__group__title">{labelStr}</h2>
		<div class="tlui-shortcuts-dialog__group__content">{@render contents?.()}</div>
	</div>
{:else if menu.type === 'toolbar'}
	{#if orientationCtx.orientation === 'horizontal'}
		<SvelteDrawUiRow class="tlui-main-toolbar__group" data-testid={testId}>
			{@render contents?.()}
		</SvelteDrawUiRow>
	{:else}
		<SvelteDrawUiColumn class="tlui-main-toolbar__group" data-testid={testId}>
			{@render contents?.()}
		</SvelteDrawUiColumn>
	{/if}
{:else if menu.type === 'toolbar-overflow'}
	<SvelteDrawUiGrid class="tlui-main-toolbar__group" data-testid={testId}>
		{@render contents?.()}
	</SvelteDrawUiGrid>
{:else}
	{@render contents?.()}
{/if}
