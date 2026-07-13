import { z } from 'zod';

/** A string that must be provided in both supported locales. */
export const localizedString = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});
export type LocalizedString = z.infer<typeof localizedString>;

const social = z.object({
  label: z.string().min(1),
  url: z.url(),
  icon: z.string().min(1),
});

const skillGroup = z.object({
  category: localizedString,
  items: z.array(z.string().min(1)).min(1),
});

const link = z.object({
  label: z.string().min(1),
  url: z.url(),
});

const project = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: localizedString,
  description: localizedString,
  stack: z.array(z.string().min(1)).min(1),
  role: localizedString,
  highlights: z.array(localizedString).default([]),
  links: z.array(link).default([]),
  image: z.string().min(1),
  featured: z.boolean().default(false),
});

const timelineEntry = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  title: localizedString,
  org: localizedString,
  description: localizedString,
});

const aboutSchema = z.object({
  paragraphs: z.array(localizedString).min(1),
  facts: z.array(z.object({ label: localizedString, value: localizedString })).default([]),
});

export const portfolioSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    role: localizedString,
    tagline: localizedString,
    location: localizedString,
    email: z.email(),
    resumeUrl: z.string().min(1),
  }),
  socials: z.array(social).min(1),
  about: aboutSchema,
  skills: z.array(skillGroup).min(1),
  projects: z.array(project).min(1),
  timeline: z.array(timelineEntry).min(1),
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type Project = z.infer<typeof project>;
export type TimelineEntry = z.infer<typeof timelineEntry>;
export type SkillGroup = z.infer<typeof skillGroup>;
export type Social = z.infer<typeof social>;
export type About = z.infer<typeof aboutSchema>;
