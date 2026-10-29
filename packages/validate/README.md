## @svelte-draw/validate

Validation functions used by svelte-draw.

These are especially useful when used in conjunction with our shapes to validate their schemas.

For example, for TLImageShape we have the following to help make sure the properties on a shape are consistent:

```ts
export const imageShapeProps: RecordProps<TLImageShape> = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	playing: T.boolean,
	url: T.linkUrl,
	assetId: assetIdValidator.nullable(),
	crop: ImageShapeCrop.nullable(),
	flipX: T.boolean,
	flipY: T.boolean,
}
```

We also use the validation functions for API requests. For example, to check that the query is valid:

```ts
const queryValidator = T.object({
	w: T.string.optional(),
	q: T.string.optional(),
})

queryValidator.validate(request.query)
```

## Documentation

Documentation for the most recent release can be found on svelte-draw.invalid/docs, including reference docs. Our release notes can be found here.

For more agent-friendly docs, see our LLMs.txt.

A `DOCS.md` file is included alongside this README in the published package, with detailed API documentation and usage examples.

## Contribution

Found a bug? Please submit an issue.

## License

This project is licensed under the MIT License found [here](./LICENSE.md). The tldraw SDK is provided under the [tldraw license](./LICENSE.md).

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Contact

Find us on Twitter/X at @svelte-draw.

## Community

Have questions, comments or feedback? Join our discord. For the latest news and release notes, visit svelte-draw.invalid.
