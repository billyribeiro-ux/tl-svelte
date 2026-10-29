<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		peopleMenuChangeColor: { id: 'people-menu.change-color', defaultMessage: 'Change color' },
	})
</script>

<script lang="ts">
	import { getOwnerWindow, USER_COLORS } from '@svelte-draw/editor'
	import { fromComputed, getContainer, getEditor } from '@svelte-draw/svelte'
	import { Popover } from 'bits-ui'
	import { getUiEvents } from '../../context/events'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiGrid from '../primitives/SvelteDrawUiGrid.svelte'

	const editor = getEditor()
	const container = getContainer()
	const msg = getTranslation()
	const dir = getDirection()
	const trackEvent = getUiEvents()

	let isPointing = false

	let isOpen = $state(false)

	const value = fromComputed('user color', () => editor.user.getColor())

	function onValueChange(item: string) {
		editor.user.updateUserPreferences({ color: item })
		trackEvent('set-color', { source: 'people-menu' })
	}

	function handlePointerUp() {
		isPointing = false
		getOwnerWindow(container).removeEventListener('pointerup', handlePointerUp)
	}

	function handleButtonClick(e: MouseEvent & { currentTarget: HTMLElement }) {
		const { id } = e.currentTarget.dataset
		if (!id) return
		if (value.current === id) return

		onValueChange(id)
	}

	function handleButtonPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
		const { id } = e.currentTarget.dataset
		if (!id) return

		onValueChange(id)

		isPointing = true
		getOwnerWindow(container).addEventListener('pointerup', handlePointerUp) // see TLD-658
	}

	function handleButtonPointerEnter(e: PointerEvent & { currentTarget: HTMLElement }) {
		if (!isPointing) return

		const { id } = e.currentTarget.dataset
		if (!id) return
		onValueChange(id)
	}

	function handleButtonPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
		const { id } = e.currentTarget.dataset
		if (!id) return
		onValueChange(id)
	}
</script>

<Popover.Root bind:open={isOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				dir={dir.current}
				type="icon"
				class="tlui-people-menu__user__color"
				style={`color: ${value.current}`}
				title={msg(messages.peopleMenuChangeColor)}
			>
				<SvelteDrawUiButtonIcon icon="color" />
			</SvelteDrawUiButton>
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal to={container}>
		<Popover.Content
			dir={dir.current}
			class="tlui-menu tlui-people-menu__user__color-picker"
			align="start"
			side="left"
			sideOffset={8}
		>
			<SvelteDrawUiGrid>
				{#each USER_COLORS as item (item)}
					<SvelteDrawUiButton
						type="icon"
						data-id={item}
						data-testid={item}
						aria-label={item}
						isActive={value.current === item}
						title={item}
						style={`color: ${item}`}
						onpointerenter={handleButtonPointerEnter}
						onpointerdown={handleButtonPointerDown}
						onpointerup={handleButtonPointerUp}
						onclick={handleButtonClick}
					>
						<SvelteDrawUiButtonIcon icon="color" />
					</SvelteDrawUiButton>
				{/each}
			</SvelteDrawUiGrid>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
