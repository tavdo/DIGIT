import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_TAGLINE } from '../constants/brand'
import { allServices } from './services'

export const DEFAULT_SITE_CONTENT = {
  heroEyebrow: 'DIGIT · შუამავალი კონტროლი',
  heroTitle: 'შენ არ ეძებ სპეციალისტს.',
  heroTitleAccent: 'შენ იღებ კონტროლს.',
  heroSubtitle:
    'გამოიძახე IT დახმარება ისევე მარტივად, როგორც ტაქსი — მენეჯერი აფასებს, შემსრულებელი მუშაობს, შენ ხედავ ყველაფერს.',
  tagline: SITE_TAGLINE,
  siteDescription: SITE_DESCRIPTION,
  contactPhone: '+995 555 123 456',
  contactEmail: CONTACT_EMAIL,
  workingHours: 'ორშ–პარ, 10:00 – 19:00',
  aboutIntro:
    'DIGIT არის პლატფორმა, სადაც ბიზნესი იღებს IT დახმარებას ერთი მენეჯერის კონტროლით — გამჭვირვალე პროცესით, გადამოწმებული შემსრულებლებით.',
  services: allServices.map(({ id, title, description }) => ({
    id,
    title,
    description,
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
