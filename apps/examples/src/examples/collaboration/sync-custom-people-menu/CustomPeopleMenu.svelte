<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	// [2]
	const myUserColor = fromComputed('user color', () => editor.user.getColor())
	const myUserName = fromComputed('user name', () => editor.user.getName() || 'Guest')
	const myUserId = fromComputed('user id', () => editor.user.getExternalId())

	// [3]
	const collaborators = fromComputed('collaborators', () => editor.getCollaborators())
</script>

<div class="custom-people-menu">
	<div class="user-section">
		<h4 class="section-title">Me</h4>
		<div class="user-info">
			<div class="user-avatar" style:background={myUserColor.current}></div>
			<span class="user-name" style:color={myUserColor.current}>
				{myUserName.current}, ID: {myUserId.current}
			</span>
		</div>
	</div>

	{#if collaborators.current.length > 0}
		<div class="other-users-section">
			<h4 class="section-title">Other connected users</h4>
			<div class="other-users-list">
				{#each collaborators.current as { userId, userName, color, cursor } (userId)}
					<div class="other-user-item">
						<div class="other-user-avatar" style:background={color}></div>
						<span class="other-user-name" style:color>
							{userName || `ID: ${userId}`}
						</span>
						<span class="cursor-info">
							Cursor
							<br />
							{cursor ? `(${Math.round(cursor.x)}, ${Math.round(cursor.y)})` : 'unavailable'}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
