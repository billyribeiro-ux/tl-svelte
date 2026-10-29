<div alt style="text-align: center; transform: scale(.5);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-light.png" />
	</picture>
</div>

This repo contains a starter-kit for making an AI chat application using svelte-draw.

## Local development

Install dependencies with `npm install`.

Run the development server with `npm run dev`.

Open `http://localhost:3000/` in your browser to see the app.

This starter kit demonstrates how to build an AI chat application that uses svelte-draw to provide sketches and annotated image to the model. The app features:

- Integrated whiteboard for providing visual context
- Image annotation and markup
- Easy switching between text chat and visual canvas input

Key interactions include:

- Chat with AI using natural language
- Click the whiteboard button to open the svelte-draw canvas
- Draw, sketch, and create diagrams to supplement conversations
- Annotate images and visual content directly on the canvas

## Environment setup

Create a `.env.local` file in the root directory and add your Google Generative API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).
You can also switch to a different provider using the [Vercel AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers).

## File structure

- **`src/routes/+page.svelte`:** The main entry point that renders the chat interface
- **`src/lib/components/ChatInner.svelte`:** The main chat container. It drives the Vercel AI SDK's framework-agnostic `AbstractChat` through `src/lib/chat.svelte.ts`, which keeps its state in Svelte runes
- **`src/lib/components/MessageList.svelte`:** Scrollable message history with loading states
- **`src/lib/components/ChatMessage.svelte`:** Individual message display component (markdown is rendered with `marked` and sanitized with DOMPurify, see `src/lib/markdown.ts`)
- **`src/lib/components/ChatInput.svelte`:** Input field with send functionality
- **`src/lib/components/WhiteboardModal.svelte`:** Modal component that integrates svelte-draw for drawing and sketching
- **`src/routes/api/chat/+server.ts`:** SvelteKit endpoint using the Vercel AI SDK to call Gemini
- **`src/app.css`:** CSS with responsive design for all components

## License

This project is provided under the MIT license found here. The tldraw SDK is provided under the [tldraw license](./LICENSE.md).

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Distributions

You can find svelte-draw on npm here.

## Contribution

Found a bug? Please submit an issue.

## Community

Have questions, comments or feedback? Join our discord. For the latest news and release notes, visit svelte-draw.invalid.

## Contact

Find us on Twitter/X at @svelte-draw.
