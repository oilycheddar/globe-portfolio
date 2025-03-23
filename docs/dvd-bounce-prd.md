---
title: DVD Bounce Animation PRD
status: draft
---

# Product Requirements Document (PRD)

**Feature Name:** Bouncing Logo Animation (DVD Screensaver Style)

## Overview
Integrate a custom animation that animates the logo element (`<Logo />`) within the boundaries of the `ContentWrapper` container on the homepage. This behavior mimics a DVD-style bouncing effect where the logo moves diagonally and bounces off all walls. This animation should only run when the DVD mode is toggled **on**, and it should pause/stop and restore normal layout when toggled **off**.

This animation will replace the current `StyledContent`-bounded movement and instead use the full `ContentWrapper` as the collision and motion boundary.

## Goals
- Animate the logo element within the bounds of `ContentWrapper`
- Detect wall collisions and reverse direction accordingly
- Integrate with existing theme and GSAP-based animation infrastructure
- Toggle animation on/off using the `DVD` toggle button
- Avoid layout shifts or FOUC during animation

## Technical Requirements

### Component Affected
- `index.tsx` homepage

### Layout Context
- Outer container: `ContentWrapper` (defined with `styled-components`, `position: absolute/inset: 0`)
- Logo wrapper: `div` wrapping `<Logo />`, already styled with `position: absolute` when active

### Implementation Plan

#### 1. Refs Required
- `contentRef` → reference to `ContentWrapper` (already exists)
- `logoRef` → reference to logo container (already exists)

#### 2. State to Track
- `logoPosition: { x: number, y: number }` — current logo coordinates
- `logoDirection: { x: number, y: number }` — current movement vector (1 or -1 on each axis)
- `logoSpeed: number` — speed in pixels per tick

#### 3. Animation Logic
- Use `requestAnimationFrame` loop
- On each frame:
  - Update position: `position + (direction * speed)`
  - Detect container width/height from `contentRef`
  - Detect logo width/height from `logoRef`
  - On collision with boundary, reverse direction for that axis
  - Use `gsap.set(logoRef, { x, y })` for smoother control

#### 4. Integration with Existing Toggles
- When `DVD` toggle is **enabled**:
  - Fade out all nav and text elements using GSAP
  - Set logo position absolute and center it initially
  - Start `requestAnimationFrame` bounce loop
- When `DVD` toggle is **disabled**:
  - Cancel animation loop
  - Fade nav + text back in
  - Return logo to centered relative position (reset transform)

### Styling Notes
- Ensure the `Logo` container uses `position: absolute` during DVD mode
- Disable transition styles during animation (`transition: none`)
- Restore transform and transition styles when exiting DVD mode

## Deliverables
- Animation logic integrated into `index.tsx`
- GSAP-based bouncing effect across full `ContentWrapper`
- Toggle button control for start/stop behavior
- Visual fidelity across desktop and mobile views 