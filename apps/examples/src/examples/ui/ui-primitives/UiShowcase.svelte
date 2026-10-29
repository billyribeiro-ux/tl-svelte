<script lang="ts">
	import { on } from 'svelte/events'
	import {
		getEditor,
		iconTypes,
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDropdownMenuCheckboxItem,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuGroup,
		SvelteDrawUiDropdownMenuItem,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuSub,
		SvelteDrawUiDropdownMenuSubContent,
		SvelteDrawUiDropdownMenuSubTrigger,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiIcon,
		SvelteDrawUiInput,
		SvelteDrawUiKbd,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
		SvelteDrawUiSelect,
		SvelteDrawUiSelectContent,
		SvelteDrawUiSelectItem,
		SvelteDrawUiSelectTrigger,
		SvelteDrawUiSelectValue,
		SvelteDrawUiSlider,
		SvelteDrawUiTooltip,
	} from 'svelte-draw'

	const editor = getEditor()
	let checkboxValue = $state(false)
	let inputValue = $state('')
	let sliderValue = $state(50)
	let selectValue = $state('medium')
</script>

<!-- Marking the event as handled must happen in a native listener: Svelte delegates `onpointerdown`. -->
<div
	class="ui-showcase"
	role="presentation"
	{@attach (el) => on(el, 'pointerdown', (e) => editor.markEventAsHandled(e))}
