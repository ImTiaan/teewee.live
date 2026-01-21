import { getStreamStatus, TWITCH_USERNAME } from '@/lib/twitch';

export const revalidate = 60; // Revalidate at least every 60 seconds

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
            <iframe
              src={`https://player.twitch.tv/?channel=${TWITCH_USERNAME}&parent=${domain}&parent=vercel.app`}
              className="w-full h-full absolute inset-0 border-0"
              allowFullScreen
            />
          </div>
          
          {/* Chat (Desktop only or below) */}
          <div className="w-full lg:w-[350px] h-[50vh] lg:h-auto border-l border-gray-800 bg-zinc-900">
            <iframe
              src={`https://www.twitch.tv/embed/${TWITCH_USERNAME}/chat?parent=${domain}&parent=vercel.app&darkpopout`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </main>
    );
  }

  // Offline Profile
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-50 z-0 pointer-events-none" />

      <div className="z-10 flex flex-col items-center space-y-8 max-w-md w-full text-center">
        {/* Avatar/Logo Placeholder */}
        <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 shadow-xl overflow-hidden">
             <img src="/screens/assets/logo.png" alt="Teewee" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Teewee
          </h1>
          <p className="text-zinc-400 text-lg">
            Streamer & Content Creator
          </p>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 gap-4 w-full">
            <SocialLink href={`https://twitch.tv/${TWITCH_USERNAME}`} label="Twitch" icon="twitch" color="hover:bg-[#9146FF]" />
            <SocialLink href="https://kick.com/itsteewee" label="Kick" icon="kick" color="hover:bg-[#53FC18] hover:text-black" />
            <SocialLink href="https://youtube.com/@itsteewee" label="YouTube" icon="youtube" color="hover:bg-[#FF0000]" />
            <SocialLink href="https://tiktok.com/@teeweeTT" label="TikTok" icon="tiktok" color="hover:bg-[#00F2EA]" />
            <SocialLink href="https://instagram.com/teeweeIG" label="Instagram" icon="instagram" color="hover:bg-[#E1306C]" />
        </div>

        <div className="pt-8">
            <a 
                href="/screens/index.html" 
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
                View OBS Screens
            </a>
        </div>
      </div>
    </main>
  );
}

function SocialLink({ href, label, icon, color }: { href: string, label: string, icon: string, color: string }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-full px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 transform hover:scale-105 hover:border-transparent ${color} group`}
        >
            <span className="font-medium tracking-wide group-hover:font-bold">{label}</span>
        </a>
    )
}
