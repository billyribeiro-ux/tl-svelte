<script lang="ts">
	import { fromComputed } from '@svelte-draw/svelte'
	import type { Attachment } from 'svelte/attachments'
	import {
		DefaultColorStyle,
		DefaultFontStyle,
		SvelteDraw,
		type Editor,
		type TLThemes,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './color-picker.css'
	import AddColorButton from './AddColorButton.svelte'
	import AddFontButton from './AddFontButton.svelte'
	import {
		buildCompleteTheme,
		buildTheme,
		ensureGoogleFontsLoaded,
		MAX_CUSTOM_COLORS,
		MAX_CUSTOM_FONTS,
		parsePalette,
		PERSISTENCE_KEY,
		readRawPalette,
		repairShapesUsingCustomStyles,
		uiOverrides,
		writePalette,
		type CustomColorKey,
		type CustomFontKey,
		type GoogleFont,
	} from './palette'

	let editor = $state.raw<Editor | null>(null)
	// Register *every* possible slot up front (with placeholder values). Passed
	// as the stable `themes` prop, this makes `createTLStore` register the full
	// style enum before the persisted document is validated on load, so shapes
	// referencing any slot pass validation even before the palette is read. The
	// visible colors/fonts are pushed separately via `editor.updateTheme` below.
	const initialThemes: Partial<TLThemes> = { default: buildCompleteTheme() }

	// Read the palette straight from the document `meta`, reactively. Because
	// the store drives local edits, undo/redo, and cross-tab sync alike, this one
	// read covers all three with no extra plumbing. `fromComputed` memoizes the stored
	// reference (stable until the document record changes, so unrelated edits like
	// moving a shape don't churn it); `parsePalette` normalises it.
	const paletteSignal = $derived(
		editor ? fromComputed('palette', () => readRawPalette(editor!)) : null
	)
	const rawPalette = $derived(paletteSignal?.current)
	const palette = $derived(parsePalette(rawPalette))

	// Push the palette's actual colors/fonts into the live theme. The style
	// panel and canvas read this, so only slots the palette contains are shown; the
	// complete prop's placeholder slots stay hidden. Runs on load, on every palette
	// change, and on undo/redo (all surface through `palette` above).
	$effect(() => {
		if (!editor) return
		editor.updateTheme(buildTheme(palette.hexes, palette.fonts))
		if (palette.fonts.length > 0) ensureGoogleFontsLoaded()
	})

	function addColor(hex: string) {
		const ed = editor
		if (!ed || palette.hexes.length >= MAX_CUSTOM_COLORS) return
		const hexes = [...palette.hexes, hex]
		ed.run(() => {
			writePalette(ed, { hexes, fonts: palette.fonts })
			// Put the new color into the live theme before applying it, so a
			// selected shape repaints with it immediately. The enum already knows the
			// slot (complete `themes` prop), so the style set never trips validation.
			ed.updateTheme(buildTheme(hexes, palette.fonts))
			if (ed.getSelectedShapeIds().length > 0) {
				const key = `custom-${hexes.length}` as CustomColorKey
				ed.setStyleForSelectedShapes(DefaultColorStyle, key)
			}
		})
	}

	function addFont(font: GoogleFont) {
		const ed = editor
		if (!ed || palette.fonts.length >= MAX_CUSTOM_FONTS) return
		if (palette.fonts.some((f) => f.family === font.family)) return
		const fonts = [...palette.fonts, font]
		ensureGoogleFontsLoaded()
		ed.run(() => {
			writePalette(ed, { hexes: palette.hexes, fonts })
			ed.updateTheme(buildTheme(palette.hexes, fonts))
			if (ed.getSelectedShapeIds().length > 0) {
				// DefaultFontStyle's static type is the four built-ins; the runtime
				// enum (complete `themes` prop) knows this slot.
				const key = `gf-${fonts.length}` as CustomFontKey
				ed.setStyleForSelectedShapes(DefaultFontStyle, key as 'draw')
			}
		})
	}

	// Remove every custom color and font. We clear the palette and remap every
	// shape / next-shape style off the custom slots in a single `editor.run`, so
	// it's one undo step and the palette can never drift from the shapes that
	// reference it — undo restores both together, redo clears both together.
	function clearCustomStyles() {
		const ed = editor
		if (!ed) return
		ed.run(() => {
			repairShapesUsingCustomStyles(ed)
			writePalette(ed, { hexes: [], fonts: [] })
		})
	}

	const hasCustomStyles = $derived(palette.hexes.length > 0 || palette.fonts.length > 0)

	// The React original stopped pointerdown propagation. Svelte delegates `onpointerdown` to the
	// app root, which is too late to stop the editor container's native listener, so attach natively.
	const stopPointerDown: Attachment<HTMLElement> = (element) => {
		const handler = (e: PointerEvent) => e.stopPropagation()
		element.addEventListener('pointerdown', handler)
		return () => element.removeEventListener('pointerdown', handler)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey={PERSISTENCE_KEY}
		themes={initialThemes}
		overrides={uiOverrides}
		onMount={(e) => {
			editor = e
		}}
	>
		<div class="color-picker-toolbar" {@attach stopPointerDown}>
			<AddColorButton {addColor} isFull={palette.hexes.length >= MAX_CUSTOM_COLORS} />
			<AddFontButton
				addedFamilies={palette.fonts.map((f) => f.family)}
				{addFont}
				isFull={palette.fonts.length >= MAX_CUSTOM_FONTS}
			/>
			{#if hasCustomStyles}
				<button
					class="color-picker-button"
					onclick={clearCustomStyles}
					title="Remove all custom colors and fonts, resetting any shapes that use them"
				>
					Clear custom styles
				</button>
			{/if}
		</div>
	</SvelteDraw>
</div>
