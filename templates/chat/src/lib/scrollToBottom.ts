/**
 * Scrolls to the bottom of the page with a smooth animation. Typically you'd use the browser's
 * `scrollTo({behavior: 'smooth'})` for this, but that doesn't do well if it's called multiple times
 * in a row before each previous animation has completed (ie in an AI streaming type use-case). This
 * function keeps scrolling until it reaches the bottom using a physics-based approach for easing,
 * rather than multiple distinct animations.
 */
export function createScrollToBottom() {
	let currentScrollAnimation: { nextFrame: number } | null = null

	return function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
		const scrollingElement = document.scrollingElement
		if (!scrollingElement) return

		if (behavior !== 'smooth') {
			scrollingElement.scrollTo({ top: scrollingElement.scrollHeight, behavior: 'instant' })
			if (currentScrollAnimation) {
				cancelAnimationFrame(currentScrollAnimation.nextFrame)
				currentScrollAnimation = null
			}
			return
		}

		if (currentScrollAnimation) {
			return
		}

		let scrollTop = scrollingElement.scrollTop
		let velocity = 0
		let lastT = performance.now()
		const acceleration = 0.02
		const maxVelocity = 5

		const tick = () => {
			const t = performance.now()
			const dt = t - lastT
			lastT = t

			velocity = Math.min(velocity + acceleration * dt, maxVelocity)
			scrollTop += velocity * dt

			scrollingElement.scrollTop = scrollTop
			const maxScrollTop = scrollingElement.scrollHeight - scrollingElement.clientHeight
			if (scrollTop < maxScrollTop) {
				currentScrollAnimation = { nextFrame: requestAnimationFrame(tick) }
			} else {
				currentScrollAnimation = null
			}
		}

		currentScrollAnimation = { nextFrame: requestAnimationFrame(tick) }
	}
}
