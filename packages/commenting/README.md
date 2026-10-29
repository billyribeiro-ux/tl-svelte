# @svelte-draw/commenting

svelte-draw's commenting UI components — the presentational pieces of the commenting feature
(avatars, comment cards, composer, threads, sidebar, pins, and so on).

The components are Svelte 5 components (`.svelte`) and take presentational props; a consumer maps its data
model (the `TLComment` / `TLCommentThread` records from `@svelte-draw/tlschema`) onto them
through its own adapter. Their CSS uses svelte-draw's `--tl-color-*` theme tokens, so render
them inside a svelte-draw theme.
