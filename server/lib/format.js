export function formatUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

export function formatUsers(users) {
  return users.map(formatUser)
}
