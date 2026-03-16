import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediPredict AI - Early Disease Prediction',
  description: 'AI-powered early disease prediction system for diabetes and heart disease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.className} bg-slate-50 text-slate-900 antialiased`}>{children}</body>
    </html>
  );
}
