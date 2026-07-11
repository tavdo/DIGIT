import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

import prisma from './db.js'
import { authMiddleware } from './middleware/auth.js'
import { formatUser, formatUsers } from './lib/format.js'
import { pickOrderPatchData, pickSignupData, pickUserPatchData } from './lib/patchData.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'digit_secret_pass_123'

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// Multer Storage Configuration
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storageConfig })

// Default site content fallback
const DEFAULT_SITE_CONTENT = {
  heroEyebrow_ka: 'DIGIT · შუამავალი კონტროლი',
  heroEyebrow_en: 'DIGIT · Intermediary Control',
  heroTitle_ka: 'შენ არ ეძებ სპეციალისტს.',
  heroTitle_en: 'You do not search for a specialist.',
  heroTitleAccent_ka: 'შენ იღებ კონტროლს.',
  heroTitleAccent_en: 'You take control.',
  heroSubtitle_ka: 'გამოიძახე IT დახმარება ისევე მარტივად, როგორც ტაქსის გამოძახება — მენეჯერი ადგენს ფასს, შემსრულებელი მუშაობს, შენ ხედავ ყველაფერს.',
  heroSubtitle_en: 'Call for IT support as easily as a taxi — manager estimates, specialist works, you see everything.',
  tagline_ka: 'სანდო სერვისების პლატფორმა',
  tagline_en: 'Trusted Services Platform',
  siteDescription_ka: 'DIGIT — სანდო სერვისების პლატფორმა. გამოცდილი სპეციალისტები ერთი მენეჯერის კონტროლის ქვეშ.',
  siteDescription_en: 'DIGIT — Trusted services platform. Verified specialists under the control of a single manager.',
  contactPhone: '+995 555 123 456',
  contactEmail: 'temotavdgiridze@gmail.com',
  workingHours_ka: 'ორშ–პარ, 10:00 – 19:00',
  workingHours_en: 'Mon–Fri, 10:00 – 19:00',
  aboutIntro_ka: 'DIGIT არის პლატფორმა, სადაც ბიზნესი იღებს IT დახმარებას ერთი მენეჯერის კონტროლით — გამჭვირვალე პროცესით, გადამოწმებული შემსრულებლებით.',
  aboutIntro_en: 'DIGIT is a platform where businesses get IT support under the control of a single manager — with a transparent process and verified specialists.',
  services: [
    { id: 'computer-repair', title_ka: 'კომპიუტერის/ტექნიკის შეკეთება', title_en: 'Computer & Hardware Repair', description_ka: 'ლეპტოპების, დესკტოპ კომპიუტერების და სხვა ტექნიკის დიაგნოსტიკა, შეკეთება და აღდგენა.', description_en: 'Diagnostics, repair and recovery of hardware.', enabled: true },
    { id: 'website', title_ka: 'ვებსაიტის დამზადება', title_en: 'Website Development', description_ka: 'კორპორატიული, პორტფოლიო და ელ-კომერციის ვებსაიტების შექმნა.', description_en: 'Creation of corporate, portfolio and e-commerce websites.', enabled: true },
    { id: 'technical-consultation', title_ka: 'ტექნიკური კონსულტაცია', title_en: 'Technical Consultation', description_ka: 'ტექნოლოგიური გადაწყვეტილებების შერჩევაში დახმარება.', description_en: 'Assistance in choosing technology solutions.', enabled: true },
    { id: 'it-support-business', title_ka: 'IT მხარდაჭერა ბიზნესისთვის', title_en: 'IT Support for Business', description_ka: 'ოფისის IT ინფრასტრუქტურის მოვლა, სერვერების მართვა.', description_en: 'Maintenance of office IT infrastructure.', enabled: true },
    { id: 'gadget-repair', title_ka: 'სმარტფონის/გაჯეტის შეკეთება', title_en: 'Smartphone & Gadget Repair', description_ka: 'ტელეფონების, ტაბლეტების და სხვა გაჯეტების ეკრანის, ელემენტის შეკეთება.', description_en: 'Repair of screens and batteries.', enabled: true },
    { id: 'custom', title_ka: 'სხვა', title_en: 'Other', description_ka: 'ვერ იპოვეთ ის, რასაც ეძებდით? დაგვიკავშირდით.', description_en: 'Did not find what you were looking for? Contact us.', enabled: true }
  ]
}

