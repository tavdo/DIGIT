export function formatUser(user) {
  if (!user) return null
  const rest = { ...user }
  delete rest.password
  return rest
}

export function formatUsers(users) {
  return users.map(formatUser)
}
