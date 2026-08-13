'use client';

import styles from './WeeteeScreen.module.css';

export default function WeeteePage() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.burstWrap}>
          <div className={styles.burst}></div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.centerStack}>
          <div className={styles.logoContainer}>
            <img
              src="/screens/assets/logo.png"
              alt="Weetee Logo"
              className={styles.logo}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const nextSibling = target.nextElementSibling as HTMLElement;
                if (nextSibling) nextSibling.style.display = 'flex';
              }}
            />
            <div className={styles.logoPlaceholder} style={{ display: 'none' }}>
              wt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
