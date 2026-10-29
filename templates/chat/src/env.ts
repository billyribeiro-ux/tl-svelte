import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
	GOOGLE_GENERATIVE_AI_API_KEY: {
		description: 'Gemini API key from https://aistudio.google.com/apikey',
		// optional here: the /api routes report a clear error when it's missing
		schema: (value) => value,
	},
})
