import StreamScreen from '@/components/StreamScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Starting Soon',
};

export default function StartingSoonPage() {
  return <StreamScreen title="Starting Soon" />;
}
