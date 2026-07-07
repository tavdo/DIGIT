export async function updateUserProfile(userId, role, { name, companyName, phone, bio, experienceCategories, experienceYears }) {
  const payload = {
    name: name?.trim() || '',
    companyName: companyName?.trim() || '',
    phone: phone?.trim() || '',
  }

  if (role === 'developer') {
    payload.bio = bio?.trim() || ''
    payload.experienceCategories = experienceCategories || []
    payload.experienceYears = experienceYears || ''
  }

  const token = localStorage.getItem('token')
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'პროფილის განახლება ვერ მოხერხდა.')
  }
}

/** @deprecated use updateUserProfile */
export async function updateDeveloperProfile(userId, fields) {
  return updateUserProfile(userId, 'developer', fields)
}
