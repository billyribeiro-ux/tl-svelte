<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** React took a `ReactNode`; a string, or a snippet taking no arguments. */
	export type TlaMenuSelectLabel = string | Snippet

	export interface TlaMenuSelectOption<T extends string> {
		value: T
		label: TlaMenuSelectLabel
		disabled?: boolean
	}

	export interface TlaMenuSelectAction {
		id: string
		label: TlaMenuSelectLabel
		onSelect(): void
		destructive?: boolean
		disabled?: boolean
		/** Shown on hover when the action is disabled (e.g. why it can't be used). */
		tooltip?: TlaMenuSelectLabel
	}
</script>

<script lang="ts" generics="T extends string">
	import { mergeProps, Select } from 'bits-ui'
	import { getContainer, SvelteDrawUiTooltip } from 'svelte-draw'
	import TlaIcon from '../TlaIcon/TlaIcon.svelte'
	import styles from './menu.module.css'
	import { TLA_MENU_POSITION } from './tla-menu-position'

	let {
		id,
		label,
		value,
		disabled,
		onChange,
		options,
		actions,
		'data-testid': dataTestId,
	}: {
		id: string
		label: string
		value: T
		disabled?: boolean
		onChange(value: T): void
		options: TlaMenuSelectOption<T>[]
		/**
		 * Extra actions shown in their own section below the options (e.g. a
		 * destructive "remove"). Selecting one runs its onSelect instead of onChange.
		 */
		actions?: TlaMenuSelectAction[]
		'data-testid'?: string
	} = $props()

	const container = getContainer()

	function handleChange(next: string) {
		const action = actions?.find((a) => a.id === next)
		if (action) {
			if (!action.disabled) action.onSelect()
			return
		}
		onChange(next as T)
	}
</script>

{#snippet content(c: TlaMenuSelectLabel)}
	{#if typeof c === 'string'}{c}{:else}{@render c()}{/if}
{/snippet}

<div class={styles.menuSelectWrapper}>
	<!-- The value binding is one-way: choosing an action must not change the selected value. -->
	<Select.Root type="single" bind:value={() => value, (next) => handleChange(next)} {disabled}>
		<Select.Trigger
			{id}
			class={styles.menuSelectTrigger}
			{disabled}
			aria-label={label}
			data-testid={dataTestId}
		>
			<div class={styles.menuSelectLabel}>{label}</div>
			<span>
				<TlaIcon icon="chevron-down" class={styles.menuSelectChevron} />
			</span>
		</Select.Trigger>
		<Select.Portal to={container}>
			<!-- min-width replaces the `[data-radix-popper-content-wrapper]` rule in menu.module.css,
			     which can't match bits-ui's wrapper; +1.5rem restores the checkmark offset. -->
			<Select.Content
				class={styles.menuSelectContent}
				side="bottom"
				align="end"
				style="min-width: calc(var(--bits-select-anchor-width) + 1.5rem)"
				{...TLA_MENU_POSITION}
			>
				<Select.Viewport>
					{#each options as option (option.value)}
						<Select.Item value={option.value} disabled={option.disabled} label={typeof option.label === 'string' ? option.label : option.value}>
							{#snippet child({ props, selected })}
								<div {...props} class={styles.menuSelectOption}>
									{#if selected}
										<span><TlaIcon icon="check" /></span>
									{/if}
									<span>{@render content(option.label)}</span>
								</div>
							{/snippet}
						</Select.Item>
					{/each}
					{#if actions && actions.length > 0}
						<div class={styles.menuSelectSeparator} role="separator"></div>
						{#each actions as action (action.id)}
							{#snippet actionItem(extraProps: Record<string, unknown>)}
								<Select.Item
									value={action.id}
									disabled={action.disabled}
									label={typeof action.label === 'string' ? action.label : action.id}
								>
									{#snippet child({ props })}
										<div
											{...mergeProps(props, extraProps)}
											class={[
												styles.menuSelectOption,
												action.destructive && styles.menuSelectOptionDestructive,
											]}
										>
											<span>{@render content(action.label)}</span>
										</div>
									{/snippet}
								</Select.Item>
							{/snippet}
							{#if action.tooltip}
								<SvelteDrawUiTooltip content={action.tooltip}>
									{#snippet child({ props })}
										{@render actionItem(props)}
									{/snippet}
								</SvelteDrawUiTooltip>
							{:else}
								{@render actionItem({})}
							{/if}
						{/each}
					{/if}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</div>
