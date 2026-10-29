<script lang="ts">
	import {
		atom,
		computed,
		createCachedUserResolve,
		createUserId,
		NoteShapeUtil,
		SvelteDraw,
		UserRecordType,
		type TLUser,
		type TLUserStore,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import NoteAttribution from './NoteAttribution.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const currentUser = UserRecordType.create({
		id: createUserId('alice'),
		name: 'Alice Mertnet',
		color: '#e03131',
	})

	const usersAtom = atom<Record<string, TLUser>>('users', { [currentUser.id]: currentUser })

	const users: TLUserStore = {
		currentUser: computed('currentUser', () => usersAtom.get()[currentUser.id] ?? null),
		resolve: createCachedUserResolve((userId) => usersAtom.get()[createUserId(userId)] ?? null),
	}

	// [3]
	const shapeUtils = [
		// [2]
		NoteShapeUtil.configure({ AttributionComponent: NoteAttribution }),
		// To hide the attribution badge entirely, set it to null instead:
		// NoteShapeUtil.configure({ AttributionComponent: null }),
	]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="note-attribution-component" {users} {shapeUtils} />
</div>

<!--
[1]
The attribution badge only appears once a note knows who last edited its text.
We provide a minimal custom `TLUserStore` with a single signed-in user so the
note shape has a display name to attribute. In a real app this comes from your
auth system or multiplayer presence.

[2]
The note shape util's `AttributionComponent` option is the replaceable component
that renders the badge in the corner of a note (`NoteAttribution.svelte`). It receives the resolved
`name`/`firstName`, the note's label `color`, the `shape`, and a `variant`
('canvas' or 'export'). Here we render a custom badge — the same component is used
both on the canvas and in image exports.

[3]
Configure the option with `NoteShapeUtil.configure({ AttributionComponent })` and
pass the configured util through the `shapeUtils` prop. Setting
`AttributionComponent` to `null` hides the badge instead. Create a note and type
into it to see the custom attribution appear.
-->
