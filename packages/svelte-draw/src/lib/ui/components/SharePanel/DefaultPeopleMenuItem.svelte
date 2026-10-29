<script lang="ts" module>
	import { defineMessages, type TLUserId } from '@svelte-draw/editor'

	const messages = defineMessages({
		peopleMenuAnonymousUser: { id: 'people-menu.anonymous-user', defaultMessage: 'New user' },
		peopleMenuAvatarColor: { id: 'people-menu.avatar-color', defaultMessage: 'Avatar color' },
		peopleMenuFollow: { id: 'people-menu.follow', defaultMessage: 'Following' },
		peopleMenuFollowing: { id: 'people-menu.following', defaultMessage: 'Following' },
		peopleMenuLeading: { id: 'people-menu.leading', defaultMessage: 'Following you' },
	})

	/** @public */
	export interface TLUiPeopleMenuItemProps {
		userId: TLUserId
	}
</script>

<script lang="ts">
	import { fromComputed, getEditor, usePresence } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiIcon from '../primitives/SvelteDrawUiIcon.svelte'

	let { userId }: TLUiPeopleMenuItemProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const trackEvent = getUiEvents()

	const presence = usePresence(() => userId)
	const followingUserId = fromComputed(
		'followingUserId',
		() => editor.getInstanceState().followingUserId
	)
	const userRecordId = fromComputed('user record id', () => editor.user.getRecordId())

	function handleFollowClick() {
		if (editor.getInstanceState().followingUserId === userId) {
			editor.stopFollowingUser()
			trackEvent('stop-following', { source: 'people-menu' })
		} else {
			editor.startFollowingUser(userId)
			trackEvent('start-following', { source: 'people-menu' })
		}
	}

	const theyAreFollowingYou = $derived(presence.current?.followingUserId === userRecordId.current)
	const youAreFollowingThem = $derived(followingUserId.current === userId)
</script>

{#if presence.current}
	<div class="tlui-people-menu__item" data-follow={youAreFollowingThem || theyAreFollowingYou}>
		<SvelteDrawUiButton
			type="menu"
			class="tlui-people-menu__item__button"
			onclick={() => editor.zoomToUser(userId)}
			ondblclick={handleFollowClick}
		>
			<SvelteDrawUiIcon
				label={msg(messages.peopleMenuAvatarColor)}
				icon="color"
				color={presence.current.color}
			/>
			<div class="tlui-people-menu__name">
				{presence.current.userName?.trim() || msg(messages.peopleMenuAnonymousUser)}
			</div>
		</SvelteDrawUiButton>
		<SvelteDrawUiButton
			type="icon"
			class="tlui-people-menu__item__follow"
			title={theyAreFollowingYou
				? msg(messages.peopleMenuLeading)
				: youAreFollowingThem
					? msg(messages.peopleMenuFollowing)
					: msg(messages.peopleMenuFollow)}
			onclick={handleFollowClick}
			disabled={theyAreFollowingYou}
		>
			<SvelteDrawUiButtonIcon
				icon={theyAreFollowingYou ? 'leading' : youAreFollowingThem ? 'following' : 'follow'}
			/>
		</SvelteDrawUiButton>
	</div>
{/if}
