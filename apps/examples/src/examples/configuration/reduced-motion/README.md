---
title: Reduced motion preferences
component: ./ReducedMotionExample.svelte
priority: 1
keywords:
  [
    accessibility,
    a11y,
    reduced motion,
    animation,
    prefers-reduced-motion,
    useprefersreducedmotion,
    animationspeed,
    user preferences,
    custom shape,
    css animation,
    vestibular,
  ]
---

Respect the user's reduced motion preference in a custom shape with `usePrefersReducedMotion`.

---

`usePrefersReducedMotion()` returns `true` when the user has turned on svelte-draw's "reduce motion" preference (`animationSpeed: 0` in user preferences) or, if no svelte-draw preference is set, when the operating system reports `prefers-reduced-motion: reduce`. Use it inside a shape's Svelte component to swap animations for static alternatives.

The pulse shapes here animate normally and fall back to a still gray circle when reduced motion is preferred. The "Toggle" button in the top panel flips the svelte-draw preference with `editor.user.updateUserPreferences({ animationSpeed })`, so you can watch every shape switch at once. The same setting is available to users under Preferences > Accessibility > Reduce motion in the main menu.

Reduced motion matters for users with vestibular disorders and motion sensitivity, and honoring it is cheap once the check is in one place.
