# Twitch Stream Animation Screens

This folder contains browser-based animation screens for your Twitch stream. They feature a modern, sexy dark green design with your "Block Script" font and social media links.

## Available Screens

You can use these URLs in your browser or OBS:

*   **Starting Soon**: [starting-soon.html](starting-soon.html)
*   **Be Right Back**: [be-right-back.html](be-right-back.html)
*   **Ending Soon**: [ending-soon.html](ending-soon.html)

*(You can also use `index.html` which is currently set to "Starting Soon")*

## Setup

1.  **Logo**: Ensure your logo is at `assets/logo.png`.
2.  **Font**: Ensure your font file is at `assets/Block Script.otf`.

## How to use in OBS

1.  Add a **Browser Source** in OBS.
2.  Check "Local File".
3.  Browse and select the specific file you want (e.g., `be-right-back.html`).
4.  Set Width to `1920` and Height to `1080`.
5.  Check "Shutdown source when not visible" and "Refresh browser when scene becomes active" to restart the animation on scene switch.
