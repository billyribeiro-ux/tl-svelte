import type { Snippet } from 'svelte'
import {
	createCustomRecordId,
	idValidator,
	T,
	type BaseRecord,
	type CustomRecordInfo,
	type Editor,
	type RecordId,
	type SvelteDrawOptions,
	type TLRecord,
	type TLUiOverrides,
} from 'svelte-draw'

// Draw-your-own reactions, in three pieces: a `reaction-drawing` record type that holds each
// drawing's image (content-addressed, so the record id is the reaction token), a palette that saves
// a drawing and emits its id, and a renderer that resolves a token back to its image. See the README
// and `CommentDrawingReactionsExample.svelte` for the wiring.

/** The image format a drawn reaction is exported as. */
export type DrawingReactionFormat = 'svg' | 'png'

/**
 * The `data:` URL prefixes a drawing record's `src` may use. Validation is gated on this list
 * rather than on a bare `data:` check: a record arrives over sync from another user, and this is
 * what keeps an `<img src>` pointed at an image and nothing else.
 */
const SRC_PREFIXES = ['data:image/svg+xml,', 'data:image/svg+xml;', 'data:image/png;base64,']

/**
 * The most characters a drawing's `data:` URL may hold. A drawing record is synced document data,
 * paid for by every client on the file — and because this cap lives in the record's schema
 * validator, it holds against any writer, not just this palette's export path.
 */
export const MAX_DRAWING_SRC_LENGTH = 32_000

/** One distinct drawn reaction. Content-addressed: the id is derived from a hash of `src`. */
export interface ReactionDrawingRecord extends BaseRecord<'reaction-drawing', ReactionDrawingId> {
	/** The drawing, as a `data:` image URL. */
	src: string
}

/** @see ReactionDrawingRecord */
export type ReactionDrawingId = RecordId<ReactionDrawingRecord>

const drawingSrcValidator = T.string.check((value) => {
	if (!SRC_PREFIXES.some((prefix) => value.startsWith(prefix))) {
		throw new T.ValidationError('Expected a data: image URL')
	}
	if (value.length > MAX_DRAWING_SRC_LENGTH) {
		throw new T.ValidationError(
			`Expected a src of at most ${MAX_DRAWING_SRC_LENGTH} characters, got ${value.length}`
		)
	}
})

/**
 * The `records` entry that registers the drawing record type. Spread into `createTLSchema`
 * alongside `commentSchemaRecords` — and, as with those, register it on every peer (client and
 * server) or schema validation fails on one side of the connection.
 */
export const reactionDrawingRecords: Record<string, CustomRecordInfo> = {
	'reaction-drawing': {
		scope: 'document',
		validator: T.object({
			id: idValidator<ReactionDrawingId>('reaction-drawing'),
			typeName: T.literal('reaction-drawing'),
			src: drawingSrcValidator,
		}),
	},
}

/**
 * Whether `token` is a drawn reaction (as opposed to a plain emoji glyph) — i.e. a
 * `reaction-drawing` record id. Use it anywhere you need to tell the two kinds apart —
 * validation before a write, or picking a renderer.
 */
export function isDrawingReactionToken(token: string): boolean {
	return token.startsWith('reaction-drawing:')
}

/**
 * Save a drawing to the document and return the token to react with — the drawing record's id.
 *
 * Content-addressed: the id is a hash of the image, so saving the same drawing twice (or two
 * people reusing one) lands on the same record instead of accumulating copies. Records are never
 * removed here — a real app might garbage-collect drawings no reaction references, but a
 * content-addressed record is small and reusable, so this example leaves them be.
 */
export async function saveDrawingReaction(editor: Editor, src: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(src))
	const hash = Array.from(new Uint8Array(digest).slice(0, 16), (byte) =>
		byte.toString(16).padStart(2, '0')
	).join('')
	const id = createCustomRecordId('reaction-drawing', hash) as ReactionDrawingId
	// The store is typed over the built-in record union, so custom records cast through it — the
	// same idiom the commenting package uses for its own records.
	if (!editor.store.has(id as unknown as TLRecord['id'])) {
		const record: ReactionDrawingRecord = { id, typeName: 'reaction-drawing', src }
		editor.store.put([record] as unknown as TLRecord[])
	}
	return id
}

export interface DrawingReactionExportOptions {
	/**
	 * `'svg'` (default) keeps the drawing crisp at any size and usually makes a smaller token for a
	 * simple doodle. `'png'` gives a fixed-cost token whatever the drawing's complexity.
	 */
	format?: DrawingReactionFormat
	/** Longest side of the exported image in px. PNG only; SVG scales itself. Defaults to 96. */
	size?: number
	/**
	 * Reject an image longer than this many characters. The drawing record's schema validator
	 * enforces {@link MAX_DRAWING_SRC_LENGTH} regardless — this exists so an oversized scribble is
	 * refused at the palette with a friendly message rather than thrown out by the store. Defaults
	 * to {@link MAX_DRAWING_SRC_LENGTH}; lower it to be stricter, but raising it past the schema's
	 * cap only trades a palette error for a validation error.
	 */
	maxSrcLength?: number
	/** Export in dark mode. Defaults to false, so a reaction looks the same for every viewer. */
	darkMode?: boolean
}

