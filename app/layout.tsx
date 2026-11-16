import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clinic Fleet | VK Digital Health',
  description: 'An interactive prototype for activating, monitoring, and supporting VK smart clinic chairs. Prepared by SilverSpace Technologies.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
