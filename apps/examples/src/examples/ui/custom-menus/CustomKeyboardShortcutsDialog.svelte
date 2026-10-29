<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		SvelteDrawUiMenuItem,
		type TLUiKeyboardShortcutsDialogProps,
	} from 'svelte-draw'

	// Spread everything but `children`: this component supplies its own.
	const { children: _children, ...props }: TLUiKeyboardShortcutsDialogProps = $props()
</script>

<DefaultKeyboardShortcutsDialog {...props}>
	<div style="background-color: thistle;">
		<SvelteDrawUiMenuItem
			id="like-my-posts"
			label="Like my posts"
			icon="external-link"
			readonlyOk
			kbd=":)"
			onSelect={() => {
				window.open('https://x.com/svelte-draw', '_blank')
			}}
		/>
	</div>
	<DefaultKeyboardShortcutsDialogContent />
</DefaultKeyboardShortcutsDialog>
