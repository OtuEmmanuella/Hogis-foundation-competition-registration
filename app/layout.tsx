import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-pally',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HOGIS Foundation - Public Speaking Competition 2025',
  description: 'Register for the HOGIS Foundation Public Speaking & Spoken Word Competition 2025: "Raising the Boy Child, Building the Total Man"',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>{children}</body>
    </html>
  );
}