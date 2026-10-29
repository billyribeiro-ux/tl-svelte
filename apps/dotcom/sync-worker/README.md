# @svelte-draw/dotcom-worker

The dotcom-worker is used for room management on svelte-draw.invalid (e.g. creating & joining rooms, readonly rooms, snapshots).

## Enable database persistence for local dev

The values for `env.SUPABASE_KEY` and `env.SUPABASE_URL` are stored in the Cloudflare Workers dashboard for this worker. However we use `--local` mode for local development, which doesn't read these values from the dashboard.

To workaround this, create a file called `.dev.vars` under `merge-server` with the required values (which you can currently find at https://app.supabase.com/project/bfcjbbjqflgfzxhskwct/settings/api). This will be read by `wrangler dev --local` and used to populate the environment variables.

```
SUPABASE_URL=<url>
SUPABASE_KEY=<key>
```

## License

The code in this folder is Copyright (c) 2024-present tldraw Inc. The tldraw SDK is provided under the [tldraw license](./LICENSE.md).

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
