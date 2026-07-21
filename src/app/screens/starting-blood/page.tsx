import type { Metadata } from 'next';

import StreamScreen from '@/components/StreamScreen';

export const metadata: Metadata = {
  title: 'Starting Soon',
};

export default function StartingBloodPage() {
  return <StreamScreen title="Starting Soon" variant="red" />;
}
