<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './custom-user.css'
	import CustomUserPanel from './CustomUserPanel.svelte'
	import { users } from './customUsers'
	import UserSwitcher from './UserSwitcher.svelte'

	// There's a guide at the bottom of this file!

	const components = {
		TopPanel: UserSwitcher,
		SharePanel: CustomUserPanel,
	}
</script>

<!-- [6] -->
<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="custom-user-example" {users} {components} />
</div>

<!--
[1]
`TLUser.meta` is typed as `JsonObject`, so it accepts any JSON-compatible data. An
interface plus a cast on read gives you typed access (`customUsers.ts`). For runtime validation,
pass validators to `createTLSchema` (see the README).

[2]
A fake user directory in a reactive atom, with `isAdmin` and `department` in each
user's `meta`. In a real app this would come from your auth system.

[3]
The `TLUserStore`. `currentUser` and `resolve` are signals derived from the atoms, so
anything reading them re-evaluates when the data changes.

[4]
Switch which user is "logged in" (`UserSwitcher.svelte`).

[5]
The panel reads the current user signal and shows both the standard fields (name,
color) and the custom meta (department, admin badge) (`CustomUserPanel.svelte`).

[6]
Pass the user store via the `users` prop. Custom metadata rides along on the same
`TLUser` records the editor already manages, so nothing else needs wiring.
-->
