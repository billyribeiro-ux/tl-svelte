<script lang="ts">
	import { type Editor, SvelteDraw, type TLComponents, createShapeId } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import BoardLayoutToolbar from './BoardLayoutToolbar.svelte'
	import { type BoardLayoutMode, BOARD_HEADER_HEIGHT, BOARD_PADDING } from './BoardLayouts'
	import { BOARD_SHAPE_TYPE, LayoutBoardShapeUtil, applyBoardLayout } from './LayoutBoardShapeUtil'
	import {
		NOTE_CARD_SHAPE_TYPE,
		NoteCardShapeUtil,
		VIDEO_CARD_SHAPE_TYPE,
		VideoCardShapeUtil,
	} from './MediaCardShapes'
	import './frame-layouts.css'

	// There's a guide at the bottom of this file!

	const shapeUtils = [LayoutBoardShapeUtil, VideoCardShapeUtil, NoteCardShapeUtil]
	const components: TLComponents = { InFrontOfTheCanvas: BoardLayoutToolbar }

	// [9]
	const video = (url = '/fluid.mp4') => ({ type: VIDEO_CARD_SHAPE_TYPE, props: { url } }) as const
	const note = (text: string, color: string) =>
		({ type: NOTE_CARD_SHAPE_TYPE, props: { text, color } }) as const

	const DEMO_BOARDS: Array<{
		name: string
		layout: BoardLayoutMode
		x: number
		y: number
		w?: number
		h?: number
		cards: Array<ReturnType<typeof video> | ReturnType<typeof note>>
	}> = [
		{
			name: 'Video wall',
			layout: 'grid',
			x: 80,
			y: 100,
			cards: [video(), video('/bonk.webm'), video(), note('Pick a hero shot', '#ffd43b')],
		},
		{
			name: 'Up next',
			layout: 'column',
			x: 860,
			y: 100,
			cards: [video('/bonk.webm'), note('Intro cut', '#b2f2bb'), note('Color pass', '#ffc9c9')],
		},
		{
			name: 'Moodboard',
			layout: 'free',
			x: 1140,
			y: 100,
			w: 460,
			h: 340,
			cards: [video(), note('Loose vibes', '#eebefa')],
		},
		{
			name: 'Filmstrip',
			layout: 'row',
			x: 80,
			y: 560,
			cards: [video(), video('/bonk.webm'), note('End card', '#99e9f2')],
		},
		{
			name: 'Stage',
			layout: 'spotlight',
			x: 860,
			y: 560,
			cards: [video(), video('/bonk.webm'), video(), note('Now playing', '#ffd43b')],
		},
	]

	function createDemoContent(editor: Editor) {
		for (const { name, layout, cards, x, y, ...size } of DEMO_BOARDS) {
			const id = createShapeId(name)
			editor.createShape({ id, type: BOARD_SHAPE_TYPE, x, y, props: { name, layout, ...size } })
			// Cascaded from the top of the content area, so every layout's position sort agrees
			// with this order and a `free` board still looks hand-placed
			editor.createShapes(
				cards.map((card, i) => ({
					...card,
					parentId: id,
					x: BOARD_PADDING + i * 130,
					y: BOARD_HEADER_HEIGHT + BOARD_PADDING + i * 80,
				}))
			)
			applyBoardLayout(editor, id)
		}

		// A few loose cards, ready to be dragged onto a board
		editor.createShapes([
			{ ...video('/bonk.webm'), x: 80, y: 960 },
			{ ...note('Add captions', '#ffd43b'), x: 340, y: 940 },
			{ ...note('B-roll', '#b2f2bb'), x: 560, y: 1000 },
		])
		editor.zoomToFit()
	}

	function onMount(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return
		createDemoContent(editor)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {components} {onMount} />
</div>

<!--
/*
This example shows one frame-like container arranging the same children in different ways. A
board shape has a `layout` prop, and swapping it swaps the arrangement. The layouts themselves
are pure functions over boxes and live in `BoardLayouts.ts`; LayoutBoardShapeUtil.ts is the SDK integration.

[1]
(LayoutBoardShapeUtil.ts) BaseFrameLikeShapeUtil gives the board its frame behavior: clipping children, providing their
background, and reparenting shapes in and out as they're dragged over it.

[2]
canReceiveNewChildrenOfType gates what the board picks up. This one takes cards only, so
dragging a drawn shape over it does nothing.

[3]
Only `free` boards are resizable by hand. The arranging layouts size the board to fit their
content, so its handles are hidden.

[4]
An unfilled body plus a filled header. Clicks inside the body pass through to the cards the way
a frame's interior does, while the header stays clickable for selecting and moving the board.
The header rectangle needs `isLabel` for that: frame-like shapes ignore interior fills so that
brush selection works inside them.

[5]
onChildrenChange is the main trigger. It runs whenever a child is added, removed, deleted,
restored by undo, moved, or resized, and whatever it returns gets applied. Re-running the
layout produces no further changes once everything sits in its slot, so this settles in a pass
rather than looping. The one case to skip is an in-progress drag, where correcting positions
would fight the pointer.

[6]
Drags finish through the frame-like callbacks instead: onDropShapesOver when cards land on the
board, onDragShapesOut when one leaves and the rest close the gap. Both animate, and because
every shape here extends BaseBoxShapeUtil, animateShapes tweens size as well as position.

[7]
Turn a layout into store changes: a new position for each card that has drifted from its slot,
new `w`/`h` for cards the layout resized, and a new size for the board so it hugs its content.

[8]
(BoardLayoutToolbar.svelte) A contextual toolbar for the selected board, built from the same BOARD_LAYOUTS record that
defines the modes.

[9]
Seed a board per mode plus a few loose cards. The cards start on a diagonal and applyBoardLayout
snaps them into place, which is the same path the board takes at runtime.
*/
-->
