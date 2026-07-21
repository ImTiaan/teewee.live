import styles from './AnimatedBackground.module.css';

interface AnimatedBackgroundProps {
  variant?: 'green' | 'red';
}

export default function AnimatedBackground({
  variant = 'green',
}: AnimatedBackgroundProps) {
  return (
    <div
      className={`${styles.container} ${variant === 'red' ? styles.redTheme : styles.greenTheme}`}
    >
      <div className={styles.burstWrap}>
        <div className={styles.burst}></div>
      </div>
    </div>
  );
}
