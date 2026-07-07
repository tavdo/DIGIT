export function getAuthErrorMessage(error) {
  return error?.message || 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.'
}

export function validateEmail(email) {
  if (!email.trim()) return 'ელ. ფოსტა სავალდებულოა.'
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) return 'ელ. ფოსტის ფორმატი არასწორია.'
  return null
}

export function validatePassword(password) {
  if (!password) return 'პაროლი სავალდებულოა.'
  if (password.length < 6) return 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.'
  return null
}

export function validateName(name) {
  if (!name.trim()) return 'სახელი სავალდებულოა.'
  if (name.trim().length < 2) return 'სახელი ძალიან მოკლეა.'
  if (name.trim().length > 80) return 'სახელი ძალიან გრძელია (მაქს. 80 სიმბოლო).'
  return null
}

export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) return 'გთხოვთ, დაადასტუროთ პაროლი.'
  if (password !== confirmPassword) return 'პაროლები არ ემთხვევა.'
  return null
}
