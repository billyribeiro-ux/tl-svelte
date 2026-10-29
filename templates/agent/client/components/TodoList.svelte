<script lang="ts">
	import { fromComputed } from '@svelte-draw/svelte'
	import type { TodoItem } from '../../shared/types/TodoItem'
	import type { SvelteDrawAgent } from '../agent/SvelteDrawAgent'

	let { agent }: { agent: SvelteDrawAgent } = $props()

	const todoItems = fromComputed('todoList', () => agent.todos.getTodos())

	function getStatusIcon(status: TodoItem['status']) {
		switch (status) {
			case 'todo':
				return '○'
			case 'in-progress':
				return '➤'
			case 'done':
				return '●'
		}
	}
</script>

{#if todoItems.current.length > 0}
	<div class="todo-list">
		<div class="todo-list-items">
			{#each todoItems.current as item (item.id)}
				<div class={`todo-item todo-item-${item.status}`}>
					<span class="todo-item-icon">{getStatusIcon(item.status)}</span>
					<span class="todo-item-text">{item.text}</span>
					<button class="todo-item-delete" onclick={() => agent.todos.delete([item.id])}>
						×
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}