// ---------------- API ROUTES ----------------

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role, ...extra } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'ფოსტა უკვე გამოყენებულია.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRole = role || 'customer'
    const developerRequestStatus = userRole === 'developer' ? 'pending' : 'none'

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        developerRequestStatus,
        ...pickSignupData({ ...extra, role: userRole }),
        ...(userRole === 'developer' ? { ratingAvg: 0, ratingCount: 0, ratingSum: 0 } : {})
      }
    })

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user: formatUser(user), token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'ელ.ფოსტა ან პაროლი არასწორია.' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'ელ.ფოსტა ან პაროლი არასწორია.' })
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: formatUser(user), token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json(formatUser(req.user))
})

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name } = req.body
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || 'მომხმარებელი',
          role: 'customer',
          developerRequestStatus: 'none'
        }
      })
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: formatUser(user), token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// User Routes
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const { role, developerRequestStatus } = req.query
    const where = {}
    if (role) where.role = role
    if (developerRequestStatus) where.developerRequestStatus = developerRequestStatus

    const list = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    res.json(formatUsers(list))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.userId } })
    if (!existing) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' })

    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: pickUserPatchData(req.body)
    })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Orders/Tickets Routes
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { customerId, customerName, serviceId, serviceType, description, priority, managerId: bodyManagerId, managerName: bodyManagerName } = req.body

    let managerId = bodyManagerId || null
    let managerName = bodyManagerName || null
    if (!managerId) {
      const siteContent = await prisma.siteContent.findUnique({ where: { docId: 'default' } })
      const content = siteContent?.content
      const services = content && typeof content === 'object' && !Array.isArray(content) ? content.services : null
      if (Array.isArray(services)) {
        const srv = services.find(s => s.id === serviceId)
        if (srv?.managerId) {
          managerId = srv.managerId
          managerName = srv.managerName
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        customerName,
        managerId,
        managerName,
        serviceId,
        serviceType,
        description,
        priority,
        status: 'new'
      }
    })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { customerId, assignedDeveloperId } = req.query
    const where = {}
    if (customerId) where.customerId = customerId
    if (assignedDeveloperId) where.assignedDeveloperId = assignedDeveloperId

    const ordersList = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    res.json(ordersList)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.orderId } })
    if (!order) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const { status, managerId } = req.body
    const prevOrder = await prisma.order.findUnique({ where: { id: req.params.orderId } })
    if (!prevOrder) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })

    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: pickOrderPatchData(req.body)
    })

    if (status === 'completed' && prevOrder.status !== 'completed') {
      const activeManagerId = managerId || order.managerId
      if (activeManagerId) {
        const mgr = await prisma.user.findUnique({ where: { id: activeManagerId } })
        if (mgr) {
          await prisma.user.update({
            where: { id: activeManagerId },
            data: { completedTasksCount: (mgr.completedTasksCount || 0) + 1 }
          })
        }
      }
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/orders/:orderId/notes', authMiddleware, async (req, res) => {
  try {
    const { text, authorName } = req.body
    const order = await prisma.order.findUnique({ where: { id: req.params.orderId } })
    if (!order) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })

    const notes = Array.isArray(order.managerNotes) ? [...order.managerNotes] : []
    notes.push({ text, authorName, createdAt: new Date().toISOString() })

    const updated = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { managerNotes: notes }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/orders/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' })
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

// Site Content Routes
app.get('/api/site-content/:docId', async (req, res) => {
  try {
    const docId = req.params.docId
    const doc = await prisma.siteContent.findUnique({ where: { docId } })
    if (!doc) {
      return res.json(docId === 'default' ? DEFAULT_SITE_CONTENT : {})
    }
    res.json(doc.content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/site-content/:docId', authMiddleware, async (req, res) => {
  try {
    const docId = req.params.docId
    const doc = await prisma.siteContent.upsert({
      where: { docId },
      create: { docId, content: req.body },
      update: { content: req.body }
    })
    res.json(doc.content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Review Routes
app.get('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const list = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/reviews/:developerId', authMiddleware, async (req, res) => {
  try {
    const list = await prisma.review.findMany({
      where: { assignedDeveloperId: req.params.developerId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/reviews/:developerId', authMiddleware, async (req, res) => {
  try {
    const developerId = req.params.developerId
    const { orderId, rating, comment, customerName, serviceType } = req.body

    const review = await prisma.review.create({
      data: {
        orderId,
        rating,
        comment,
        customerName,
        serviceType,
        assignedDeveloperId: developerId
      }
    })

    const dev = await prisma.user.findUnique({ where: { id: developerId } })
    if (dev) {
      const reviews = await prisma.review.findMany({
        where: { assignedDeveloperId: developerId }
      })
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
      await prisma.user.update({
        where: { id: developerId },
        data: {
          ratingCount: reviews.length,
          ratingSum: sum,
          ratingAvg: sum / reviews.length
        }
      })
    }

    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Database Connection & Seed Setup
export async function startServer() {
  try {
    await prisma.$connect()
    console.log('[PostgreSQL] Connected successfully.')

    const adminEmail = 'admin@gmail.com'
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123'
    let adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedAdminPassword,
          name: 'Admin',
          role: 'admin',
          developerRequestStatus: 'none'
        }
      })
      console.log(`[Seed] Seeded default administrator account: ${adminEmail} / ${adminPassword}`)
    } else {
      const passwordValid = await bcrypt.compare(adminPassword, adminExists.password)
      if (adminExists.role !== 'admin' || !passwordValid) {
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            role: 'admin',
            password: await bcrypt.hash(adminPassword, 10)
          }
        })
        console.log(`[Seed] Repaired administrator account: ${adminEmail}`)
      }
    }

    app.listen(PORT, () => {
      console.log(`[Express] Backend server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[PostgreSQL] Initial connection failed:', err)
    process.exit(1)
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectRun) {
  import('./bootstrap.js').catch((err) => {
    console.error('[Server] Failed to start:', err?.message || err)
    process.exit(1)
  })
}
