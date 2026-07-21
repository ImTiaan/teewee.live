'use client';

import AnimatedBackground from './AnimatedBackground';
import styles from './MurderScreen.module.css';

export default function MurderScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.spinnerLayer} aria-hidden="true">
          <AnimatedBackground variant="red" />
        </div>
        <div className={styles.redWash} aria-hidden="true" />
        <div className={styles.smokeLayer} aria-hidden="true" />
        <div className={styles.lightSweep} aria-hidden="true" />
        <div className={styles.grainLayer} aria-hidden="true" />
        <div className={styles.edgeFalloff} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.flashLayer} aria-hidden="true" />
      </div>
      <div className={styles.content} aria-hidden="true" />
    </div>
  );
}
