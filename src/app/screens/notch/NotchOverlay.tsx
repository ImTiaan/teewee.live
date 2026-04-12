'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './NotchOverlay.module.css';

type NotchMessage = {
  id: string;
  iconUrl: string;
  iconAlt: string;
  text: string;
};

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

const NOTCH_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_DELAY_MS = 2500;
const MESSAGE_DURATION_MS = 3000;
const NOTCH_EXIT_GRACE_MS = 250;

export default function NotchOverlay() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isDebug = searchParams?.get('debug') === '1';
  const triggerOnLoad = searchParams?.get('trigger') === '1';

  const messages = useMemo<NotchMessage[]>(
    () => [
      {
        id: 'twitch',
        iconUrl: 'https://cdn.simpleicons.org/twitch/white',
        iconAlt: 'Twitch',
        text: 'Follow on Twitch',
      },
      {
        id: 'kick',
        iconUrl: 'https://cdn.simpleicons.org/kick/white',
        iconAlt: 'Kick',
        text: 'Follow on Kick',
      },
      {
        id: 'youtube',
        iconUrl: 'https://cdn.simpleicons.org/youtube/white',
        iconAlt: 'YouTube',
        text: 'Subscribe on YouTube',
      },
    ],
    [],
  );

  const [isActive, setIsActive] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [cycleId, setCycleId] = useState(0);

  const isActiveRef = useRef(false);
  const messageIntervalRef = useRef<number | null>(null);
  const messageEndTimeoutRef = useRef<number | null>(null);
  const notchScheduleTimeoutRef = useRef<number | null>(null);
  const runNotchCycleRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
      setScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const clearMessageTimers = () => {
      if (messageIntervalRef.current !== null) {
        window.clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
      if (messageEndTimeoutRef.current !== null) {
        window.clearTimeout(messageEndTimeoutRef.current);
        messageEndTimeoutRef.current = null;
      }
    };

    const runNotchCycle = () => {
      if (isActiveRef.current) return;

      isActiveRef.current = true;
      setIsActive(true);
      setCycleId((prev) => prev + 1);
      setMessageIndex(0);

      let localIndex = 0;
      messageIntervalRef.current = window.setInterval(() => {
        localIndex += 1;
        if (localIndex >= messages.length) return;
        setMessageIndex(localIndex);
      }, MESSAGE_DURATION_MS);

      const totalMs = MESSAGE_DURATION_MS * messages.length + NOTCH_EXIT_GRACE_MS;
      messageEndTimeoutRef.current = window.setTimeout(() => {
        clearMessageTimers();
        setIsActive(false);
        isActiveRef.current = false;
      }, totalMs);
    };

    runNotchCycleRef.current = runNotchCycle;

    const scheduleNext = (delayMs: number) => {
      notchScheduleTimeoutRef.current = window.setTimeout(() => {
        runNotchCycle();
        scheduleNext(NOTCH_INTERVAL_MS);
      }, delayMs);
    };

    scheduleNext(triggerOnLoad ? 0 : INITIAL_DELAY_MS);

    return () => {
      if (notchScheduleTimeoutRef.current !== null) {
        window.clearTimeout(notchScheduleTimeoutRef.current);
        notchScheduleTimeoutRef.current = null;
      }
      clearMessageTimers();
    };
  }, [messages, triggerOnLoad]);

  useEffect(() => {
    const trigger = () => runNotchCycleRef.current();

    (window as unknown as { triggerNotchOverlay?: () => void }).triggerNotchOverlay = trigger;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as unknown;
      if (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        (data as { type?: unknown }).type === 'TEEWE_NOTCH_TRIGGER'
      ) {
        trigger();
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      delete (window as unknown as { triggerNotchOverlay?: () => void }).triggerNotchOverlay;
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const message = messages[messageIndex] ?? messages[messages.length - 1];

  return (
    <div className={styles.viewport}>
      <div
        className={styles.stage}
        style={{
          transform: `translate(-50%, 0) scale(${scale})`,
        }}
      >
        <div className={`${styles.notch} ${isActive ? styles.notchActive : ''}`}>
          <div className={styles.notchInner}>
            <div key={`${cycleId}-${message.id}-${messageIndex}`} className={styles.message}>
              <img className={styles.icon} src={message.iconUrl} alt={message.iconAlt} />
              <span className={styles.text}>{message.text}</span>
            </div>
          </div>
        </div>
      </div>
      {isDebug ? (
        <div className={styles.debugPanel}>
          <button className={styles.debugButton} type="button" onClick={() => runNotchCycleRef.current()}>
            Trigger Notch
          </button>
        </div>
      ) : null}
    </div>
  );
}
