// The React `menu-items.tsx` exported many components from one file. Svelte has one component per
// file, so this barrel keeps the old names importable from `menu-items/menu-items.svelte`.
export { default as CookieConsentMenuItem } from './CookieConsentMenuItem.svelte'
export { default as DebugMenuGroup } from './DebugMenuGroup.svelte'
export { default as DebugSubmenu } from './DebugSubmenu.svelte'
export { default as GiveUsFeedbackMenuItem } from './GiveUsFeedbackMenuItem.svelte'
export { default as ImportFileActionItem } from './ImportFileActionItem.svelte'
export { default as LegalSummaryMenuItem } from './LegalSummaryMenuItem.svelte'
export { default as SignOutMenuItem } from './SignOutMenuItem.svelte'
export { default as ThemeSubmenu } from './ThemeSubmenu.svelte'
export { default as UIThemeSubmenu } from './UIThemeSubmenu.svelte'
export { default as UserManualMenuItem } from './UserManualMenuItem.svelte'
