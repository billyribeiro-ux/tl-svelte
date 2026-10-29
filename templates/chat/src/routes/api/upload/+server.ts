import { GOOGLE_GENERATIVE_AI_API_KEY } from '$app/env/private'
import { GoogleGenAI } from '@google/genai'
import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = GOOGLE_GENERATIVE_AI_API_KEY
	if (!apiKey) {
		return new Response('GOOGLE_GENERATIVE_AI_API_KEY is not set', { status: 500 })
	}

	const contentType = request.headers.get('content-type')
	if (!contentType) {
		return new Response('content-type is not set', { status: 400 })
	}

	const displayName = request.headers.get('x-file-name')
	if (!displayName) {
		return new Response('x-file-name is not set', { status: 400 })
	}

	const ai = new GoogleGenAI({ apiKey })

	const file = await ai.files.upload({
		file: await request.blob(),
		config: { mimeType: contentType, displayName },
	})

	return Response.json({ uploadedUrl: file.uri, expiresAt: file.expirationTime })
}
