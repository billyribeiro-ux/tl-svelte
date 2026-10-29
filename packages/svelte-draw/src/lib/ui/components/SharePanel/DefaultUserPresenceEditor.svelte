<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		peopleMenuAnonymousUser: { id: 'people-menu.anonymous-user', defaultMessage: 'New user' },
		peopleMenuChangeName: { id: 'people-menu.change-name', defaultMessage: 'Change name' },
		peopleMenuUser: { id: 'people-menu.user', defaultMessage: '(You)' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiInput from '../primitives/SvelteDrawUiInput.svelte'
	import UserPresenceColorPicker from './UserPresenceColorPicker.svelte'

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const userName = fromComputed('userName', () => editor.user.getName())
	const msg = getTranslation()

	let originalName = userName.current
	let currentName = userName.current

	// Whether the user is editing their name or not
	let isEditingName = $state(false)
	function toggleEditingName() {
		isEditingName = !isEditingName
	}

	function handleValueChange(value: string) {
		currentName = value
		editor.user.updateUserPreferences({ name: value })
	}

	function handleBlur() {
		if (originalName === currentName) return
		trackEvent('change-user-name', { source: 'people-menu' })
		originalName = currentName
	}

	function handleCancel() {
		isEditingName = false
		editor.user.updateUserPreferences({ name: originalName })
		editor.menus.clearOpenMenus()
	}
</script>

<div class="tlui-people-menu__user">
	<UserPresenceColorPicker />
	{#if isEditingName}
		<SvelteDrawUiInput
			class="tlui-people-menu__user__input"
			defaultValue={userName.current}
			onValueChange={handleValueChange}
			onComplete={toggleEditingName}
			onCancel={handleCancel}
			onBlur={handleBlur}
			shouldManuallyMaintainScrollPositionWhenFocused
			autoFocus
			autoSelect
		/>
	{:else}
		<!-- Double-click to edit is a pointer shortcut; the edit button next to it is the keyboard path. -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="tlui-people-menu__user__name" ondblclick={() => (isEditingName = true)}>
			{userName.current || msg(messages.peopleMenuAnonymousUser)}
		</div>
		{#if !userName.current}
			<div class="tlui-people-menu__user__label">{msg(messages.peopleMenuUser)}</div>
		{/if}
	{/if}
	<SvelteDrawUiButton
		type="icon"
		class="tlui-people-menu__user__edit"
		data-testid="people-menu.change-name"
		title={msg(messages.peopleMenuChangeName)}
		onclick={toggleEditingName}
	>
		<SvelteDrawUiButtonIcon icon={isEditingName ? 'check' : 'edit'} />
	</SvelteDrawUiButton>
</div>
