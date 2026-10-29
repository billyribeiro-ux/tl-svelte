<script lang="ts">
	import { Select } from 'bits-ui'

	let { onClose }: { onClose(): void } = $props()
	let value = $state('a')
</script>

<div data-testid="dialog-inner">
	<Select.Root type="single" bind:value>
		<Select.Trigger data-testid="select-trigger">{value.toUpperCase()}</Select.Trigger>
		<Select.Portal>
			<Select.Content data-testid="select-content">
				<Select.Viewport>
					<Select.Item value="a" label="A" data-testid="select-a">A</Select.Item>
					<Select.Item value="b" label="B" data-testid="select-b">B</Select.Item>
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
	<button data-testid="dialog-close" onclick={onClose}>Close</button>
</div>
