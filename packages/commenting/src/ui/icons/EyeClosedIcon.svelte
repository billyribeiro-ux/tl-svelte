<script lang="ts">
	/**
	 * Comment pins are hidden. svelte-draw's `closed` eye glyph (icons/icon/closed.svg) — a shut
	 * lower lid with lashes, the design pair to `follow`. Inlined like the open eye: the package
	 * renders without an `AssetUrlsProvider`. Lash dots are `r=1.5` (vs the asset's `r=1`) because
	 * at the 15px header size the asset's finer lashes fall below a pixel; the lid keeps
	 * `follow`'s native stroke.
	 */
</script>

<svg width="15" height="15" viewBox="0 0 30 30" fill="none" aria-hidden="true">
	<path
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		d="M27 15C27 19.4183 21.6274 23 15 23C8.37258 23 3 19.4183 3 15"
	/>
	<circle cx="4" cy="20" r="1.5" fill="currentColor" />
	<circle cx="9" cy="23" r="1.5" fill="currentColor" />
	<circle cx="15" cy="24" r="1.5" fill="currentColor" />
	<circle cx="21" cy="23" r="1.5" fill="currentColor" />
	<circle cx="26" cy="20" r="1.5" fill="currentColor" />
</svg>
