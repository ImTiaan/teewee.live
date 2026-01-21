import StreamScreen from '@/components/StreamScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ending Soon',
};

export default function EndingSoonPage() {
  return <StreamScreen title="Ending Soon" />;
}