/** Thrown by {@link exportDrawingImage} when the drawing doesn't fit in a record. */
export class DrawingReactionTooLargeError extends Error {
	constructor(
		readonly length: number,
		readonly maxLength: number
	) {
		super(`Drawing is too detailed to store as a reaction (${length}/${maxLength} characters).`)
		this.name = 'DrawingReactionTooLargeError'
	}
}

/**
 * Export everything on an editor's current page as a drawing image — a transparent `data:` URL,
 * cropped to the ink with no canvas background. This is the `src` a drawing record holds; pass it
 * to {@link saveDrawingReaction} to get the token to react with.
 *
 * Returns null when there's nothing drawn. Throws {@link DrawingReactionTooLargeError} when the
 * result exceeds `maxSrcLength`.
 */
export async function exportDrawingImage(
	editor: Editor,
	opts: DrawingReactionExportOptions = {}
): Promise<string | null> {
	const {
		format = 'svg',
		size = 96,
		maxSrcLength = MAX_DRAWING_SRC_LENGTH,
		darkMode = false,
	} = opts

	const ids = [...editor.getCurrentPageShapeIds()]
	if (ids.length === 0) return null

	// `padding: 'auto'` trims to the visual bounds of the ink — including stroke overflow — which is
	// what makes the result read as a glyph rather than as a screenshot of a canvas.
	const exportOpts = { background: false, padding: 'auto', darkMode } as const

	let src: string
	if (format === 'svg') {
		const result = await editor.getSvgString(ids, exportOpts)
		if (!result) return null
		// Percent-encoded rather than base64: it's smaller for markup, and stays greppable in the
		// store when you're debugging what a reaction actually holds.
		src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`
	} else {
		// Scale so the drawing's longest side lands near `size`. The auto-trim above shifts this a
		// little; near enough, since the pill draws the image at a CSS size anyway.
		const bounds = editor.getCurrentPageBounds()
		const longest = bounds ? Math.max(bounds.width, bounds.height) : size
		const result = await editor.toImageDataUrl(ids, {
			...exportOpts,
			format: 'png',
			pixelRatio: 1,
			scale: longest > 0 ? size / longest : 1,
		})
		src = result.url
	}

	if (src.length > maxSrcLength) {
		throw new DrawingReactionTooLargeError(src.length, maxSrcLength)
	}
	return src
}

/**
 * Keyboard shortcuts stay mounted when `hideUi` is set, so hiding the toolbar isn't enough on its
 * own: `v` would still put the canvas into select, `cmd+a` would still select all. Removing the
 * tools and actions from the UI context removes their shortcuts with them, which leaves the canvas
 * genuinely two-tool rather than two-tool-until-you-touch-the-keyboard.
 */
export const DRAWING_EDITOR_OVERRIDES: TLUiOverrides = {
	tools: (_editor, tools) => ({ draw: tools.draw, eraser: tools.eraser }),
	actions: () => ({}),
}

/**
 * A locked camera makes the box a fixed sheet of paper: what you see is the whole drawing, so the
 * export can't come back cropped or surprise you with ink parked off-screen. The panning options go
 * with it — a locked camera already refuses their moves, but leaving them on means spacebar and
 * right-drag do nothing visible, which reads as broken.
 */
export const DRAWING_EDITOR_OPTIONS: Partial<SvelteDrawOptions> = {
	camera: { isLocked: true },
	spacebarPanning: false,
	rightClickPanning: false,
	maxPages: 1,
}

export interface DrawingReactionPaletteProps {
	/**
	 * Tokens to offer for one-click reuse, above the canvas — typically the reactions already on the
	 * comment, so a second person can add to a drawing rather than redraw it. Same slot as
	 * `EmojiPicker`'s `emoji` prop.
	 */
	emoji?: string[]
	/** Tokens the current user has already reacted with; shown pressed in the reuse row. */
	selected?: string[]
	/** Called with the new token when a drawing is submitted, or with an existing token when reused. */
	onSelect?(token: string): void
	/**
	 * Turns a submitted drawing (a `data:` image URL) into the token passed to `onSelect` —
	 * typically {@link saveDrawingReaction} bound to the host editor, which stores the drawing as a
	 * record and returns its id. Without it, the raw image URL is passed through as the token,
	 * which only suits staging the palette standalone: the commenting schema caps a token at 64
	 * characters, so an unsaved drawing can't actually be reacted with.
	 */
	saveDrawing?(src: string): string | Promise<string>
	/** How to draw each token in the reuse row. Defaults to the `DrawingReactionContent` component. */
	renderReaction?: Snippet<[token: string]>
	/**
	 * Side of the (square) drawing box: any CSS length. Defaults to a quarter of the viewport's
	 * short side, clamped so it stays usable on a phone and doesn't swallow a desktop.
	 */
	size?: number | string
	/** Export settings for the drawing. See {@link DrawingReactionExportOptions}. */
	exportOptions?: DrawingReactionExportOptions
	/** Passed to the nested `<SvelteDraw>`, which is a second editor and wants its own license. */
	licenseKey?: string
	/** Label on the button that commits the drawing. Defaults to "React". */
	submitLabel?: string
}
