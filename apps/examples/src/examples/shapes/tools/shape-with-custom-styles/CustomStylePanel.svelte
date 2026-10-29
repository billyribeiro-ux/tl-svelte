<script lang="ts">
	import {
		DefaultStylePanel,
		DefaultStylePanelContent,
		createRelevantStyles,
		getEditor,
	} from 'svelte-draw'
	import { myRatingStyle } from './CustomStylesShapeUtil'

	// [6]
	const editor = getEditor()
	const styles = createRelevantStyles()

	const rating = $derived(styles.current?.get(myRatingStyle))
</script>

{#if styles.current}
	<DefaultStylePanel>
		<DefaultStylePanelContent />
		{#if rating !== undefined}
			<div>
				<select
					style="width: 100%; padding: 4px;"
					value={rating.type === 'mixed' ? '' : rating.value}
					onchange={(e) => {
						const value = myRatingStyle.validate(+e.currentTarget.value)
						editor.run(() => {
							editor.markHistoryStoppingPoint()
							editor.setStyleForSelectedShapes(myRatingStyle, value)
							editor.setStyleForNextShapes(myRatingStyle, value)
						})
					}}
				>
					{#if rating.type === 'mixed'}<option value="">Mixed</option>{/if}
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>
			</div>
		{/if}
	</DefaultStylePanel>
{/if}
