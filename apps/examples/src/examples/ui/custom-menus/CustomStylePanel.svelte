<script lang="ts">
	import {
		DefaultColorStyle,
		DefaultStylePanel,
		DefaultStylePanelContent,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		type TLUiStylePanelProps,
	} from 'svelte-draw'

	// Spread everything but `children`: this component supplies its own.
	const { children: _children, ...props }: TLUiStylePanelProps = $props()

	const editor = getEditor()
</script>

<DefaultStylePanel {...props}>
	<div style="background-color: thistle;">
		<SvelteDrawUiButton
			type="menu"
			onclick={() => {
				editor.setStyleForSelectedShapes(DefaultColorStyle, 'red')
			}}
		>
			<SvelteDrawUiButtonLabel>Red</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>
	<div style="background-color: thistle;">
		<SvelteDrawUiButton
			type="menu"
			onclick={() => {
				editor.setStyleForSelectedShapes(DefaultColorStyle, 'green')
			}}
		>
			<SvelteDrawUiButtonLabel>Green</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>
	<DefaultStylePanelContent />
</DefaultStylePanel>
