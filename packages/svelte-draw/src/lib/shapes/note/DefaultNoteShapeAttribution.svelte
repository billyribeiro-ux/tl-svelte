<script module lang="ts">
	import type { TLNoteShape } from '@svelte-draw/editor'
	import type { Component } from 'svelte'

	/** @public */
	export interface TLNoteShapeAttributionProps {
		/** The note shape the attribution belongs to. */
		shape: TLNoteShape
		/** The full display name of the user who last edited the note's text. */
		name: string
		/** The first name (the part shown in the badge). */
		firstName: string
		/** The label color to use for the badge. */
		color: string
		/** The note's scale. Only meaningful for the `'canvas'` variant. */
		scale: number
		/**
		 * Where the attribution is being rendered. The `'canvas'` variant renders the interactive badge
		 * (with a tooltip); the `'export'` variant renders static markup suitable for an SVG/PNG export.
		 */
		variant: 'canvas' | 'export'
	}

	/**
	 * The component used to render a note shape's attribution badge, or `null` to hide it.
	 *
	 * @public
	 */
	export type TLNoteShapeAttributionComponent = Component<TLNoteShapeAttributionProps> | null
</script>

<script lang="ts">
	import SvelteDrawUiTooltip from '../../ui/components/primitives/SvelteDrawUiTooltip.svelte'

	/**
	 * The default attribution badge shown in the corner of a note shape — the display name of the user
	 * who last edited the note's text.
	 *
	 * Override it (or hide it) with the note shape util's `AttributionComponent` option:
	 *
	 * ```ts
	 * // hide the attribution badge
	 * NoteShapeUtil.configure({ AttributionComponent: null })
	 *
	 * // render your own Svelte component (receiving TLNoteShapeAttributionProps)
	 * NoteShapeUtil.configure({ AttributionComponent: MyBadge })
	 * ```
	 *
	 * @public
	 */
	let { name, firstName, color, scale, variant }: TLNoteShapeAttributionProps = $props()
</script>

{#if variant === 'export'}
	<div
		class="tl-note__attribution"
		style:font-size="11px"
		style:color
		style:opacity={0.6}
	>
		{firstName}
	</div>
{:else}
	<SvelteDrawUiTooltip content={name} side="bottom">
		{#snippet child({ props })}
			<div
				{...props}
				class="tl-note__attribution"
				style:--note-attribution-scale={scale}
				style:font-size="{11 * scale}px"
				style:color
				style:opacity={0.6}
			>
				{firstName}
			</div>
		{/snippet}
	</SvelteDrawUiTooltip>
{/if}
