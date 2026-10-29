<script lang="ts">
	// [2], [3] and the notes on [1] are at the bottom of this file
	import { clamp, createLocalStorageState, getEditor, type TLCameraOptions } from 'svelte-draw'
	import { BOUNDS_SIZES, CAMERA_OPTIONS } from './cameraOptions'

	type Constraints = NonNullable<TLCameraOptions['constraints']>

	const editor = getEditor()

	// [2]
	const stored = createLocalStorageState<TLCameraOptions>('camera ex1', CAMERA_OPTIONS)
	const cameraOptions = $derived(stored.current)
	const constraints = $derived(cameraOptions.constraints)
	const behavior = $derived(constraints?.behavior as { x: any; y: any } | undefined)

	// [3]
	$effect(() => {
		const options = stored.current
		editor.run(() => {
			editor.setCameraOptions(options)
			editor.setCamera(editor.getCamera(), {
				immediate: true,
			})
		})
	})

	function updateOptions(
		options: Partial<
			Omit<TLCameraOptions, 'constraints'> & {
				constraints: Partial<TLCameraOptions['constraints']>
			}
		>
	) {
		const { constraints } = options
		const current = editor.getCameraOptions()
		stored.update({
			...current,
			...options,
			constraints:
				constraints === undefined
					? current.constraints
					: {
							...(current.constraints! ?? CAMERA_OPTIONS.constraints),
							...constraints,
						},
		} as TLCameraOptions)
	}

	const boundsValue = $derived(
		Object.entries(BOUNDS_SIZES).find(([_, b]) => b.w === constraints?.bounds.w)?.[0] ?? 'none'
	)
</script>

<div
	style:pointer-events="all"
	style:position="absolute"
	style:top="50px"
	style:left="0"
	style:padding="4px"
	style:background="white"
	style:z-index="100"
