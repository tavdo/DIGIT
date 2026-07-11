import jwt from 'jsonwebtoken'
import prisma from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'digit_secret_pass_123'

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided.' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) {
      return res.status(401).json({ message: 'User profile not found.' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid token.' })
  }
}
