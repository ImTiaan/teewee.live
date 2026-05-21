'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TwitchAlertsOverlay.module.css';

type AlertType = 'follow' | 'bits' | 'subscribed' | 'prime-sub' | 'gifted-subs';

type AlertPayload = {
  type: AlertType;
  username: string;
  amount?: number;
  avatarUrl?: string;
};

type AlertMeta = {
  badge: string;
  title: string;
  subtitle: string;
  centerValue: string;
  accentClassName: string;
};

type OverlayConfig = {
  debug: boolean;
  triggerOnLoad: boolean;
  initialPayload: AlertPayload;
};

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const ALERT_DURATION_MS = 5800;
const QUEUE_GAP_MS = 280;

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  follow: 'Follow',
  bits: 'Bits',
  subscribed: 'Subscribed',
  'prime-sub': 'Prime Sub',
  'gifted-subs': 'Gifted Subs',
};

const DEFAULT_PAYLOADS: Record<AlertType, AlertPayload> = {
  follow: {
    type: 'follow',
    username: 'Bobby',
  },
  bits: {
    type: 'bits',
    username: 'Bobby',
    amount: 500,
  },
  subscribed: {
    type: 'subscribed',
    username: 'Bobby',
  },
  'prime-sub': {
    type: 'prime-sub',
    username: 'Bobby',
  },
  'gifted-subs': {
    type: 'gifted-subs',
    username: 'Bobby',
    amount: 5,
  },
};

function sanitiseAlertType(value: string | null): AlertType {
  if (value === 'follow' || value === 'bits' || value === 'subscribed' || value === 'prime-sub' || value === 'gifted-subs') {
    return value;
  }

  return 'gifted-subs';
}

function buildPayloadFromParams(params: URLSearchParams): AlertPayload {
  const type = sanitiseAlertType(params.get('type'));
  const defaultPayload = DEFAULT_PAYLOADS[type];
  const username = params.get('user')?.trim() || defaultPayload.username;
  const amountFromParams = Number(params.get('amount'));
  const amount = Number.isFinite(amountFromParams) && amountFromParams > 0 ? Math.floor(amountFromParams) : defaultPayload.amount;
  const avatarUrl = params.get('avatar')?.trim() || undefined;

  return {
    type,
    username,
    amount,
    avatarUrl,
  };
}

function getAlertMeta(payload: AlertPayload): AlertMeta {
  switch (payload.type) {
    case 'follow':
      return {
        badge: 'New Follow',
        title: `${payload.username} just followed`,
        subtitle: 'Welcome to the stream',
        centerValue: 'TW',
        accentClassName: styles.followAccent,
      };
    case 'bits':
      return {
        badge: 'Bits',
        title: `${payload.username} cheered ${payload.amount ?? 100} bits`,
        subtitle: 'That is massively appreciated',
        centerValue: String(payload.amount ?? 100),
        accentClassName: styles.bitsAccent,
      };
    case 'subscribed':
      return {
        badge: 'New Sub',
        title: `${payload.username} just subscribed`,
        subtitle: 'Welcome to the club',
        centerValue: 'SUB',
        accentClassName: styles.subscribedAccent,
      };
    case 'prime-sub':
      return {
        badge: 'Prime Sub',
        title: `${payload.username} subscribed with Prime`,
        subtitle: 'Prime power activated',
        centerValue: 'PRM',
        accentClassName: styles.primeAccent,
      };
    case 'gifted-subs':
      return {
        badge: 'Gifted Subs',
        title: `${payload.username} gifted ${payload.amount ?? 1} subs`,
        subtitle: 'Absolute legend behaviour',
        centerValue: `+${payload.amount ?? 1}`,
        accentClassName: styles.giftedAccent,
      };
  }
}

