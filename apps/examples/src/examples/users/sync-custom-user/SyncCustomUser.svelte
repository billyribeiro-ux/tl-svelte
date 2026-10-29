<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import {
		atom,
		computed,
		createSvelteDrawCurrentUser,
		createUserId,
		SvelteDraw,
		UserRecordType,
		type SvelteDrawOptions,
		type TLUserPreferences,
		type TLUserStore,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { untrack } from 'svelte'

	// There's a guide at the bottom of this file!

	let { roomId }: { roomId?: string } = $props()

	// [1]
	let userPreferences = $state<TLUserPreferences>({
		id: 'user-' + Math.random(),
		name: 'Jimmothy',
		color: 'palevioletred',
		colorScheme: 'dark',
	})

	// [2]
	const userPrefsAtom = atom<TLUserPreferences>(
		'userPrefs',
		untrack(() => $state.snapshot(userPreferences))
	)
	$effect(() => {
		userPrefsAtom.set($state.snapshot(userPreferences))
	})

	const currentUser = computed('currentUser', () => {
		const p = userPrefsAtom.get()
		return UserRecordType.create({
			id: createUserId(p.id),
			name: p.name ?? '',
			color: p.color ?? '',
		})
	})
	const users: TLUserStore = { currentUser }

	// [3]
	const sync = createSyncDemo(() => ({ roomId: roomId!, users }))

	// [4]
	const user = createSvelteDrawCurrentUser(() => ({
		userPreferences: $state.snapshot(userPreferences),
		setUserPreferences: (next) => {
			userPreferences = next
		},
	}))

	const options: Partial<SvelteDrawOptions> = { deepLinks: true }
</script>

<!-- [5] -->
<div class="svelte-draw__editor">
	<SvelteDraw store={sync.current} user={user.current} {options} />
</div>

<!--
To plug your own identity into svelte-draw sync you need two things: the current user's info,
and a way to update it (so the editor's name and color controls can write back). Here
that's plain Svelte state; in your app it would be your auth system.

[1]
The user's preferences. `$state` stands in for your user context or backend.

[2]
`createSyncDemo` wants a `TLUserStore`, whose `currentUser` is a reactive signal rather
than Svelte state, so we bridge the two: an atom mirrors the state, and a computed
derives a `TLUser` record from it.

[3]
Create the multiplayer store, passing the user store. `createSync` (for your own server)
takes the same `users` option.

[4]
`createSvelteDrawCurrentUser` turns the preferences and setter into the `TLCurrentUser` the
editor reads and writes for the local user's name, color, and settings.

[5]
Render with the synced store and the user object.
-->
