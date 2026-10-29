<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiSelectProps {
		id: string
		value: string
		onValueChange(value: string): void
		onOpenChange?(isOpen: boolean): void
		disabled?: boolean
		class?: string
		children: Snippet
		'data-testid'?: string
		'aria-label'?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { Select } from 'bits-ui'
	import { createMenuIsOpen } from '../../hooks'
	import { setSelectContext } from './selectContext'

	/**
	 * A select dropdown component.
	 *
	 * @example
	 * ```svelte
	 * <SvelteDrawUiSelect id="my-select" {value} onValueChange={setValue}>
	 *   <SvelteDrawUiSelectTrigger>
	 *     <SvelteDrawUiSelectValue placeholder="Select...">One</SvelteDrawUiSelectValue>
	 *   </SvelteDrawUiSelectTrigger>
	 *   <SvelteDrawUiSelectContent>
	 *     <SvelteDrawUiSelectItem value="one" label="One" />
	 *     <SvelteDrawUiSelectItem value="two" label="Two" />
	 *   </SvelteDrawUiSelectContent>
	 * </SvelteDrawUiSelect>
	 * ```
	 *
	 * @public
	 */
	let {
		id,
		value,
		onValueChange,
		onOpenChange,
		disabled,
		class: className,
		children,
		'data-testid': dataTestId,
		'aria-label': ariaLabel,
	}: TLUiSelectProps = $props()

	const menu = createMenuIsOpen(
		() => id,
		(isOpen) => onOpenChange?.(isOpen)
	)

	setSelectContext({
		get value() {
			return value
		},
	})
</script>

<Select.Root
	type="single"
	{value}
	onValueChange={(next) => onValueChange(next)}
	bind:open={() => menu.isOpen, (next) => menu.onOpenChange(next)}
	{disabled}
>
	<div {id} class={classNames('tlui-select', className)} data-testid={dataTestId} aria-label={ariaLabel}>
		{@render children()}
	</div>
</Select.Root>
