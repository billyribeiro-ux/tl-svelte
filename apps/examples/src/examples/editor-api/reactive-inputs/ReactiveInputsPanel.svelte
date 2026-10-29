<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	function formatNum(n: number, decimals: number): string {
		const s = n.toFixed(decimals)
		return n >= 0 ? ` ${s}` : s
	}

	// [1]
	const currentScreenPoint = fromComputed('current screen point', () =>
		editor.inputs.getCurrentScreenPoint()
	)
	const currentPagePoint = fromComputed('current page point', () =>
		editor.inputs.getCurrentPagePoint()
	)
	const previousScreenPoint = fromComputed('previous screen point', () =>
		editor.inputs.getPreviousScreenPoint()
	)
	const previousPagePoint = fromComputed('previous page point', () =>
		editor.inputs.getPreviousPagePoint()
	)
	const originScreenPoint = fromComputed('origin screen point', () =>
		editor.inputs.getOriginScreenPoint()
	)
	const originPagePoint = fromComputed('origin page point', () =>
		editor.inputs.getOriginPagePoint()
	)
	const pointerVelocity = fromComputed('pointer velocity', () =>
		editor.inputs.getPointerVelocity()
	)

	// [2]
	const shiftKey = fromComputed('shift key', () => editor.inputs.getShiftKey())
	const ctrlKey = fromComputed('ctrl key', () => editor.inputs.getCtrlKey())
	const altKey = fromComputed('alt key', () => editor.inputs.getAltKey())
	const metaKey = fromComputed('meta key', () => editor.inputs.getMetaKey())
	const accelKey = fromComputed('accel key', () => editor.inputs.getAccelKey())
</script>

{#snippet point(label: string, p: { x: number; y: number })}
	<div class="input-group">
		<div class="input-label">{label}</div>
		<div class="input-value">
			{formatNum(p.x, 0)}, {formatNum(p.y, 0)}
		</div>
	</div>
{/snippet}

<div class="tlui-menu reactive-inputs-panel">
	<div class="reactive-inputs-content">
		<!-- [3] -->
		{@render point('Screen point', currentScreenPoint.current)}
		{@render point('Page point', currentPagePoint.current)}
		{@render point('Prev screen', previousScreenPoint.current)}
		{@render point('Prev page', previousPagePoint.current)}
		{@render point('Origin screen', originScreenPoint.current)}
		{@render point('Origin page', originPagePoint.current)}

		<!-- [4] -->
		<div class="input-group">
			<div class="input-label">Velocity</div>
			<div class="input-value">
				{formatNum(pointerVelocity.current.x, 2)}, {formatNum(pointerVelocity.current.y, 2)}
				<span class="input-hint"> px/ms</span>
			</div>
		</div>

		<div class="input-group">
			<div class="input-label">Modifiers</div>
			<div class="modifier-keys">
				<span class="modifier-key" data-active={shiftKey.current}>Shift</span>
				<span class="modifier-key" data-active={ctrlKey.current}>Ctrl</span>
				<span class="modifier-key" data-active={altKey.current}>Alt</span>
				<span class="modifier-key" data-active={metaKey.current}>Meta</span>
				<span class="modifier-key" data-active={accelKey.current}>Accel</span>
			</div>
		</div>
	</div>
</div>