function readConfig(): OverlayConfig {
  if (typeof window === 'undefined') {
    return {
      debug: false,
      triggerOnLoad: false,
      initialPayload: DEFAULT_PAYLOADS['gifted-subs'],
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    debug: params.get('debug') === '1',
    triggerOnLoad: params.get('trigger') === '1',
    initialPayload: buildPayloadFromParams(params),
  };
}

export default function TwitchAlertsOverlay() {
  const [config, setConfig] = useState<OverlayConfig>({
    debug: false,
    triggerOnLoad: false,
    initialPayload: DEFAULT_PAYLOADS['gifted-subs'],
  });

  const [scale, setScale] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [cycleId, setCycleId] = useState(0);
  const [activePayload, setActivePayload] = useState<AlertPayload>(config.initialPayload);

  const isActiveRef = useRef(false);
  const queueRef = useRef<AlertPayload[]>([]);
  const nextPayloadRef = useRef<AlertPayload | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);
  const queueGapTimeoutRef = useRef<number | null>(null);
  const triggerAlertRef = useRef<(payload?: Partial<AlertPayload>) => void>(() => undefined);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setConfig(readConfig());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
    const clearTimers = () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }

      if (queueGapTimeoutRef.current !== null) {
        window.clearTimeout(queueGapTimeoutRef.current);
        queueGapTimeoutRef.current = null;
      }
    };

    const playNextQueuedAlert = () => {
      const nextAlert = queueRef.current.shift();
      if (!nextAlert) return;

      queueGapTimeoutRef.current = window.setTimeout(() => {
        startAlert(nextAlert);
      }, QUEUE_GAP_MS);
    };

    const startAlert = (payload: AlertPayload) => {
      nextPayloadRef.current = payload;

      if (isActiveRef.current) {
        queueRef.current.push(payload);
        return;
      }

      isActiveRef.current = true;
      setActivePayload(payload);
      setCycleId((previous) => previous + 1);
      setIsActive(true);

      alertTimeoutRef.current = window.setTimeout(() => {
        setIsActive(false);
        isActiveRef.current = false;
        playNextQueuedAlert();
      }, ALERT_DURATION_MS);
    };

    triggerAlertRef.current = (payloadOverrides = {}) => {
      const incomingType = payloadOverrides.type ?? nextPayloadRef.current?.type ?? config.initialPayload.type;
      const safeType = sanitiseAlertType(incomingType);
      const defaultPayload = DEFAULT_PAYLOADS[safeType];

      startAlert({
        type: safeType,
        username: payloadOverrides.username?.trim() || defaultPayload.username,
        amount: payloadOverrides.amount ?? defaultPayload.amount,
        avatarUrl: payloadOverrides.avatarUrl || undefined,
      });
    };

    if (config.triggerOnLoad) {
      triggerAlertRef.current(config.initialPayload);
    }

    return () => {
      clearTimers();
      queueRef.current = [];
    };
  }, [config.initialPayload, config.triggerOnLoad]);

  useEffect(() => {
    const trigger = (payloadOverrides?: Partial<AlertPayload>) => triggerAlertRef.current(payloadOverrides);

    (
      window as typeof window & {
        triggerTwitchAlert?: (payloadOverrides?: Partial<AlertPayload>) => void;
      }
    ).triggerTwitchAlert = trigger;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as unknown;
      if (typeof data !== 'object' || data === null) return;
      if (!('type' in data)) return;

      const eventType = (data as { type?: unknown }).type;
      if (eventType !== 'TEEWEE_TWITCH_ALERT') return;

      const payload = data as {
        alert?: Partial<AlertPayload>;
      };

      trigger(payload.alert);
    };

    window.addEventListener('message', onMessage);

    return () => {
      delete (
        window as typeof window & {
          triggerTwitchAlert?: (payloadOverrides?: Partial<AlertPayload>) => void;
        }
      ).triggerTwitchAlert;
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const meta = getAlertMeta(activePayload);
  const avatarFallback = activePayload.username.slice(0, 2).toUpperCase();

  return (
    <div className={styles.viewport}>
      <div
        className={styles.stage}
        style={{
          transform: `translate(-50%, 0) scale(${scale})`,
        }}
      >
        <div className={`${styles.alertScene} ${isActive ? styles.alertSceneActive : ''}`}>
          <div className={`${styles.backgroundGlow} ${meta.accentClassName}`} />
          <div className={`${styles.rayField} ${meta.accentClassName}`} />

          <div className={styles.centerCluster}>
            <div className={`${styles.ringHalo} ${meta.accentClassName}`} />
            <div className={`${styles.coreShell} ${meta.accentClassName}`} />
            <div className={styles.contentWrap}>
              <div key={`${cycleId}-${activePayload.type}`} className={styles.contentInner}>
                <div className={styles.kickerRow}>
                  <span className={styles.kicker}>Twitch {meta.badge}</span>
                </div>

                <div className={styles.coreCard}>
                  <div className={`${styles.avatarFrame} ${meta.accentClassName}`}>
                    {activePayload.avatarUrl ? (
                      <img className={styles.avatarImage} src={activePayload.avatarUrl} alt={activePayload.username} />
                    ) : (
                      <span className={styles.avatarFallback}>{avatarFallback}</span>
                    )}
                  </div>

                  <div className={`${styles.centerBadge} ${meta.accentClassName}`}>
                    <span>{meta.centerValue}</span>
                  </div>
                </div>

                <h1 className={styles.headline}>{meta.title}</h1>
                <p className={styles.subtitle}>{meta.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {config.debug ? (
        <div className={styles.debugPanel}>
          {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((type) => {
            const payload = DEFAULT_PAYLOADS[type];

            return (
              <button
                key={type}
                className={styles.debugButton}
                type="button"
                onClick={() => triggerAlertRef.current(payload)}
              >
                {ALERT_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
