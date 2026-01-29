import { getStreamStatus, TWITCH_USERNAME, KICK_USERNAME } from '@/lib/streaming';
import AnimatedBackground from '@/components/AnimatedBackground';
import styles from '@/components/StreamScreen.module.css'; // Reusing styles for consistency
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate at least every 60 seconds
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Teewee',
  description: 'Official website for Teewee. Watch live streams, view screens, and connect with the community.',
};

export default async function Home() {
  const status = await getStreamStatus();

  // In production, you need to add your actual domain to the parent query param
  // e.g. parent=teewee.com
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';

  if (status.isLive) {
    return (
      <main className="flex min-h-screen flex-col bg-black text-white h-screen overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          {/* Stream Player */}
          <div className="flex-1 relative h-[50vh] lg:h-auto">
            {status.platform === 'twitch' && (
              <iframe
                src={`https://player.twitch.tv/?channel=${TWITCH_USERNAME}&parent=${domain}&parent=vercel.app`}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
              />
            )}
            {status.platform === 'kick' && (
              <iframe
                src={`https://player.kick.com/${KICK_USERNAME}?autoplay=true`}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
              />
            )}
            {status.platform === 'youtube' && status.id && (
              <iframe
                src={`https://www.youtube.com/embed/${status.id}?autoplay=1`}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
              />
            )}
          </div>
          
          {/* Chat (Desktop only or below) */}
          <div className="w-full lg:w-[350px] h-[50vh] lg:h-auto border-l border-gray-800 bg-zinc-900">
            {status.platform === 'twitch' && (
              <iframe
                src={`https://www.twitch.tv/embed/${TWITCH_USERNAME}/chat?parent=${domain}&parent=vercel.app&darkpopout`}
                className="w-full h-full border-0"
              />
            )}
            {status.platform === 'kick' && (
              <iframe
                src={`https://kick.com/${KICK_USERNAME}/chat-room`}
                className="w-full h-full border-0"
              />
            )}
            {status.platform === 'youtube' && status.id && (
              <iframe
                src={`https://www.youtube.com/live_chat?v=${status.id}&embed_domain=${domain}`}
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      </main>
    );
  }

  // Offline Profile - Matches StreamScreen Visuals
  return (
    <main className={styles.container}>
      <AnimatedBackground />
      
      <div className={styles.content}>
        <div className={styles.logoContainer}>
            <img 
                src="/screens/assets/logo.png" 
                alt="Teewee" 
                className={styles.logo} 
            />
            <div className={styles.logoPlaceholder} style={{display: 'none'}}>tw</div>
        </div>

        <div className="space-y-2">
          <h1 className={styles.title}>Teewee</h1>
          <p className="text-zinc-400 text-lg tracking-widest font-light uppercase opacity-80 px-4 text-center">
            Streamer & Content Creator
          </p>
        </div>

        {/* Unified Social Icons matching OBS screens */}
        <div className={styles.socials}>
            <a href={`https://twitch.tv/${TWITCH_USERNAME}`} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <img src="https://cdn.simpleicons.org/twitch/white" alt="Twitch" />
                <span>teeweeTTV</span>
            </a>
            <a href={`https://kick.com/${KICK_USERNAME}`} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <img src="https://cdn.simpleicons.org/kick/white" alt="Kick" />
                <span>itsteewee</span>
            </a>
            <a href="https://youtube.com/@itsteewee" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <img src="https://cdn.simpleicons.org/youtube/white" alt="YouTube" />
                <span>itsteewee</span>
            </a>
            <a href="https://tiktok.com/@teeweeTT" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <img src="https://cdn.simpleicons.org/tiktok/white" alt="TikTok" />
                <span>teeweeTT</span>
            </a>
            <a href="https://instagram.com/teeweeIG" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                <img src="https://cdn.simpleicons.org/instagram/white" alt="Instagram" />
                <span>teeweeIG</span>
            </a>
        </div>
      </div>

      {/* Games Link - Ghost Pill */}
      <a 
        href="https://games.teewee.live" 
        className={styles.gamesPill}
        target="_blank" 
        rel="noopener noreferrer"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
        <span>Games</span>
      </a>
    </main>
  );
}
