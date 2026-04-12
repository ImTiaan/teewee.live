import type { Metadata } from 'next';
import NotchOverlay from './NotchOverlay';

export const metadata: Metadata = {
  title: 'Notch Overlay',
};

export default function NotchOverlayPage() {
  return <NotchOverlay />;
}
