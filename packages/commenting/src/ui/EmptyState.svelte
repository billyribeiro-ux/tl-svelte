<script lang="ts" module>
	/** @public */
	export interface EmptyStateProps {
		message: string
	}
</script>

<script lang="ts">
	/** The empty state shown when a thread has no comments yet. @public */
	let { message }: EmptyStateProps = $props()
</script>

<div class="tlui-cmt-empty">
	<div class="tlui-cmt-empty__icon" aria-hidden="true">💬</div>
	<p class="tlui-cmt-empty__message">{message}</p>
</div>
