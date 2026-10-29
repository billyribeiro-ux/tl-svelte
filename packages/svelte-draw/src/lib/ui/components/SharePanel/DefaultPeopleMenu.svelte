<script lang="ts" module>
	import { defineMessages, type TLUserId } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	const messages = defineMessages({
		peopleMenuTitle: { id: 'people-menu.title', defaultMessage: 'People' },
	})

	/** @public */
	export interface DefaultPeopleMenuProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import { fromComputed, getContainer, getEditor, usePeerIds } from '@svelte-draw/svelte'
	import { Popover } from 'bits-ui'
	import { getUiComponents } from '../../context/components'
	import { createCollaborationStatus } from '../../hooks/useCollaborationStatus'
	import { createMenuIsOpen } from '../../hooks/useMenuIsOpen'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import OfflineIndicator from '../OfflineIndicator/OfflineIndicator.svelte'
	import DefaultPeopleMenuContent from './DefaultPeopleMenuContent.svelte'

	let { children }: DefaultPeopleMenuProps = $props()

	const msg = getTranslation()
	const dir = getDirection()

	const container = getContainer()
	const editor = getEditor()

	const userIds = usePeerIds()
	const userColor = fromComputed('user', () => editor.user.getColor())
	const userName = fromComputed('user', () => editor.user.getName())

	const menu = createMenuIsOpen('people menu')

	const collaborationStatus = createCollaborationStatus()

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
</script>

{#if collaborationStatus.current === 'offline'}
	<OfflineIndicator />
{:else if userIds.current.length && (children || components.PeopleMenuFacePile)}
	{@const PeopleMenuFacePile = components.PeopleMenuFacePile}
	<Popover.Root bind:open={() => menu.isOpen, (value) => menu.onOpenChange(value)}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					dir={dir.current}
					class="tlui-people-menu__avatars-button"
					title={msg(messages.peopleMenuTitle)}
				>
					{#if PeopleMenuFacePile}
						<PeopleMenuFacePile
							userColor={userColor.current}
							userIds={userIds.current}
							userName={userName.current}
						/>
					{/if}
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Portal to={container}>
			<Popover.Content
				dir={dir.current}
				class="tlui-menu"
				side="bottom"
				sideOffset={2}
				collisionPadding={4}
			>
				<div class="tlui-people-menu__wrapper">
					{#if children}
						{@render children()}
					{:else}
						<!-- `usePeerIds` is typed `string[]`; the ids come from collaborator records, so they are user ids. -->
						<DefaultPeopleMenuContent userIds={userIds.current} />
					{/if}
				</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
{/if}
