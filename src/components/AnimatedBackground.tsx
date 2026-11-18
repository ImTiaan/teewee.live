import styles from './AnimatedBackground.module.css';

interface AnimatedBackgroundProps {
  variant?: 'green' | 'red' | 'gta';
}

export default function AnimatedBackground({
  variant = 'green',
}: AnimatedBackgroundProps) {
  const themeClass =
    variant === 'red'
      ? styles.redTheme
      : variant === 'gta'
        ? styles.gtaTheme
        : styles.greenTheme;

  return (
    <div className={`${styles.container} ${themeClass}`}>
      <div className={styles.burstWrap}>
        <div className={styles.burst}></div>
      </div>
      <div className={styles.glowPulse}></div>
      <div className={styles.horizonGlow}></div>
    </div>
  );
}
