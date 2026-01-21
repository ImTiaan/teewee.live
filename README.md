# Teewee Streaming Profile & Tools

This is your custom Next.js application that powers your streaming brand.

## Features

1.  **Dynamic Profile**: 
    - Automatically detects if you are **LIVE** on Twitch.
    - **Live Mode**: Shows your stream and chat.
    - **Offline Mode**: Shows your bio and social links.
2.  **ShareX Uploader**:
    - Upload screenshots directly to your domain (e.g., `teewee.live/image.png`).
    - Powered by Vercel Blob.
3.  **OBS Screens**:
    - Your existing animation screens are hosted at `/screens/`.
    - Access them via: `https://teewee.live/screens/index.html`

## Setup Guide

### 1. Vercel Deployment
1.  Push this code to GitHub.
2.  Import the project into Vercel.
3.  Add the **Vercel Blob** storage integration (Storage tab -> Create Database -> Blob).

### 2. Environment Variables
Go to Vercel Project Settings -> Environment Variables and add:

```bash
# Twitch API (Get these from dev.twitch.tv)
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# ShareX Security (Generate a random password)
UPLOAD_SECRET=...

# Domain (For embeds)
NEXT_PUBLIC_DOMAIN=teewee.live
```

### 3. ShareX Configuration
1.  Download the config file from your site: `https://teewee.live/sharex-config.sxcu` (or find it in `public/sharex-config.sxcu`).
2.  Open it in a text editor.
3.  Replace `REPLACE_WITH_YOUR_UPLOAD_SECRET` with the `UPLOAD_SECRET` you set in Vercel.
4.  Double click the file to import into ShareX.

## Local Development

```bash
npm install
npm run dev
```

## OBS Screens
Your OBS screens are located in `public/screens/`.
- **Main Screen**: `public/screens/index.html`
- **Starting Soon**: `public/screens/starting-soon.html`
- **BRB**: `public/screens/be-right-back.html`
- **Ending**: `public/screens/ending-soon.html`