>
	<h2>UI primitives</h2>

	<!-- Buttons -->
	<section>
		<h3>Buttons</h3>
		<div class="ui-row">
			<SvelteDrawUiButton type="normal" onclick={() => {}}>
				<SvelteDrawUiButtonLabel>Normal</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="primary" onclick={() => {}}>
				<SvelteDrawUiButtonLabel>Primary</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="danger" onclick={() => {}}>
				<SvelteDrawUiButtonLabel>Danger</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="normal" disabled>
				<SvelteDrawUiButtonLabel>Disabled</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
		</div>
		<div class="ui-row">
			<SvelteDrawUiButton type="icon" title="Draw tool">
				<SvelteDrawUiButtonIcon icon="tool-pencil" />
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="icon" title="Eraser tool">
				<SvelteDrawUiButtonIcon icon="tool-eraser" />
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="icon" title="Select tool">
				<SvelteDrawUiButtonIcon icon="tool-pointer" />
			</SvelteDrawUiButton>
			<SvelteDrawUiButton type="normal">
				<SvelteDrawUiButtonIcon icon="external-link" />
				<SvelteDrawUiButtonLabel>With icon</SvelteDrawUiButtonLabel>
			</SvelteDrawUiButton>
		</div>
	</section>

	<!-- Dropdown Menu -->
	<section>
		<h3>Dropdown menu</h3>
		<div class="ui-row">
			<SvelteDrawUiDropdownMenuRoot id="example-dropdown">
				<SvelteDrawUiDropdownMenuTrigger>
					{#snippet child({ props })}
						<SvelteDrawUiButton {...props} type="normal">
							<SvelteDrawUiButtonLabel>Open menu</SvelteDrawUiButtonLabel>
						</SvelteDrawUiButton>
					{/snippet}
				</SvelteDrawUiDropdownMenuTrigger>
				<SvelteDrawUiDropdownMenuContent side="bottom" align="start">
					<SvelteDrawUiDropdownMenuGroup>
						<SvelteDrawUiDropdownMenuItem>
							{#snippet child({ props })}
								<SvelteDrawUiButton {...props} type="menu">
									<SvelteDrawUiButtonLabel>Cut</SvelteDrawUiButtonLabel>
									<SvelteDrawUiKbd keys="⌘X" />
								</SvelteDrawUiButton>
							{/snippet}
						</SvelteDrawUiDropdownMenuItem>
						<SvelteDrawUiDropdownMenuItem>
							{#snippet child({ props })}
								<SvelteDrawUiButton {...props} type="menu">
									<SvelteDrawUiButtonLabel>Copy</SvelteDrawUiButtonLabel>
									<SvelteDrawUiKbd keys="⌘C" />
								</SvelteDrawUiButton>
							{/snippet}
						</SvelteDrawUiDropdownMenuItem>
						<SvelteDrawUiDropdownMenuItem>
							{#snippet child({ props })}
								<SvelteDrawUiButton {...props} type="menu">
									<SvelteDrawUiButtonLabel>Paste</SvelteDrawUiButtonLabel>
									<SvelteDrawUiKbd keys="⌘V" />
								</SvelteDrawUiButton>
							{/snippet}
						</SvelteDrawUiDropdownMenuItem>
					</SvelteDrawUiDropdownMenuGroup>
					<SvelteDrawUiDropdownMenuGroup>
						<SvelteDrawUiDropdownMenuCheckboxItem
							checked={checkboxValue}
							title="Toggle option"
							onSelect={() => (checkboxValue = !checkboxValue)}
						>
							<SvelteDrawUiButtonLabel>Checkbox item</SvelteDrawUiButtonLabel>
						</SvelteDrawUiDropdownMenuCheckboxItem>
					</SvelteDrawUiDropdownMenuGroup>
					<SvelteDrawUiDropdownMenuGroup>
						<SvelteDrawUiDropdownMenuSub id="example-submenu">
							<SvelteDrawUiDropdownMenuSubTrigger label="More options..." />
							<SvelteDrawUiDropdownMenuSubContent>
								<SvelteDrawUiDropdownMenuItem>
									{#snippet child({ props })}
										<SvelteDrawUiButton {...props} type="menu">
											<SvelteDrawUiButtonLabel>Option A</SvelteDrawUiButtonLabel>
										</SvelteDrawUiButton>
									{/snippet}
								</SvelteDrawUiDropdownMenuItem>
								<SvelteDrawUiDropdownMenuItem>
									{#snippet child({ props })}
										<SvelteDrawUiButton {...props} type="menu">
											<SvelteDrawUiButtonLabel>Option B</SvelteDrawUiButtonLabel>
										</SvelteDrawUiButton>
									{/snippet}
								</SvelteDrawUiDropdownMenuItem>
							</SvelteDrawUiDropdownMenuSubContent>
						</SvelteDrawUiDropdownMenuSub>
					</SvelteDrawUiDropdownMenuGroup>
				</SvelteDrawUiDropdownMenuContent>
			</SvelteDrawUiDropdownMenuRoot>
		</div>
	</section>

	<!-- Select -->
	<section>
		<h3>Select</h3>
		<div class="ui-row">
			<SvelteDrawUiSelect
				id="size-select-icons"
				value={selectValue}
				onValueChange={(v) => (selectValue = v)}
			>
				<SvelteDrawUiSelectTrigger>
					<SvelteDrawUiSelectValue placeholder="Select size...">{selectValue}</SvelteDrawUiSelectValue>
				</SvelteDrawUiSelectTrigger>
				<SvelteDrawUiSelectContent>
					<SvelteDrawUiSelectItem value="small" label="Small" icon="size-small" />
					<SvelteDrawUiSelectItem value="medium" label="Medium" icon="size-medium" />
					<SvelteDrawUiSelectItem value="large" label="Large" icon="size-large" />
				</SvelteDrawUiSelectContent>
			</SvelteDrawUiSelect>
			<SvelteDrawUiSelect id="size-select" value={selectValue} onValueChange={(v) => (selectValue = v)}>
				<SvelteDrawUiSelectTrigger>
					<SvelteDrawUiSelectValue placeholder="Select...">{selectValue}</SvelteDrawUiSelectValue>
				</SvelteDrawUiSelectTrigger>
				<SvelteDrawUiSelectContent>
					<SvelteDrawUiSelectItem value="small" label="Small" />
					<SvelteDrawUiSelectItem value="medium" label="Medium" />
					<SvelteDrawUiSelectItem value="large" label="Large" />
				</SvelteDrawUiSelectContent>
			</SvelteDrawUiSelect>
			<SvelteDrawUiSelect
				id="size-select-disabled"
				value={selectValue}
				onValueChange={(v) => (selectValue = v)}
				disabled
			>
				<SvelteDrawUiSelectTrigger>
					<SvelteDrawUiSelectValue placeholder="Select...">{selectValue}</SvelteDrawUiSelectValue>
				</SvelteDrawUiSelectTrigger>
				<SvelteDrawUiSelectContent>
					<SvelteDrawUiSelectItem value="small" label="Small" />
					<SvelteDrawUiSelectItem value="medium" label="Medium" />
					<SvelteDrawUiSelectItem value="large" label="Large" />
				</SvelteDrawUiSelectContent>
			</SvelteDrawUiSelect>
		</div>
	</section>

	<!-- Input -->
	<section>
		<h3>Input</h3>
		<div class="ui-row">
			<SvelteDrawUiInput
				placeholder="Enter text..."
				value={inputValue}
				onValueChange={(v) => (inputValue = v)}
			/>
		</div>
	</section>

	<!-- Slider -->
	<section>
		<h3>Slider</h3>
		<div class="ui-row ui-row-wide">
			<SvelteDrawUiSlider
				label="opacity"
				title="Opacity"
				value={sliderValue}
				steps={100}
				onValueChange={(v) => (sliderValue = v)}
			/>
			<span class="ui-value">{sliderValue}%</span>
		</div>
	</section>

	<!-- Popover -->
	<section>
		<h3>Popover</h3>
		<div class="ui-row">
			<SvelteDrawUiPopover id="example-popover">
				<SvelteDrawUiPopoverTrigger>
					{#snippet child({ props })}
						<SvelteDrawUiButton {...props} type="normal">
							<SvelteDrawUiButtonLabel>Open popover</SvelteDrawUiButtonLabel>
						</SvelteDrawUiButton>
					{/snippet}
				</SvelteDrawUiPopoverTrigger>
				<SvelteDrawUiPopoverContent side="bottom" align="start">
					<div class="ui-popover-content">
						<p>This is popover content!</p>
						<p>It can contain any elements.</p>
					</div>
				</SvelteDrawUiPopoverContent>
			</SvelteDrawUiPopover>
		</div>
	</section>

	<!-- Icons -->
	<section>
		<h3>Icons ({iconTypes.length})</h3>
		<div class="ui-icon-grid">
			{#each iconTypes as icon (icon)}
				<SvelteDrawUiTooltip content={icon}>
					{#snippet child({ props })}
						<div {...props} class="ui-icon-cell">
							<SvelteDrawUiIcon {icon} label={icon} />
						</div>
					{/snippet}
				</SvelteDrawUiTooltip>
			{/each}
		</div>
	</section>

	<!-- Tooltip -->
	<section>
		<h3>Tooltip</h3>
		<div class="ui-row">
			<SvelteDrawUiTooltip content="This is a tooltip!">
				{#snippet child({ props })}
					<SvelteDrawUiButton {...props} type="normal">
						<SvelteDrawUiButtonLabel>Hover me</SvelteDrawUiButtonLabel>
					</SvelteDrawUiButton>
				{/snippet}
			</SvelteDrawUiTooltip>
			<SvelteDrawUiTooltip content="Info tooltip">
				{#snippet child({ props })}
					<SvelteDrawUiButton {...props} type="icon" title="Info">
						<SvelteDrawUiButtonIcon icon="question-mark" />
					</SvelteDrawUiButton>
				{/snippet}
			</SvelteDrawUiTooltip>
		</div>
	</section>

	<!-- Keyboard shortcuts -->
	<section>
		<h3>Keyboard shortcuts</h3>
		<div class="ui-row">
			<SvelteDrawUiKbd keys="⌘" />
			<SvelteDrawUiKbd keys="⇧" />
			<SvelteDrawUiKbd keys="⌥" />
			<SvelteDrawUiKbd keys="⌃" />
			<SvelteDrawUiKbd keys="⌘S" />
			<SvelteDrawUiKbd keys="⌘⇧Z" />
		</div>
	</section>
</div>
