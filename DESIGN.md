Brutalist redesign & Figma notes

Goal
- Brutalist aesthetic: bold, full-screen hero with large typography and photo, strong geometry, simple palette, and clear hierarchy.
- Mobile-first: thumb-friendly navigation and large tap targets.
- Smooth section transitions via reveal animation (IntersectionObserver)

Figma prototype suggestions
- Frames: Desktop (1440×1024), Tablet (768×1024), Mobile (375×812). Use Auto Layout for responsive behaviors.
- Hero frame: full-bleed hero with centered large headline (uppercase, very large), subheading, CTAs, and a profile/photo on the right. Use a grid to align edge offsets and keep the photo aligned to the bottom-right.
- Sections: stack blocks with clear spacing, each section should have an H2 and a leading paragraph. Prototype reveal animations using Smart Animate or the "Move In" transitions.
- Mobile nav: place a large, rounded pill nav at the bottom center. Use 5 large buttons with icons and labels — ensure 48–64px tap targets.

Exporting from Figma
- Share prototype link via the Figma share button (make it viewable). Paste link in the repo README or provide it to me and I can store it in `DESIGN.md`.

Notes for implementation
- All interactive behaviors are implemented with minimal JS and no external dependencies to keep the repo static-hosting friendly (works with GitHub Pages).
- If you want, I can create a simple Figma file structure and export frames as PNGs to use as hero backgrounds for quick prototyping.
