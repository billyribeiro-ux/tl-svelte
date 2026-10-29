<script lang="ts">
	import {
		SvelteDraw,
		type Editor,
		type SvelteDrawOptions,
		type TLComponents,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CartesianGrid from './CartesianGrid.svelte'
	import './education-canvas.css'

	const GRID_SIZE = 600

	// [1]
	const options: Partial<SvelteDrawOptions> = {
		maxPages: 1,
		camera: {
			constraints: {
				initialZoom: 'fit-max',
				baseZoom: 'fit-max',
				bounds: { x: 0, y: 0, w: GRID_SIZE, h: GRID_SIZE },
				behavior: { x: 'contain', y: 'contain' },
				padding: { x: 100, y: 100 },
				origin: { x: 0.5, y: 0.5 },
			},
		},
	}

	// [2]
	const overrides: TLUiOverrides = {
		tools: (_editor, tools) => {
			const allowedTools = ['select', 'hand', 'draw', 'eraser', 'line', 'text']
			for (const key in tools) {
				if (!allowedTools.includes(key)) {
					delete tools[key]
				}
			}
			return tools
		},
	}

	// [3]
	const components: TLComponents = {
		OnTheCanvas: CartesianGrid,
	}

	const answers = $state({
		partB: '',
		partC: '',
	})

	let rEditor: Editor | null = null
	function handleMount(editor: Editor) {
		rEditor = editor
		// Camera options only set the constraints; a reset applies the initial zoom.
		editor.setCamera(editor.getCamera(), { reset: true })
	}

	function handleSubmit() {
		const normalizeAnswer = (answer: string) => {
			return answer.toLowerCase().replace(/[^a-z0-9(),.-]/g, '')
		}

		// Accept "8", "8 square units", "8 units²", and so on
		const normalizedB = normalizeAnswer(answers.partB)
		const isPartBCorrect =
			normalizedB.includes('8') &&
			(normalizedB.includes('square') || normalizedB.includes('unit') || normalizedB === '8')

		// Accept "(0,7)", "(0, 7)", "0,7", and so on
		const normalizedC = normalizeAnswer(answers.partC)
		const isPartCCorrect =
			normalizedC.includes('0') &&
			normalizedC.includes('7') &&
			(normalizedC.includes('(0,7)') ||
				normalizedC.includes('0,7') ||
				normalizedC.match(/0.*7/) ||
				normalizedC.match(/7.*0/))

		if (isPartBCorrect && isPartCCorrect) {
			alert('Good job! Both answers are correct!')
		} else if (isPartBCorrect || isPartCCorrect) {
			let message = 'Good progress! '
			if (isPartBCorrect) message += 'Part B is correct. '
			if (isPartCCorrect) message += 'Part C is correct. '
			if (!isPartBCorrect) message += 'Check your area calculation for Part B.'
			if (!isPartCCorrect) message += 'Check your coordinates for Part C.'
			alert(message)
		} else {
			alert('Please check your answers and try again.')
		}

		// [4]
		const editor = rEditor
		if (editor) {
			// e.g. `await editor.toImage([...editor.getCurrentPageShapeIds()])` for part A
		}
	}

</script>

<div class="education-container">
	<div class="question-panel">
		<div class="question-content">
			<h1 class="main-title">Mathematics: geometry</h1>

			<div class="question-card">
				<h2 class="question-title">Question 1</h2>
				<p class="question-text">
					A triangle ABC has vertices at A(2, 3), B(6, 3), and C(4, 7).
				</p>

				<div class="question-part">
					<p class="question-text">
						<strong>Part A:</strong> Draw triangle ABC on the coordinate grid.
					</p>
				</div>

				<div class="question-part">
					<p class="question-text">
						<strong>Part B:</strong> Calculate the area of triangle ABC.
					</p>
					<div class="answer-input-group">
						<label class="answer-label" for="education-part-b">
							<strong>Answer:</strong>
						</label>
						<input
							id="education-part-b"
							type="text"
							class="answer-input"
							placeholder="Enter the area"
							bind:value={answers.partB}
						/>
					</div>
				</div>

				<div class="question-part">
					<p class="question-text">
						<strong>Part C:</strong> Find the coordinates of point D such that ABCD forms a
						parallelogram.
					</p>
					<div class="answer-input-group">
						<label class="answer-label" for="education-part-c">
							<strong>Answer:</strong>
						</label>
						<input
							id="education-part-c"
							type="text"
							class="answer-input"
							placeholder="Enter coordinates as (x, y)"
							bind:value={answers.partC}
						/>
					</div>
				</div>

				<button class="submit-button" onclick={handleSubmit}>
					Submit answers
				</button>
			</div>

			<div class="instructions-card">
				<h3 class="instructions-title">Instructions</h3>
				<ul class="instructions-list">
					<li>Use the drawing canvas on the right to sketch your solution</li>
					<li>
						You can use the draw tool <kbd>D</kbd> to draw points and the line tool <kbd>L</kbd>
						to draw lines
					</li>
					<li>
						Use the text tool <kbd>T</kbd> to label points and write calculations
					</li>
					<li>Show all your working clearly</li>
					<li>Enter your final answers in the answer boxes above</li>
				</ul>
			</div>
		</div>
	</div>

	<div class="canvas-panel">
		<div class="canvas-container">
			<SvelteDraw
				{options}
				persistenceKey="education-canvas"
				{components}
				{overrides}
				onMount={handleMount}
			/>
		</div>
	</div>
</div>


<!--
[1]
Camera constraints keep the student on the 600x600 grid: `bounds` is the grid, `contain`
stops panning away from it, and `fit-max` zooms so the whole grid fits with 100px padding.
`maxPages: 1` removes the page menu so there is only one canvas to hand in.

[2]
The `tools` override receives every registered tool keyed by id. Deleting the ones we don't
want removes them from the toolbar and keyboard shortcuts, leaving a small set suited to a
worksheet.

[3]
The coordinate grid is a plain SVG rendered in the `OnTheCanvas` slot, so it sits in page
space under the shapes and pans and zooms with the camera.

[4]
The editor reference is only used at submit time, so a plain variable set in `onMount` is enough. This is
where you would export the drawing and post it along with the typed answers.
-->
