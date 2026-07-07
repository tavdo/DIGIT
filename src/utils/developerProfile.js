import { getServiceById, popularServices } from '../data/services'

export const EXPERIENCE_YEAR_OPTIONS = [
  { value: '0-1', label: '1 წელზე ნაკლები' },
  { value: '1-3', label: '1–3 წელი' },
  { value: '3-5', label: '3–5 წელი' },
  { value: '5+', label: '5+ წელი' },
]

export const selectableExperienceCategories = popularServices

export function formatExperienceYears(value, t) {
  if (!value) return '—'
  if (t) {
    const key = `cv.years_${value}`
    const translated = t(key)
    if (translated && translated !== key) {
      return translated
    }
  }
  return EXPERIENCE_YEAR_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function formatExperienceCategories(categoryIds, tObject) {
  if (!categoryIds?.length) return '—'
  return categoryIds
    .map((id) => {
      const service = getServiceById(id)
      if (service) {
        return tObject ? tObject(service, 'title') : (service.title_ka || service.title || id)
      }
      return id
    })
    .join(', ')
}

export function validateDeveloperCv({ bio, experienceCategories, experienceYears }) {
  const errors = {}

  if (!bio?.trim()) {
    errors.bio = 'შეავსე პროფილის აღწერა.'
  } else if (bio.trim().length < 20) {
    errors.bio = 'აღწერა უნდა იყოს მინიმუმ 20 სიმბოლო.'
  }

  if (!experienceCategories?.length) {
    errors.experienceCategories = 'აირჩიე მინიმუმ ერთი გამოცდილების კატეგორია.'
  }

  if (!experienceYears) {
    errors.experienceYears = 'მიუთითე გამოცდილების ხანგრძლივობა.'
  }

  return errors
}
