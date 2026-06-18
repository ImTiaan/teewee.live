import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground() {
  return (
    <div className={styles.container}>
      <div className={`${styles.aurora} ${styles.auroraOne}`}></div>
      <div className={`${styles.aurora} ${styles.auroraTwo}`}></div>
      <div className={`${styles.aurora} ${styles.auroraThree}`}></div>
      <div className={styles.glow}></div>
      <div className={styles.veil}></div>
    </div>
  );
}
