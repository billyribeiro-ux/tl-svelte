/* The commenting UI's inline icons, kept together so the set is visible in one place.
 *
 * Anything with an equivalent in svelte-draw's icon assets goes through `SvelteDrawUiIcon` instead (the ⋯
 * menu, the dismiss cross, the resolve button's check). What's left lives here because the asset
 * set has no counterpart — a smiley, a send arrow, a filter — or because the asset reads wrong at
 * the size it's needed, which is the case for both resolved checks below. The eye pair mirrors
 * svelte-draw's presence glyphs: the open state is the `follow` icon — the almond eye whose pupil
 * tracks presence — and the closed state the `closed` icon, its shut-lid companion. Both are in
 * the asset set, but they're inlined because the package renders without an `AssetUrlsProvider`,
 * so `SvelteDrawUiIcon` can't reach them. Inline also means they render without the consumer serving
 * files.
 *
 * All internal — none are exported from the package. */

export { default as CheckIcon } from './CheckIcon.svelte'
export { default as EyeClosedIcon } from './EyeClosedIcon.svelte'
export { default as EyeOpenIcon } from './EyeOpenIcon.svelte'
export { default as MoreMenuIcon } from './MoreMenuIcon.svelte'
export { default as PinCheckIcon } from './PinCheckIcon.svelte'
export { default as SendIcon } from './SendIcon.svelte'
export { default as SmileyIcon } from './SmileyIcon.svelte'
