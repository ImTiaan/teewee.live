'use client';

import styles from './StreamScreen.module.css';
import AnimatedBackground from './AnimatedBackground';

interface StreamScreenProps {
  title: string;
}

export default function StreamScreen({ title }: StreamScreenProps) {
  return (
    <div className={styles.container}>
        <AnimatedBackground />
        <div className={styles.content}>
            <div className={styles.logoContainer}>
                <img 
                    src="/screens/assets/logo.png" 
                    alt="Stream Logo" 
                    className={styles.logo} 
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextSibling = target.nextElementSibling as HTMLElement;
                        if (nextSibling) nextSibling.style.display = 'flex';
                    }}
                />
                <div className={styles.logoPlaceholder} style={{display: 'none'}}>tw</div>
            </div>
            
            <h1 className={styles.title}>{title}</h1>
            
            <div className={styles.socials}>
                <div className={styles.socialItem}>
                    <img src="https://cdn.simpleicons.org/twitch/white" alt="Twitch" />
                    <span>teeweeTTV</span>
                </div>
                <div className={styles.socialItem}>
                    <img src="https://cdn.simpleicons.org/kick/white" alt="Kick" />
                    <span>itsteewee</span>
                </div>
                <div className={styles.socialItem}>
                    <img src="https://cdn.simpleicons.org/youtube/white" alt="YouTube" />
                    <span>itsteewee</span>
                </div>
                <div className={styles.socialItem}>
                    <img src="https://cdn.simpleicons.org/tiktok/white" alt="TikTok" />
                    <span>teeweeTT</span>
                </div>
                <div className={styles.socialItem}>
                    <img src="https://cdn.simpleicons.org/instagram/white" alt="Instagram" />
                    <span>teeweeIG</span>
                </div>
            </div>
        </div>
    </div>
  );
}
