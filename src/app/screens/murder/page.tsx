import type { Metadata } from 'next';

import MurderScreen from '@/components/MurderScreen';

export const metadata: Metadata = {
  title: {
    absolute: 'Stand By',
  },
};

export default function MurderPage() {
  return <MurderScreen />;
}
