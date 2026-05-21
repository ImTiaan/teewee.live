import type { Metadata } from 'next';
import TwitchAlertsOverlay from './TwitchAlertsOverlay';

export const metadata: Metadata = {
  title: 'Twitch Alerts',
};

export default function AlertsPage() {
  return <TwitchAlertsOverlay />;
}
