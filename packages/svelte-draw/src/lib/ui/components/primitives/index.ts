/**
 * Barrel for the UI primitives (the React `radix-ui` wrappers, now Svelte 5 + `bits-ui`).
 *
 * Naming notes for ports:
 * - one component per `.svelte` file (the React files that exported several components are split);
 * - `useX()` context readers are `getX()`: `useSvelteDrawUiOrientation` -> `getSvelteDrawUiOrientation`,
 *   `useSvelteDrawUiMenuContext` -> `getSvelteDrawUiMenuContext`;
 * - React's `asChild` / single cloned child becomes a `child` snippet that receives `{ props }` to spread.
 */

// layout
export {
	getSvelteDrawUiOrientation,
	setSvelteDrawUiOrientation,
	type SvelteDrawUiOrientationContext,
} from './layout.svelte'
export { default as SvelteDrawUiOrientationProvider } from './SvelteDrawUiOrientationProvider.svelte'
export { default as SvelteDrawUiRow } from './SvelteDrawUiRow.svelte'
export { default as SvelteDrawUiColumn } from './SvelteDrawUiColumn.svelte'
export { default as SvelteDrawUiGrid } from './SvelteDrawUiGrid.svelte'
export type { TLUiLayoutProps } from './SvelteDrawUiLayout.svelte'

// button
export {
	default as SvelteDrawUiButton,
	type TLUiButtonProps,
} from './Button/SvelteDrawUiButton.svelte'
export {
	default as SvelteDrawUiButtonCheck,
	type TLUiButtonCheckProps,
} from './Button/SvelteDrawUiButtonCheck.svelte'
export {
	default as SvelteDrawUiButtonIcon,
	type TLUiButtonIconProps,
} from './Button/SvelteDrawUiButtonIcon.svelte'
export {
	default as SvelteDrawUiButtonLabel,
	type TLUiButtonLabelProps,
} from './Button/SvelteDrawUiButtonLabel.svelte'
export { default as SvelteDrawUiButtonSpinner } from './Button/SvelteDrawUiButtonSpinner.svelte'

// icon / kbd
export {
	default as SvelteDrawUiIcon,
	type TLUiIconJsx,
	type TLUiIconProps,
} from './SvelteDrawUiIcon.svelte'
export { default as SvelteDrawUiKbd, type TLUiKbdProps } from './SvelteDrawUiKbd.svelte'

// tooltip
export {
	default as SvelteDrawUiTooltip,
	type SvelteDrawUiTooltipProps,
} from './SvelteDrawUiTooltip.svelte'
export {
	default as SvelteDrawUiTooltipProvider,
	type SvelteDrawUiTooltipProviderProps,
} from './SvelteDrawUiTooltipProvider.svelte'
export { hideAllTooltips, type TLUiTooltipContent } from './tooltipManager'

// dialog
export {
	default as SvelteDrawUiDialogHeader,
	type TLUiDialogHeaderProps,
} from './SvelteDrawUiDialogHeader.svelte'
export {
	default as SvelteDrawUiDialogTitle,
	type TLUiDialogTitleProps,
} from './SvelteDrawUiDialogTitle.svelte'
export { default as SvelteDrawUiDialogCloseButton } from './SvelteDrawUiDialogCloseButton.svelte'
export {
	default as SvelteDrawUiDialogBody,
	type TLUiDialogBodyProps,
} from './SvelteDrawUiDialogBody.svelte'
export {
	default as SvelteDrawUiDialogFooter,
	type TLUiDialogFooterProps,
} from './SvelteDrawUiDialogFooter.svelte'

// popover
export { default as SvelteDrawUiPopover, type TLUiPopoverProps } from './SvelteDrawUiPopover.svelte'
export {
	default as SvelteDrawUiPopoverTrigger,
	type TLUiPopoverTriggerProps,
} from './SvelteDrawUiPopoverTrigger.svelte'
export {
	default as SvelteDrawUiPopoverContent,
	type TLUiPopoverContentProps,
} from './SvelteDrawUiPopoverContent.svelte'

// select
export { default as SvelteDrawUiSelect, type TLUiSelectProps } from './SvelteDrawUiSelect.svelte'
export {
	default as SvelteDrawUiSelectTrigger,
	type TLUiSelectTriggerProps,
} from './SvelteDrawUiSelectTrigger.svelte'
export {
	default as SvelteDrawUiSelectValue,
	type TLUiSelectValueProps,
} from './SvelteDrawUiSelectValue.svelte'
export {
	default as SvelteDrawUiSelectContent,
	type TLUiSelectContentProps,
} from './SvelteDrawUiSelectContent.svelte'
export {
	default as SvelteDrawUiSelectItem,
	type TLUiSelectItemProps,
} from './SvelteDrawUiSelectItem.svelte'

