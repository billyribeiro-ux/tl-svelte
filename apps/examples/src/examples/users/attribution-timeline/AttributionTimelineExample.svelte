<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './attribution-timeline.css'
	import AttributionTimeline from './AttributionTimeline.svelte'
	import { users, USERS } from './timelineUsers'
	import UserSwitcher from './UserSwitcher.svelte'

	// There's a guide at the bottom of this file!

	const components = {
		TopPanel: UserSwitcher,
	}
</script>

<!-- [10] -->
<div
	class="attribution-timeline-example"
	style:--timeline-row-count={Object.keys(USERS).length + 1}
>
	<SvelteDraw persistenceKey="attribution-timeline-example" {users} {components}>
		<AttributionTimeline />
	</SvelteDraw>
</div>

<!--
[1]
A fake user directory (`timelineUsers.ts`). In a real app this would be backed by your auth system. The
`TLUserStore` tells the editor who is "logged in": `currentUser` for attribution, and
`resolve` when rendering attribution labels.

[2]
Each timeline entry is a store diff plus the id, name, and color of whoever was active
when it was recorded. State also tracks, per user, how many of that user's changes are
currently applied.

[3]
The timeline component records document changes and keeps a per-user applied count.
The "All" scrubber and the per-user scrubbers are two views of the same state.

[4]
On each document change from the user (`source: 'user'` excludes our own scrubbing,
which goes through `mergeRemoteChanges`), capture the current user and append an entry.
If that user had been scrubbed back, their un-applied entries are dropped, starting a
new branch for them; other users' entries are untouched.

[5]
A per-user list of global indices into `entries`, so each user's scrubber works on its
own slice of history.

[6]
The "All" slider's value is the sum of the per-user applied counts.

[7]
Moving a user's slider applies or reverses just that user's diffs between the old and
new applied count, squashed into one diff. Other users' shapes stay put.
`mergeRemoteChanges` marks the change as remote so the listener in [4] ignores it.

[8]
Reset clears the page and the timeline state, again as a remote change so it isn't
recorded.

[9]
Moving the "All" slider rebuilds the canvas as the chronological prefix
`entries[0..N-1]`. Because per-user scrubbing can leave a non-contiguous applied set,
we diff the current set against the target prefix, queue reverses in reverse
chronological order followed by applies in forward order, and apply them as one
squashed diff.

[10]
The user store goes in via the `users` prop, the user switcher in the top panel, and the
timeline controls are rendered as a child of `SvelteDraw` so they can use `getEditor()`.
-->
