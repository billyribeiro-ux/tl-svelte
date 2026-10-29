<script lang="ts">
	import {
		getTranslation,
		SvelteDrawUiMenuCheckboxItem,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuSubmenu,
	} from 'svelte-draw'
	import { messages } from './messages'

	const msg = getTranslation()

	let shouldHighlightMissing = $state(
		document.body.classList.contains('tla-lang-highlight-missing')
	)

	$effect(() => {
		document.body.classList.toggle('tla-lang-highlight-missing', shouldHighlightMissing)
	})

	const highlightMissingLbl = $derived(msg(messages.langHighlightMissing))
</script>

<SvelteDrawUiMenuSubmenu id="debug" label={msg(messages.appDebugFlags)}>
	<SvelteDrawUiMenuGroup id="debug app flags">
		<!-- Shadows every string the UI rendered without going through `F`, which is what
		     marks translated text with `.i18n-msg`. Not a locale — a body class. -->
		<SvelteDrawUiMenuCheckboxItem
			id="highlight-missing"
			title={highlightMissingLbl}
			label={highlightMissingLbl}
			checked={shouldHighlightMissing}
			onSelect={() => {
				shouldHighlightMissing = !shouldHighlightMissing
			}}
		/>
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
