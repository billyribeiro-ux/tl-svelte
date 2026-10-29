<script lang="ts">
	import { SvelteDrawUiMenuGroup, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { openUrl } from './utils/url'
</script>

<SvelteDrawUiMenuGroup id="links">
	<SvelteDrawUiMenuItem
		id="about"
		label="help-menu.terms"
		readonlyOk
		onSelect={() => {
			openUrl(
				'https://github.com/billyribeiro-ux/tl-svelte/blob/main/apps/dotcom/client/TERMS_OF_SERVICE.md'
			)
		}}
	/>
	<SvelteDrawUiMenuItem
		id="about"
		label="help-menu.privacy"
		readonlyOk
		onSelect={() => {
			openUrl(
				'https://github.com/billyribeiro-ux/tl-svelte/blob/main/apps/dotcom/client/PRIVACY_POLICY.md'
			)
		}}
	/>
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup id="svelte-draw">
	<SvelteDrawUiMenuItem
		id="about"
		label="help-menu.about"
		readonlyOk
		onSelect={() => {
			openUrl('https://svelte-draw.invalid')
		}}
	/>
</SvelteDrawUiMenuGroup>
