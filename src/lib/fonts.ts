import { Sora, IBM_Plex_Sans_Arabic } from 'next/font/google';

export const fontLatin = Sora({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});
