import type { Metadata } from 'next';

import StreamScreen from '@/components/StreamScreen';

export const metadata: Metadata = {
  title: 'Starting Soon',
};

export default function StartingGtaPage() {
  return <StreamScreen title="Starting Soon" variant="gta" />;
}