// slider / input
export { default as SvelteDrawUiSlider, type TLUiSliderProps } from './SvelteDrawUiSlider.svelte'
export { default as SvelteDrawUiInput, type TLUiInputProps } from './SvelteDrawUiInput.svelte'

// toolbar
export { default as SvelteDrawUiToolbar, type TLUiToolbarProps } from './SvelteDrawUiToolbar.svelte'
export {
	default as SvelteDrawUiToolbarButton,
	type TLUiToolbarButtonProps,
} from './SvelteDrawUiToolbarButton.svelte'
export {
	default as SvelteDrawUiToolbarToggleGroup,
	type TLUiToolbarToggleGroupProps,
} from './SvelteDrawUiToolbarToggleGroup.svelte'
export {
	default as SvelteDrawUiToolbarToggleItem,
	type TLUiToolbarToggleItemProps,
} from './SvelteDrawUiToolbarToggleItem.svelte'
export {
	default as SvelteDrawUiContextualToolbar,
	type TLUiContextualToolbarProps,
} from './SvelteDrawUiContextualToolbar.svelte'
export {
	useToolbarVisibilityStateMachine,
	type ToolbarVisibilityStateMachine,
} from './contextualToolbarState.svelte'
export { getToolbarScreenPosition, rectToBox } from './contextualToolbarUtils'

// dropdown menu
export {
	default as SvelteDrawUiDropdownMenuRoot,
	type TLUiDropdownMenuRootProps,
} from './SvelteDrawUiDropdownMenuRoot.svelte'
export {
	default as SvelteDrawUiDropdownMenuTrigger,
	type TLUiDropdownMenuTriggerProps,
} from './SvelteDrawUiDropdownMenuTrigger.svelte'
export {
	default as SvelteDrawUiDropdownMenuContent,
	type TLUiDropdownMenuContentProps,
} from './SvelteDrawUiDropdownMenuContent.svelte'
export {
	default as SvelteDrawUiDropdownMenuSub,
	type TLUiDropdownMenuSubProps,
} from './SvelteDrawUiDropdownMenuSub.svelte'
export {
	default as SvelteDrawUiDropdownMenuSubTrigger,
	type TLUiDropdownMenuSubTriggerProps,
} from './SvelteDrawUiDropdownMenuSubTrigger.svelte'
export {
	default as SvelteDrawUiDropdownMenuSubContent,
	type TLUiDropdownMenuSubContentProps,
} from './SvelteDrawUiDropdownMenuSubContent.svelte'
export {
	default as SvelteDrawUiDropdownMenuGroup,
	type TLUiDropdownMenuGroupProps,
} from './SvelteDrawUiDropdownMenuGroup.svelte'
export { default as SvelteDrawUiDropdownMenuIndicator } from './SvelteDrawUiDropdownMenuIndicator.svelte'
export {
	default as SvelteDrawUiDropdownMenuItem,
	type TLUiDropdownMenuItemProps,
} from './SvelteDrawUiDropdownMenuItem.svelte'
export {
	default as SvelteDrawUiDropdownMenuCheckboxItem,
	type TLUiDropdownMenuCheckboxItemProps,
} from './SvelteDrawUiDropdownMenuCheckboxItem.svelte'

// menus
export {
	getSvelteDrawUiMenuContext,
	setSvelteDrawUiMenuContext,
	type SvelteDrawUiMenuContext,
	type TLUiMenuContextType,
} from './menus/SvelteDrawUiMenuContext'
export {
	default as SvelteDrawUiMenuContextProvider,
	type TLUiMenuContextProviderProps,
} from './menus/SvelteDrawUiMenuContextProvider.svelte'
export {
	default as SvelteDrawUiMenuActionCheckboxItem,
	type TLUiMenuActionCheckboxItemProps,
} from './menus/SvelteDrawUiMenuActionCheckboxItem.svelte'
export {
	default as SvelteDrawUiMenuActionItem,
	type TLUiMenuActionItemProps,
} from './menus/SvelteDrawUiMenuActionItem.svelte'
export {
	default as SvelteDrawUiMenuCheckboxItem,
	type TLUiMenuCheckboxItemProps,
} from './menus/SvelteDrawUiMenuCheckboxItem.svelte'
export {
	default as SvelteDrawUiMenuGroup,
	type TLUiMenuGroupProps,
} from './menus/SvelteDrawUiMenuGroup.svelte'
export {
	default as SvelteDrawUiMenuItem,
	type TLUiMenuItemProps,
} from './menus/SvelteDrawUiMenuItem.svelte'
export {
	default as SvelteDrawUiMenuSubmenu,
	type TLUiMenuSubmenuProps,
} from './menus/SvelteDrawUiMenuSubmenu.svelte'
export {
	default as SvelteDrawUiMenuToolItem,
	type TLUiMenuToolItemProps,
} from './menus/SvelteDrawUiMenuToolItem.svelte'
