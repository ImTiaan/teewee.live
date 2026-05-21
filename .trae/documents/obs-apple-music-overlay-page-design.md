# Page Design Specification — OBS Apple Music Now Playing Overlay

## Global Styles (desktop-first)
This overlay must match the teewee.live notch/follow overlay styling.

Design tokens
- Canvas: transparent (html/body/viewport backgrounds transparent).
- Stage: fixed 1920×1080 coordinate space; scale to viewport using transform (origin: top centre).
- Glass pill: background rgba(12, 45, 36, 0.82); border 1px solid rgba(255,255,255,0.14); backdrop blur ~16px; drop-shadow 0 16px 28px rgba(0,0,0,0.45).
- Typography: “Block Script” for the primary line; system sans fallback for secondary text.
- Text colour: rgba(255,255,255,0.94) with subtle stroke and soft shadow for readability.
- Motion: smooth ease-out enter/exit; short content fade for text changes.

Responsive behaviour
- Desktop-first layout at 1920×1080.
- Scale factor = min(viewportWidth/1920, viewportHeight/1080); no reflow, only uniform scaling.

---

## Page: Now Playing Overlay

### Layout
A single overlay viewport with an absolute-positioned stage. Inside the stage, render a centred “glass pill” card (or edge-aligned via query param).

### Meta Information
- Title: “Now Playing Overlay”
- Description: “OBS overlay for Apple Music now playing.”
- Open Graph: disabled/omitted (not intended for social sharing).

### Page Structure
- Viewport (100vw/100vh, transparent)
  - Stage (1920×1080, pointer-events none)
    - NowPlayingCard (glass pill)

### Sections & Components
NowPlayingCard (variants)
- Full variant (default)
  - Artwork block (square, masked with rounded corners)
  - Text block
    - Line 1: Track title (Block Script, largest)
    - Line 2: Artist — Album (smaller, system sans)
  - Optional progress line (thin, subtle, only when duration known)
- Compact variant (?mode=compact)
  - Text-only pill using the same typography and spacing.

States
- Playing: show card.
- Paused: show card with reduced opacity and “Paused” suffix (small caps, secondary).
- Stopped / no track: either hide completely (?hideWhenStopped=1 default) or show a small pill “Nothing playing”.

Interaction and updates
- No mouse interaction required in OBS.
- Track changes cross-fade text/artwork; avoid large layout jumps.

Query parameters (overlay configuration)
- mode=full|compact
- align=center|left|right
- x=<number>, y=<number> (stage-space offsets)
- hideWhenStopped=1|0

---

## Page: Overlay Settings

### Layout
A standard desktop settings page with a two-column grid: controls on the left, live preview on the right.

### Meta Information
- Title: “Overlay Settings”
- Description: “Configure Apple Music now playing overlay.”

### Page Structure
- Header (product name + small status badge)
- Main grid
  - Left: Connection + appearance controls
  - Right: Preview frame (embeds /overlay with the current params)

### Sections & Components
Connection panel
- Helper URL input (default http://127.0.0.1:<port>)
- Status row: Connected/Disconnected, last updated timestamp, current state
- Refresh / Reconnect action

Appearance panel
- Mode toggle (compact/full)
- Alignment selector (left/centre/right)
- Offset inputs (x/y)
- Hide-when-stopped toggle

Preview & test
- Preview iframe showing /overlay
- “Send test track” button (client-side mock) to validate styling without Apple Music playing

Accessibility and readability
- Controls use standard UI fonts; overlay preview remains accurate to OBS rendering.
