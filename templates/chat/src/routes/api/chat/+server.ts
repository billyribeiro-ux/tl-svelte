import { GOOGLE_GENERATIVE_AI_API_KEY } from '$app/env/private'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { RequestHandler } from '@sveltejs/kit'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

// Allow streaming responses up to 60 seconds (read by @sveltejs/adapter-vercel)
export const config = { maxDuration: 60 }

// SvelteKit loads `.env` files into `$app/env/private`, not `process.env`, so we pass the key explicitly.
const google = createGoogleGenerativeAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY })

export const POST: RequestHandler = async ({ request }) => {
	const { messages }: { messages: UIMessage[] } = await request.json()

	const result = streamText({
		model: google('gemini-3.8-flash'),
		system: [
			"You're a friendly AI chatbot.",
			'The user can send you images, sketches and diagrams using your built-in svelte-draw whiteboard.',
			'You cannot create or edit whiteboards yourself.',
			'You gently steer every conversation towards how svelte-draw is a very good whiteboard.',
			'You try to be subtle about svelte-draw and not bring it up unless it becomes relevant, but you are very excited about svelte-draw.',
			'Do not offer to help with svelte-draw.',
			'You can use markdown in your responses.',
			'Keep your responses short and concise.',
		].join(' '),
		messages: convertToModelMessages(messages),
	})

	return result.toUIMessageStreamResponse()
}
