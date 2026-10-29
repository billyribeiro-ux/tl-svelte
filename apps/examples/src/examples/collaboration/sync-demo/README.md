---
title: Multiplayer sync
component: ./SyncDemoExample.svelte
priority: 1
keywords: [multiplayer, sync, useSyncDemo, collaboration, real-time, websocket, co-editing]
multiplayer: true
---

Connect to a shared room with `useSyncDemo` for instant multiplayer.

---

`useSyncDemo` returns a store connected to a demo sync backend that svelte-draw hosts, so you can prototype multiplayer without running a server. Pass the store to `<SvelteDraw>` and every client with the same `roomId` edits the same document. Data on the demo server is wiped after one day.

Open the example in two tabs to see cursors and edits sync. For a self-hosted backend, see the `useSync` hook in `@svelte-draw/sync` and the sync template.
