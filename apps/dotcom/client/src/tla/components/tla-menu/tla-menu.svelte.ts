// The React `tla-menu.tsx` exported many components from one file. Svelte has one component per
// file, so this barrel keeps the old names importable from `tla-menu/tla-menu.svelte`.
export { TLA_MENU_POSITION } from './tla-menu-position'
export { default as TlaMenuControl } from './TlaMenuControl.svelte'
export { default as TlaMenuControlGroup } from './TlaMenuControlGroup.svelte'
export { default as TlaMenuControlInfoTooltip } from './TlaMenuControlInfoTooltip.svelte'
export { default as TlaMenuControlLabel } from './TlaMenuControlLabel.svelte'
export { default as TlaMenuDetail } from './TlaMenuDetail.svelte'
export {
	default as TlaMenuSelect,
	type TlaMenuSelectAction,
	type TlaMenuSelectLabel,
	type TlaMenuSelectOption,
} from './TlaMenuSelect.svelte'
export { default as TlaMenuSection } from './TlaMenuSection.svelte'
export { default as TlaMenuSwitch } from './TlaMenuSwitch.svelte'
export { default as TlaMenuTabsPage } from './TlaMenuTabsPage.svelte'
export { default as TlaMenuTabsRoot } from './TlaMenuTabsRoot.svelte'
export { default as TlaMenuTabsTab } from './TlaMenuTabsTab.svelte'
export { default as TlaMenuTabsTabs } from './TlaMenuTabsTabs.svelte'
