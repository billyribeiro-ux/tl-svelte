<script lang="ts">
	import { Tabs } from 'bits-ui'
	import { cn } from '#utils/cn.js'
	import type { ExampleFile } from '#lib/page-data.js'
	import CopyButton from './CopyButton.svelte'

	let {
		files,
		hideTabs,
		class: className,
	}: {
		/** Files already highlighted on the server (see `src/lib/server/highlight.ts`). */
		files: ExampleFile[]
		hideCopyButton?: boolean
		hideTabs?: boolean
		class?: string
	} = $props()
</script>

<Tabs.Root
	value="0"
	class={cn(
		'max-h-[550px] group relative not-prose bg-zinc-100 dark:bg-zinc-800 py-1 md:rounded-2xl -mx-5 md:-mx-1 md:px-1 my-6 flex flex-col',
		'[td_&]:m-0 [td_&]:mb-2 [td_&]:p-0 [td_&]:bg-transparent [td_&]:rounded-none',
		className
	)}
>
	<Tabs.List
		class={cn(
			'bg-zinc-900 shrink-0 text-sm text-zinc-400 shadow md:rounded-t-xl border-b border-zinc-700/50 px-5 md:px-4 gap-4 flex',
			hideTabs && 'hidden'
		)}
	>
		{#each files as file, index (file.name)}
			<Tabs.Trigger
				value={String(index)}
				class="h-10 data-[state=active]:text-white border-b border-transparent data-[state=active]:border-white -mb-px focus:outline-none"
			>
				{file.name}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<div
		class={cn(
			'bg-zinc-900 grow text-sm text-white shadow md:rounded-b-xl overflow-x-auto px-5 md:px-4 py-0',
			hideTabs && 'md:rounded-t-xl'
		)}
	>
		{#each files as file, index (file.name)}
			<Tabs.Content value={String(index)}>
				<pre class="overflow-y-auto p-4">{@html file.html}</pre>
				<CopyButton copy={file.content} />
			</Tabs.Content>
		{/each}
	</div>
</Tabs.Root>
