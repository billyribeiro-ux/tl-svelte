<script lang="ts">
	import type { ModelMessage } from 'ai'
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiInput,
		getEditor,
		nativeEvents,
	} from 'svelte-draw'
	import { handleIcon, sendIcon } from '../../components/icons.svelte'
	import { getAllConnectedNodes } from '../nodePorts'
	import type { NodeComponentProps } from './shared'
	import { updateNode } from './shared'
	import type { MessageNode } from './MessageNode'

	let { node, shape }: NodeComponentProps<MessageNode> = $props()

	const editor = getEditor()

	// The shape's own pointer events must not reach the editor's canvas, which would otherwise
	// select or drag the node when the input or the send button is used.
	const markHandled = nativeEvents({ pointerdown: (e) => editor.markEventAsHandled(e) })

	function handleSend() {
		// 1. gather up parents and create message history
		// 2. create prompt
		// 3. send prompt to ai
		// 4. update node with assistant message

		const messages: ModelMessage[] = []
		for (const connectedShape of getAllConnectedNodes(editor, shape, 'end')) {
			const node = editor.getShape(connectedShape)
			if (!node || !editor.isShapeOfType(node, 'node')) continue
			if (node.props.node.type !== 'message') continue

			if (node.props.node.assistantMessage && connectedShape !== shape.id) {
				messages.push({ role: 'assistant', content: node.props.node.assistantMessage })
			}
			messages.push({ role: 'user', content: node.props.node.userMessage })
		}
		messages.reverse()

		// clear any previous assistant message before starting
		updateNode<MessageNode>(editor, shape, (node) => ({
			...node,
			assistantMessage: '...',
		}))

		// stream the response and append as chunks arrive
		;(async () => {
			try {
				const response = await fetch('/stream', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(messages),
				})
				if (!response.body) return

				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				let accumulatedText = ''

				while (true) {
					const { value, done } = await reader.read()
					if (done) break
					const chunk = decoder.decode(value, { stream: true })
					// Some environments may send SSE-style lines; extract data if so, else use raw chunk
					const maybeSse = chunk
						.split('\n')
						.filter((line) => line.startsWith('data:'))
						.map((line) => line.replace(/^data:\s?/, ''))
						.join('')
					accumulatedText += maybeSse || chunk
					updateNode<MessageNode>(editor, shape, (node) => ({
						...node,
						assistantMessage: accumulatedText,
					}))
				}
			} catch (e) {
				console.error(e)
			}
		})()
	}

	function handleMessageChange(value: string) {
		updateNode<MessageNode>(editor, shape, (node) => ({
			...node,
			userMessage: value,
		}))
	}
</script>

<div style="pointer-events: auto; display: flex; flex-direction: column;">
	<div style="display: flex; flex-direction: row; align-items: center;">
		<div
			style="height: 100%; width: 32px; padding-left: 4px; display: flex; justify-content: center; align-items: center; cursor: grab;"
		>
			<SvelteDrawUiButtonIcon icon={handleIcon} />
		</div>
		<div style="padding: 4px 0px 0px 4px; flex-grow: 2;" {@attach markHandled}>
			<div style="padding: 0px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
				<SvelteDrawUiInput
					value={node.userMessage}
					onValueChange={handleMessageChange}
					onComplete={handleSend}
				/>
			</div>
		</div>
		<div style="display: flex; justify-content: flex-end; padding: 0px 0px;" {@attach markHandled}>
			<SvelteDrawUiButton type="primary" onclick={handleSend}>
				<SvelteDrawUiButtonIcon icon={sendIcon} />
			</SvelteDrawUiButton>
		</div>
	</div>
	{#if node.assistantMessage}
		<div style="padding: 4px;">
			<div
				style="padding: 8px; line-height: 1.3; font-size: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-weight: 500; font-family: Inter; overflow-wrap: normal; white-space: pre-wrap;"
			>
				{node.assistantMessage}
			</div>
		</div>
	{/if}
</div>
