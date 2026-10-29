/** @internal */
export function getLicenseStylesCss(className: string): string {
	return `
/* ------------------- SEE LICENSE -------------------
The tldraw watermark is part of tldraw's license. It is shown for unlicensed
or "licensed-with-watermark" users. By using this library, you agree to
preserve the watermark's behavior, keeping it visible, unobscured, and
available to user-interaction.

To remove the watermark, please purchase a license at tldraw.dev.
*/

.${className} {
	position: absolute;
	bottom: max(var(--tl-space-2), env(safe-area-inset-bottom));
	right: max(var(--tl-space-2), env(safe-area-inset-right));
	width: 96px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: var(--tl-layer-watermark) !important;
	background-color: color-mix(in srgb, var(--tl-color-background) 62%, transparent);
	opacity: 1;
	border-radius: 5px;
	pointer-events: all;
	padding: 2px;
	box-sizing: content-box;
}

.${className} > button {
	position: absolute;
	width: 96px;
	height: 32px;
	pointer-events: all;
	cursor: inherit;
	color: var(--tl-color-text);
	opacity: .38;
	border: 0;
	padding: 0;
	background-color: currentColor;
}

.${className}[data-debug='true'] {
	bottom: max(46px, env(safe-area-inset-bottom));
}

.${className}[data-mobile='true'] {
	border-radius: 4px 0px 0px 4px;
	right: max(-2px, calc(env(safe-area-inset-right) - 2px));
	width: 8px;
	height: 48px;
}

.${className}[data-mobile='true'] > button {
	width: 8px;
	height: 32px;
}

.tl-container[dir='rtl'] .${className} {
	right: auto;
	left: max(var(--tl-space-2), env(safe-area-inset-left));
}

.tl-container[dir='rtl'] .${className}[data-mobile='true'] {
	border-radius: 0px 4px 4px 0px;
	left: max(-2px, calc(env(safe-area-inset-left) - 2px));
}

.${className}[data-unlicensed='true'] > button {
	font-size: 100px;
	position: absolute;
	pointer-events: all;
	cursor: pointer;
	color: var(--tl-color-text);
	opacity: 0.8;
	border: 0;
	padding: 0;
	background-color: transparent;
	font-size: 11px;
	font-weight: 600;
	text-align: center;
}

.${className}[data-mobile='true'][data-unlicensed='true'] > button {
	display: none;
}

@media (hover: hover) {
	.${className} > button {
		pointer-events: none;
	}

	.${className}:hover {
		background-color: var(--tl-color-background);
		transition: background-color 0.2s ease-in-out;
		transition-delay: 0.32s;
	}

	.${className}:hover > button {
		animation: ${className}_delayed_link 0.2s forwards ease-in-out;
		animation-delay: 0.32s;
	}

	.${className} > button:focus-visible {
		opacity: 1;
	}
}

@keyframes ${className}_delayed_link {
	0% {
		cursor: inherit;
		opacity: .38;
		pointer-events: none;
	}
	100% {
		cursor: pointer;
		opacity: 1;
		pointer-events: all;
	}
}`
}
