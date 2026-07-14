import { describe, it, expect } from 'vitest';
import { portfolioSchema } from '@/lib/schema';
import portfolio from '../../content/portfolio.json';

const valid = {
  profile: {
    name: { en: 'Ali Emad', ar: 'علي عماد' },
    role: { en: 'Frontend Engineer', ar: 'مهندس واجهات أمامية' },
    tagline: { en: 'I build fast, beautiful web apps.', ar: 'أبني تطبيقات ويب سريعة وجميلة.' },
    location: { en: 'Egypt', ar: 'مصر' },
    email: 'sonnythedeveloper@gmail.com',
    resumeUrl: '/resume.pdf',
  },
  socials: [{ label: 'GitHub', url: 'https://github.com/AliEmad0', icon: 'github' }],
  about: {
    paragraphs: [{ en: 'A short bio.', ar: 'نبذة قصيرة.' }],
    facts: [{ label: { en: 'Focus', ar: 'التركيز' }, value: { en: 'Frontend', ar: 'الواجهة' } }],
  },
  skills: [
    {
      category: { en: 'Frontend', ar: 'الواجهة الأمامية' },
      items: ['React', 'Next.js', 'TypeScript'],
    },
  ],
  projects: [
    {
      slug: 'pitchiq',
      name: 'PitchIQ',
      summary: { en: 'A Premier League encyclopedia.', ar: 'موسوعة الدوري الإنجليزي.' },
      description: { en: '34 seasons of data.', ar: '٣٤ موسمًا من البيانات.' },
      stack: ['Next.js', 'TypeScript', 'Tailwind'],
      role: { en: 'Solo developer', ar: 'مطوّر منفرد' },
      highlights: [{ en: '1170 tests', ar: '١١٧٠ اختبارًا' }],
      links: [{ label: 'Live', url: 'https://pitchiq-pl.vercel.app' }],
      image: '/projects/pitchiq.png',
      featured: true,
    },
  ],
  timeline: [
    {
      start: '2023',
      end: 'present',
      title: { en: 'Frontend Engineer', ar: 'مهندس واجهات' },
      org: { en: 'Freelance', ar: 'عمل حر' },
      description: { en: 'Building products.', ar: 'بناء المنتجات.' },
    },
  ],
};

describe('portfolioSchema', () => {
  it('accepts a well-formed portfolio', () => {
    expect(() => portfolioSchema.parse(valid)).not.toThrow();
  });

  it('rejects a localized field missing the Arabic variant', () => {
    const bad = structuredClone(valid);
    // @ts-expect-error intentionally break the shape
    bad.profile.role = { en: 'Frontend Engineer' };
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('rejects an invalid email', () => {
    const bad = structuredClone(valid);
    bad.profile.email = 'not-an-email';
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('the committed content/portfolio.json is valid', () => {
    expect(() => portfolioSchema.parse(portfolio)).not.toThrow();
  });
});
