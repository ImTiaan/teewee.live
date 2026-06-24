import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground() {
  return (
    <div className={styles.container}>
      <div className={styles.burstWrap}>
        <div className={styles.burst}></div>
      </div>
    </div>
  );
}