>
	<div
		style:display="grid"
		style:grid-template-columns="auto 1fr"
		style:column-gap="12px"
		style:row-gap="4px"
		style:margin-bottom="12px"
		style:align-items="center"
		style:justify-content="center"
	>
		<label for="lock">Lock</label>
		<select
			name="lock"
			value={cameraOptions.isLocked ? 'true' : 'false'}
			onchange={(e) => {
				updateOptions({ ...CAMERA_OPTIONS, isLocked: e.currentTarget.value === 'true' })
			}}
		>
			<option value="true">true</option>
			<option value="false">false</option>
		</select>
		<label for="wheelBehavior">Wheel behavior</label>
		<select
			name="wheelBehavior"
			value={cameraOptions.wheelBehavior}
			onchange={(e) => {
				updateOptions({
					...CAMERA_OPTIONS,
					wheelBehavior: e.currentTarget.value as TLCameraOptions['wheelBehavior'],
				})
			}}
		>
			<option>zoom</option>
			<option>pan</option>
			<option>none</option>
		</select>
		<label for="panspeed">Pan speed</label>
		<input
			name="panspeed"
			type="number"
			step={0.1}
			value={cameraOptions.panSpeed}
			onchange={(e) => {
				updateOptions({ panSpeed: clamp(Number(e.currentTarget.value), 0, 2) })
			}}
		/>
		<label for="zoomspeed">Zoom speed</label>
		<input
			name="zoomspeed"
			type="number"
			step={0.1}
			value={cameraOptions.zoomSpeed}
			onchange={(e) => {
				updateOptions({ zoomSpeed: clamp(Number(e.currentTarget.value), 0, 2) })
			}}
		/>
		<label for="zoomsteps">Zoom steps</label>
		<input
			name="zoomsteps"
			type="text"
			value={cameraOptions.zoomSteps.join(', ')}
			onchange={(e) => {
				const val = e.currentTarget.value.split(', ').map((v) => Number(v))
				if (val.every((v) => typeof v === 'number' && Number.isFinite(v))) {
					updateOptions({ zoomSteps: val })
				}
			}}
		/>
		<label for="bounds">Bounds</label>
		<select
			name="bounds"
			value={boundsValue}
			onchange={(e) => {
				const currentConstraints = constraints ?? CAMERA_OPTIONS.constraints
				const value = e.currentTarget.value

				if (value === 'none') {
					updateOptions({ ...CAMERA_OPTIONS, constraints: undefined })
					return
				}

				updateOptions({
					...CAMERA_OPTIONS,
					constraints: {
						...currentConstraints,
						bounds: BOUNDS_SIZES[value] ?? BOUNDS_SIZES.a4,
					},
				})
			}}
		>
			<option value="none">none</option>
			<option value="a4">A4 page</option>
			<option value="portrait">Portrait</option>
			<option value="landscape">Landscape</option>
			<option value="square">Square</option>
		</select>
		{#if constraints}
			<label for="initialZoom">Initial zoom</label>
			<select
				name="initialZoom"
				value={constraints.initialZoom}
				onchange={(e) => {
					updateOptions({
						constraints: { ...constraints, initialZoom: e.currentTarget.value as Constraints['initialZoom'] },
					})
				}}
			>
				<option>fit-min</option>
				<option>fit-max</option>
				<option>fit-x</option>
				<option>fit-y</option>
				<option>fit-min-100</option>
				<option>fit-max-100</option>
				<option>fit-x-100</option>
				<option>fit-y-100</option>
				<option>default</option>
			</select>
			<label for="zoomBehavior">Base zoom</label>
			<select
				name="zoomBehavior"
				value={constraints.baseZoom}
				onchange={(e) => {
					updateOptions({
						constraints: { ...constraints, baseZoom: e.currentTarget.value as Constraints['baseZoom'] },
					})
				}}
			>
				<option>fit-min</option>
				<option>fit-max</option>
				<option>fit-x</option>
				<option>fit-y</option>
				<option>fit-min-100</option>
				<option>fit-max-100</option>
				<option>fit-x-100</option>
				<option>fit-y-100</option>
				<option>default</option>
			</select>
			<label for="originX">Origin x</label>
			<input
				name="originX"
				type="number"
				step={0.1}
				value={constraints.origin.x}
				onchange={(e) => {
					const val = clamp(Number(e.currentTarget.value), 0, 1)
					// Matches the original: a partial `constraints` (origin only) merges onto the live options.
					updateOptions({
						constraints: { origin: { ...constraints.origin, x: val } },
					})
				}}
			/>
			<label for="originY">Origin y</label>
			<input
				name="originY"
				type="number"
				step={0.1}
				value={constraints.origin.y}
				onchange={(e) => {
					const val = clamp(Number(e.currentTarget.value), 0, 1)
					updateOptions({
						constraints: { ...constraints, origin: { ...constraints.origin, y: val } },
					})
				}}
			/>
			<label for="paddingX">Padding x</label>
			<input
				name="paddingX"
				type="number"
				step={10}
				value={constraints.padding.x}
				onchange={(e) => {
					const val = clamp(Number(e.currentTarget.value), 0)
					updateOptions({
						constraints: { ...constraints, padding: { ...constraints.padding, x: val } },
					})
				}}
			/>
			<label for="paddingY">Padding y</label>
			<input
				name="paddingY"
				type="number"
				step={10}
				value={constraints.padding.y}
				onchange={(e) => {
					const val = clamp(Number(e.currentTarget.value), 0)
					updateOptions({
						constraints: { padding: { ...constraints.padding, y: val } },
					})
				}}
			/>
			<label for="behaviorX">Behavior x</label>
			<select
				name="behaviorX"
				value={behavior?.x}
				onchange={(e) => {
					stored.update({
						...cameraOptions,
						constraints: {
							...constraints,
							behavior: { ...behavior, x: e.currentTarget.value as never },
						},
					} as TLCameraOptions)
				}}
			>
				<option>free</option>
				<option>contain</option>
				<option>inside</option>
				<option>outside</option>
				<option>fixed</option>
			</select>
			<label for="behaviorY">Behavior y</label>
			<select
				name="behaviorY"
				value={behavior?.y}
				onchange={(e) => {
					stored.update({
						...cameraOptions,
						constraints: {
							...constraints,
							behavior: { ...behavior, y: e.currentTarget.value as never },
						},
					} as TLCameraOptions)
				}}
			>
				<option>free</option>
				<option>contain</option>
				<option>inside</option>
				<option>outside</option>
				<option>fixed</option>
			</select>
		{/if}
	</div>
	<div style:display="flex" style:flex-direction="column" style:gap="8px">
		<button
			onclick={() => {
				editor.setCamera(editor.getCamera(), { reset: true })
			}}
		>
			Reset camera
		</button>
		<button
			onclick={() => {
				updateOptions(CAMERA_OPTIONS)
			}}
		>
			Reset camera options
		</button>
	</div>
</div>

<!--
[1]
BoundsDisplay and PaddingDisplay (separate files) are only there to visualize the configuration:
BoundsDisplay draws the constraint bounds in page space (OnTheCanvas), and PaddingDisplay draws
the padding inset in screen space (InFrontOfTheCanvas). Neither is needed to make constraints work.

[2]
The panel's options are kept in local storage so they survive a refresh, and so the panel,
not the initial `options.camera`, is the source of truth once it has mounted.

[3]
`editor.setCameraOptions()` updates the options at runtime and re-applies the constraints to
the current camera. We follow it with `setCamera(getCamera(), { immediate: true })` so the
camera snaps to its new constrained position instead of animating there. Wrapping both in
`editor.run()` keeps them in one transaction.
-->
