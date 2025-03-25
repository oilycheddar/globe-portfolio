# Product Requirements Document (PRD)

**Feature Name:** DVD Mode – Shadow Logo Approach

---

## Overview
Refactor the DVD animation experience by introducing a separate "shadow" logo placed in the top-level container (e.g. `ContentWrapper`) that animates independently. This allows the logo to bounce across the entire screen while avoiding layout restructuring. The nested content and logo are hidden during DVD mode, and the floating logo becomes visible and animated.

---

## Goals
- Enable logo to animate freely within the entire `ContentWrapper`
- Preserve existing nested layout and logo
- Improve maintainability and visual fidelity
- Avoid DOM mutations or manual element repositioning
- Maintain clean toggle logic between normal and DVD modes

---

## Implementation Strategy

### 1. Add Shadow Logo to `ContentWrapper`
- Place an absolutely positioned duplicate of `<Logo />` directly inside `ContentWrapper`
- Set initial `visibility: hidden`

```tsx
<div
  ref={dvdLogoRef}
  className="absolute w-[50vw] aspect-[2/1] pointer-events-none"
  style={{
    visibility: isDvdActive ? 'visible' : 'hidden',
    transform: `translate(${logoPosition.x}px, ${logoPosition.y}px)`,
    transition: 'none',
    zIndex: 40,
  }}
>
  <Logo />
</div>
```

### 2. Hide Normal Page Content When DVD Mode is Active
- Toggle visibility of `StyledContent` based on `isDvdActive`:

```tsx
<StyledContent
  ref={contentRef}
  style={{
    visibility: isDvdActive ? 'hidden' : 'visible',
    transition: 'visibility 0.2s ease'
  }}
>
  {/* Normal content here */}
</StyledContent>
```

### 3. Toggle Logic
- Update the existing `handleDvdToggle` function to:
  - Set `isDvdActive`
  - Hide/show content and shadow logo
  - Start or cancel the animation loop on `dvdLogoRef`

```ts
const handleDvdToggle = (value: boolean) => {
  setIsDvdActive(value);

  if (value) {
    startDvdAnimation(dvdLogoRef);
  } else {
    stopDvdAnimation();
  }
};
```

### 4. Animate the Shadow Logo
- Use `requestAnimationFrame` to bounce the shadow logo against the bounds of `ContentWrapper`
- Use `gsap.set()` for smooth control over position updates

---

## Styling Notes
- Set `pointer-events: none` on the shadow logo to avoid interaction interference
- Use `z-index: 40+` to ensure it renders above content but below modals
- Consider adding `opacity: 0/1` transitions for smoother fades if desired

---

## Deliverables
- Refactored `index.tsx` layout with dual logo setup
- Clean toggle between DVD mode and regular content
- GSAP-powered bouncing logo animation tied to `dvdLogoRef`

---

## Advantages
- Keeps existing layout structure untouched
- Easy to maintain and scale
- Eliminates positioning conflicts caused by nested containers
- Declarative and React-compliant

---

## Status
Ready for implementation 