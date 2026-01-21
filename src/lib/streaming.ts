export const TWITCH_USERNAME = 'teeweeTTV';
export const KICK_USERNAME = 'itsteewee';
export const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCW7jgjUMB4C_2Q7sFvig9IQ';

export interface StreamStatus {
  isLive: boolean;
  platform: 'twitch' | 'kick' | 'youtube' | 'offline';
  id?: string; // Video ID for YouTube
  viewerCount?: number;
  title?: string;
  game?: string;
  startedAt?: string;
  thumbnailUrl?: string;
}

// --- Twitch ---

async function getTwitchToken(): Promise<string | null> {
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

async function getTwitchStatus(): Promise<StreamStatus | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getTwitchToken();

  if (!clientId || !token) return null;

  try {
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    const stream = data.data?.[0];

    if (stream) {
      return {
        isLive: true,
        platform: 'twitch',
        viewerCount: stream.viewer_count,
        title: stream.title,
        game: stream.game_name,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url?.replace('{width}', '1280').replace('{height}', '720'),
      };
    }
  } catch (error) {
    console.error('Error checking Twitch status:', error);
  }
  return null;
}

// --- Kick ---

async function getKickStatus(): Promise<StreamStatus | null> {
  try {
    // Note: Kick API is unofficial and protected by Cloudflare. 
    // This might fail in Vercel serverless environment.
    // Using v1 endpoint which is sometimes more lenient, or v2.
    const res = await fetch(`https://kick.com/api/v2/channels/${KICK_USERNAME}`, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return null;

    const data = await res.json();
    
    if (data && data.livestream) {
      return {
        isLive: true,
        platform: 'kick',
        viewerCount: data.livestream.viewer_count,
        title: data.livestream.session_title,
        game: data.livestream.categories?.[0]?.name,
        startedAt: data.livestream.created_at,
        thumbnailUrl: data.livestream.thumbnail?.url,
      };
    }
  } catch (error) {
    // Kick API often fails due to bot protection, suppress error to avoid log noise
    // console.error('Error checking Kick status:', error);
  }
  return null;
}

// --- YouTube ---

async function getYouTubeStatus(): Promise<StreamStatus | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];

    if (item) {
      return {
        isLive: true,
        platform: 'youtube',
        id: item.id?.videoId,
        title: item.snippet.title,
        startedAt: item.snippet.publishTime,
        thumbnailUrl: item.snippet.thumbnails?.high?.url,
        // YouTube API doesn't return viewer count in search results, requires separate video details call
      };
    }
  } catch (error) {
    console.error('Error checking YouTube status:', error);
  }
  return null;
}

// --- Unified ---

export async function getStreamStatus(): Promise<StreamStatus> {
  // Check all platforms in parallel
  const [twitch, kick, youtube] = await Promise.all([
    getTwitchStatus(),
    getKickStatus(),
    getYouTubeStatus()
  ]);

  // Priority: Twitch > Kick > YouTube
  if (twitch?.isLive) return twitch;
  if (kick?.isLive) return kick;
  if (youtube?.isLive) return youtube;

  return {
    isLive: false,
    platform: 'offline'
  };
}
