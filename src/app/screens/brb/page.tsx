import StreamScreen from '@/components/StreamScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Be Right Back',
};

export default function BrbPage() {
  return <StreamScreen title="Be Right Back" />;
}
