<script lang="ts" module>
	/** @public */
	export interface CountBadgeProps {
		count: number
		/** The badge's list is showing — shows the active/selected indicator state, as an open pin does. */
		open?: boolean
	}
</script>

<script lang="ts">
	/** @public */
	let { count, open }: CountBadgeProps = $props()
</script>

<!-- `tlui-cmt-marker` carries the resting shadow, the hover lift, and the open ring — the same
     treatment a comment pin wears, so the two markers behave alike. -->
<div class={['tlui-cmt-marker', 'tlui-cmt-count-badge', open && 'tlui-cmt-marker--open']}>{count}</div>
