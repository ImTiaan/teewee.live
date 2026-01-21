export const TWITCH_USERNAME = 'teeweeTTV';

export interface StreamStatus {
  isLive: boolean;
  viewerCount?: number;
  title?: string;
  game?: string;
  startedAt?: string;
}

export async function getTwitchToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Twitch credentials');
    return null;
  }

  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
      method: 'POST',
      cache: 'force-cache',
      next: { revalidate: 3600 } // Cache token for 1 hour
    });

    if (!res.ok) {
      console.error('Failed to fetch Twitch token', await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Twitch token:', error);
    return null;
  }
}

export async function getStreamStatus(): Promise<StreamStatus> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getTwitchToken();

  if (!token || !clientId) {
    return { isLive: false };
  }

  try {
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      console.error('Failed to fetch stream status', await res.text());
      return { isLive: false };
    }

    const data = await res.json();
    const stream = data.data?.[0];

    if (!stream) {
      return { isLive: false };
    }

    return {
      isLive: true,
      viewerCount: stream.viewer_count,
      title: stream.title,
      game: stream.game_name,
      startedAt: stream.started_at,
    };
  } catch (error) {
    console.error('Error fetching stream status:', error);
    return { isLive: false };
  }
}
