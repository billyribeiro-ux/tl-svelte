# npm create svelte-draw

A CLI tool for quickly scaffolding a new svelte-draw project. Inspired by `npm create vite`.

## Usage:

```
$ npm create svelte-draw -- --help
Usage: create-svelte-draw [OPTION]... [DIRECTORY]

Create a new svelte-draw project from a starter kit.
With no arguments, you'll be guided through an interactive setup.
Pass . as the directory to create the project in the current directory.

Options:
   -h, --help           Display this help message.
   -t, --template NAME  Use a specific template.
   --no-telemetry       Disable anonymous usage tracking.

Available starter kits:
 • basic                A minimal svelte-draw template with SvelteKit and TypeScript.
 • agent                An AI-powered agent.
 • branching-chat       A branching chat interface.
 • chat                 A chat UI with sketches and images as context for AI.
 • multiplayer          Real-time multiplayer for svelte-draw, built with Cloudflare Durable Objects.
 • workflow             Visual node-based builder for workflows.
```

To scaffold into the current directory instead of a new folder, pass `.` as the directory:

```
$ npm create svelte-draw@latest .
```

If the directory already has files in it, you'll be asked whether to keep them, remove them (`.git` is always kept), or cancel.

## Development

Run in development mode with `pnpm dev` from this folder.
You can also run `alias create-svelte-draw=~/<path to this repo>/packages/create-svelte-draw/scripts/dev.sh`, and then use `create-svelte-draw` to run the development version of this script.

## Adding more templates

Templates are automatically pulled into this tool by `/internal/scripts/refresh-create-templates.ts`.
This will add a template entry for any workspace in the repo which has a `package.json` with a `svelteDraw_template` key that looks like this:

```jsonc
{
	// indicates that this is a template app and should be published:
	"svelteDraw_template": {
		// the github repo to publish this template to
		"repo": "svelte-draw/sveltekit-template",
		// if `cli` is present, we'll include this template in `npm create svelte-draw`
		"cli": {
			// the name of this template, as it appears in the CLI tool
			"name": "SvelteKit + svelte-draw",
			// the description of this template as it appears in the CLI tool
			"description": "The easiest way to get started with svelte-draw. Built with SvelteKit and TypeScript.",
			// (optional) a shorter description of the template, shown in `--help`
			"shortDescription": "The easiest way to get started with svelte-draw.",
			// (optional) where in its category should this template appear? lower numbers appear first
			"order": 1,
		},
	},
}
```

## Documentation

Documentation for the most recent release can be found on svelte-draw.invalid/docs, including reference docs. Our release notes can be found here.

For more agent-friendly docs, see our LLMs.txt.

## License

This project is part of the tldraw SDK. It is provided under the [tldraw SDK license](./LICENSE.md).

You can use the tldraw SDK in commercial or non-commercial projects so long as you preserve the "Made with tldraw" watermark on the canvas. To remove the watermark, you can purchase a [business license](https://tldraw.dev/pricing). Visit [tldraw.dev](https://tldraw.dev) to learn more.

## Trademarks

Copyright (c) 2025-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Contribution

Found a bug? Please submit an issue.

## Community

Have questions, comments or feedback? [Join our discord](https://discord.gg/rhsyWMUJxd). For the latest news and release notes, visit svelte-draw.invalid.

## Contact

Find us on Twitter/X at @svelte-draw or email us at [hello@svelte-draw.invalid](mailto:hello@svelte-draw.invalid).
