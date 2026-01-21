# Project Plan: Teewee Streaming Profile & Tools

This plan outlines the architecture for converting your current static screens into a full dynamic streaming profile site hosted on your custom domain, integrated with ShareX and Twitch.

## 1. Architecture Overview

*   **Framework**: [Next.js](https://nextjs.org/) (React framework).
    *   *Why*: Required for the backend logic (Twitch API check, ShareX upload handling) while maintaining fast static pages.
*   **Hosting**: [Vercel](https://vercel.com/).
    *   *Why*: Best-in-class Next.js support, zero-config deployment, and built-in Blob Storage.
*   **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).
    *   *Why*: Simple SDK, fast global CDN, and easy integration for image hosting.
*   **Domain**: Your custom domain (e.g., `teewee.live`).

---

## 2. Features & Implementation Details

### A. Public Profile Site (`/`)
*   **Dynamic "Live" Status**:
    *   The site will automatically check if you are live on Twitch using the **Twitch Helix API**.
    *   **If Live**: The homepage transforms to show your stream embed (or a "Watch Now" button) and chat.
    *   **If Offline**: Displays your social links, recent VODs/Clips (optional), and a "Offline" bio.
*   **Tech Stack**: Server-side Twitch API check with caching (to prevent rate limits).

### B. ShareX Integration (Custom Image Host)
*   **Goal**: You take a screenshot with ShareX, it uploads to your site, and copies a clean URL like `teewee.live/s/image.png` to your clipboard.
*   **Workflow**:
    1.  **ShareX** sends a `POST` request to `https://teewee.live/api/upload`.
    2.  **Next.js API** verifies a secret password (header) to prevent unauthorized uploads.
    3.  **Server** uploads the file to **Vercel Blob**.
    4.  **Server** returns the clean URL to ShareX.
*   **Clean URLs**: We will use Next.js Rewrites to map a clean path (e.g., `/s/filename`) to the actual long Vercel Blob URL, keeping your domain branding front and center.

### C. Existing Stream Screens
*   **Location**: Your current `starting-soon.html`, `brb.html`, etc., will be moved to the `public/screens/` folder.
*   **Access**:
    *   **OBS (Local)**: You can still load them as local files if you keep the folder on your PC.
    *   **OBS (URL)**: You can load them via `https://teewee.live/screens/starting-soon.html`.
*   **Benefit**: No code changes needed for them; they just live inside the new project structure.

---

## 3. Migration Steps (No Code Yet - Just Plan)

1.  **Initialize Next.js Project**: Create a new app structure.
2.  **Move Assets**:
    *   Move existing `.html`, `.css`, `.js` files to `public/screens/`.
    *   Move `assets/` (images/fonts) to `public/assets/`.
3.  **Setup Vercel**:
    *   Connect GitHub repo to Vercel.
    *   Add Domain.
    *   Enable Vercel Blob Storage.
4.  **Develop API Routes**:
    *   Create `app/api/upload/route.ts` for ShareX.
    *   Create `app/api/live/route.ts` (or Server Action) for Twitch status.
5.  **Configure ShareX**:
    *   Generate a custom `.sxcu` configuration file for you to import into ShareX.

## 4. Required Accounts/Keys

To proceed, you will eventually need:
1.  **Vercel Account**: For hosting and storage.
2.  **Twitch Developer App**:
    *   We need a `Client ID` and `Client Secret` to check your live status via API.
    *   *I can guide you on how to get these.*

## 5. Next Steps

When you are ready, say the word and I will:
1.  **Scaffold the Next.js application** in this directory.
2.  **Move your existing files** to their new correct locations.
3.  **Write the code** for the ShareX uploader and Twitch API check.
