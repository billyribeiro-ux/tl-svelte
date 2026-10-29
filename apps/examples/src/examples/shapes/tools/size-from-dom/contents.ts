export const contents = `
Have five minutes? Let's try out the svelte-draw SDK in a React project. If you're new to React, we recommend using a Vite template as a starter. We'll assume your project is already running locally.

Prefer to jump straight to some code? Try this sandbox.

First, install the svelte-draw package from NPM:

npm install svelte-draw

Next, in your React project, import the SvelteDraw component and svelte-draw's CSS styles. Then render the SvelteDraw component inside a full screen container:

That's pretty much it! At this point, you should have a complete working single-user canvas. You can draw and write on the canvas, add images and video, zoom and pan, copy and paste, undo and redo, and do just about everything else you'd expect to do on a canvas.

You'll be starting from our default shapes, tools, and user interface, but you can customize all of these things for your project if you wish. For now, let's show off a few more features.
`
	.replace(/\n/g, '')
	.replace(/\s+/g, ' ')
	.split(' ')
