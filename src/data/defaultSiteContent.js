import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_TAGLINE } from '../constants/brand'
import { allServices } from './services'

export const DEFAULT_SITE_CONTENT = {
  heroEyebrow_ka: 'DIGIT · dispatch desk',
  heroEyebrow_en: 'DIGIT · dispatch desk',
  heroTitle_ka: 'აღწერე პრობლემა.',
  heroTitle_en: 'Describe the problem.',
  heroTitleAccent_ka: 'მენეჯერი გზაშია.',
  heroTitleAccent_en: 'Your manager is on it.',
  heroSubtitle_ka:
    'IT სერვისი ისევე მარტივად, როგორც ტაქსის გამოძახება — ფასი, შემსრულებელი და სტატუსი ერთ ეკრანზე.',
  heroSubtitle_en:
    'IT support as easy as calling a taxi — price, specialist, and status on one screen.',
  tagline_ka: SITE_TAGLINE,
  tagline_en: 'Trusted Services Platform',
  siteDescription_ka: SITE_DESCRIPTION,
  siteDescription_en: 'DIGIT — Trusted services platform. Verified specialists under the control of a single manager.',
  contactPhone: '+995 555 123 456',
  contactEmail: CONTACT_EMAIL,
  workingHours_ka: 'ორშ–პარ, 10:00 – 19:00',
  workingHours_en: 'Mon–Fri, 10:00 – 19:00',
  aboutIntro_ka:
    'DIGIT არის პლატფორმა, სადაც ბიზნესი იღებს IT დახმარებას ერთი მენეჯერის კონტროლით — გამჭვირვალე პროცესით, გადამოწმებული შემსრულებლებით.',
  aboutIntro_en:
    'DIGIT is a platform where businesses get IT support under the control of a single manager — with a transparent process and verified specialists.',
  services: allServices.map(({ id, title_ka, title_en, description_ka, description_en }) => ({
    id,
    title_ka,
    title_en,
    description_ka,
    description_en,
    enabled: true,
  })),
}

export function mergeSiteContent(data) {
  if (!data) return { ...DEFAULT_SITE_CONTENT }

  const serviceMap = new Map((data.services || []).map((service) => [service.id, service]))

  return {
    ...DEFAULT_SITE_CONTENT,
    ...data,
    services: DEFAULT_SITE_CONTENT.services.map((fallback) => ({
      ...fallback,
      ...serviceMap.get(fallback.id),
    })),
  }
}
