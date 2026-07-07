import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

import User from './models/User.js'
import Order from './models/Order.js'
import SiteContent from './models/SiteContent.js'
import Review from './models/Review.js'
import { authMiddleware } from './middleware/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'digit_secret_pass_123'
const MONGO_URI = 'mongodb+srv://tavdo:temo1234@cluster0.euiap83.mongodb.net/digit'

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
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'ფოსტა უკვე გამოყენებულია.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const developerRequestStatus = role === 'developer' ? 'pending' : 'none'

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'customer',
      developerRequestStatus,
      ...extra
    })

    if (role === 'developer') {
      user.ratingAvg = 0
      user.ratingCount = 0
      user.ratingSum = 0
    }

    await user.save()
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'ელ.ფოსტა ან პაროლი არასწორია.' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'ელ.ფოსტა ან პაროლი არასწორია.' })
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json(req.user)
})

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name } = req.body
    let user = await User.findOne({ email })
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      user = new User({
        email,
        password: hashedPassword,
        name: name || 'მომხმარებელი',
        role: 'customer',
        developerRequestStatus: 'none'
      })
      await user.save()
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// User Routes
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const { role, developerRequestStatus } = req.query
    const filter = {}
    if (role) filter.role = role
    if (developerRequestStatus) filter.developerRequestStatus = developerRequestStatus

    const list = await User.find(filter).sort({ name: 1 })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
    if (!user) return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Orders/Tickets Routes
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { customerId, customerName, serviceId, serviceType, description, priority } = req.body
    
    // Find category manager mapping if configured
    let managerId = null
    let managerName = null
    const siteContent = await SiteContent.findOne({ docId: 'default' })
    if (siteContent && siteContent.content && siteContent.content.services) {
      const srv = siteContent.content.services.find(s => s.id === serviceId)
      if (srv && srv.managerId) {
        managerId = srv.managerId
        managerName = srv.managerName
      }
    }

    const order = new Order({
      customerId,
      customerName,
      managerId,
      managerName,
      serviceId,
      serviceType,
      description,
      priority,
      status: 'new'
    })
    await order.save()
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { customerId, assignedDeveloperId, filter } = req.query
    const queryFilter = {}
    if (customerId) queryFilter.customerId = customerId
    if (assignedDeveloperId) queryFilter.assignedDeveloperId = assignedDeveloperId

    const ordersList = await Order.find(queryFilter).sort({ createdAt: -1 })
    res.json(ordersList)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    if (!order) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const { status, managerId, managerName } = req.body
    const prevOrder = await Order.findById(req.params.orderId)
    if (!prevOrder) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })

    const order = await Order.findByIdAndUpdate(req.params.orderId, req.body, { new: true })

    // Self-healing database stats logic for manager completed counts
    if (status === 'completed' && prevOrder.status !== 'completed') {
      const activeManagerId = managerId || order.managerId
      if (activeManagerId) {
        const mgr = await User.findById(activeManagerId)
        if (mgr) {
          mgr.completedTasksCount = (mgr.completedTasksCount || 0) + 1
          await mgr.save()
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
    const order = await Order.findById(req.params.orderId)
    if (!order) return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა.' })

    order.managerNotes.push({ text, authorName, createdAt: new Date() })
    await order.save()
    res.json(order)
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
    const doc = await SiteContent.findOne({ docId })
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
    let doc = await SiteContent.findOne({ docId })
    if (!doc) {
      doc = new SiteContent({ docId, content: req.body })
    } else {
      doc.content = req.body
    }
    await doc.save()
    res.json(doc.content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Review Routes
app.get('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const list = await Review.find().sort({ createdAt: -1 })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/reviews/:developerId', authMiddleware, async (req, res) => {
  try {
    const list = await Review.find({ assignedDeveloperId: req.params.developerId }).sort({ createdAt: -1 })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/reviews/:developerId', authMiddleware, async (req, res) => {
  try {
    const developerId = req.params.developerId
    const { orderId, rating, comment, customerName, serviceType } = req.body

    const review = new Review({
      orderId,
      rating,
      comment,
      customerName,
      serviceType,
      assignedDeveloperId: developerId
    })
    await review.save()

    // Recalculate developer statistics
    const dev = await User.findById(developerId)
    if (dev) {
      const reviews = await Review.find({ assignedDeveloperId: developerId })
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
      dev.ratingCount = reviews.length
      dev.ratingSum = sum
      dev.ratingAvg = sum / reviews.length
      await dev.save()
    }

    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Database Connection & Seed Setup
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('[Mongoose] Connected successfully to MongoDB.')

    // Seed default administrator if not present
    const adminEmail = 'admin@gmail.com'
    const adminExists = await User.findOne({ email: adminEmail })
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10)
      const defaultAdmin = new User({
        email: adminEmail,
        password: hashedAdminPassword,
        name: 'Admin',
        role: 'admin',
        developerRequestStatus: 'none'
      })
      await defaultAdmin.save()
      console.log(`[Seed] Seeded default administrator account: ${adminEmail} / admin123`)
    }

    app.listen(PORT, () => {
      console.log(`[Express] Backend server running at http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('[Mongoose] Initial connection failed:', err)
  })
