import mongoose from 'mongoose'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import { pathToFileURL } from 'url'
import dns from 'dns'

dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const prisma = new PrismaClient()

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' })
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' })
const reviewSchema = new mongoose.Schema({}, { strict: false, collection: 'reviews' })
const siteContentSchema = new mongoose.Schema({}, { strict: false, collection: 'sitecontents' })

const MongoUser = mongoose.model('User', userSchema)
const MongoOrder = mongoose.model('Order', orderSchema)
const MongoReview = mongoose.model('Review', reviewSchema)
const MongoSiteContent = mongoose.model('SiteContent', siteContentSchema)

function toDate(value) {
  if (!value) return new Date()
  return value instanceof Date ? value : new Date(value)
}

function toPaymentStatus(value) {
  if (value === 'paid') return 'paid'
  return 'unpaid'
}

function toAttachments(value) {
  if (!Array.isArray(value)) return []
  return value
}

function toNotes(notes) {
  if (!Array.isArray(notes)) return []
  return notes.map(note => ({
    text: note.text,
    authorName: note.authorName,
    createdAt: note.createdAt ? toDate(note.createdAt).toISOString() : new Date().toISOString()
  }))
}

async function migrateUsers() {
  const users = await MongoUser.find({})
  let count = 0
  for (const doc of users) {
    const id = doc._id.toString()
    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: doc.email,
        password: doc.password,
        name: doc.name || '',
        role: doc.role || 'customer',
        developerRequestStatus: doc.developerRequestStatus || 'none',
        companyName: doc.companyName || '',
        phone: doc.phone || '',
        bio: doc.bio || '',
        experienceCategories: doc.experienceCategories || [],
        experienceYears: doc.experienceYears || '',
        ratingAvg: doc.ratingAvg ?? 0,
        ratingCount: doc.ratingCount ?? 0,
        ratingSum: doc.ratingSum ?? 0,
        completedTasksCount: doc.completedTasksCount ?? 0,
        developerRequestedAt: doc.developerRequestedAt ? toDate(doc.developerRequestedAt) : null,
        developerReviewedAt: doc.developerReviewedAt ? toDate(doc.developerReviewedAt) : null,
        developerReviewedBy: doc.developerReviewedBy || null,
        updatedBy: doc.updatedBy || null,
        createdAt: toDate(doc.createdAt)
      },
      update: {
        email: doc.email,
        password: doc.password,
        name: doc.name || '',
        role: doc.role || 'customer',
        developerRequestStatus: doc.developerRequestStatus || 'none',
        companyName: doc.companyName || '',
        phone: doc.phone || '',
        bio: doc.bio || '',
        experienceCategories: doc.experienceCategories || [],
        experienceYears: doc.experienceYears || '',
        ratingAvg: doc.ratingAvg ?? 0,
        ratingCount: doc.ratingCount ?? 0,
        ratingSum: doc.ratingSum ?? 0,
        completedTasksCount: doc.completedTasksCount ?? 0,
        developerRequestedAt: doc.developerRequestedAt ? toDate(doc.developerRequestedAt) : null,
        developerReviewedAt: doc.developerReviewedAt ? toDate(doc.developerReviewedAt) : null,
        developerReviewedBy: doc.developerReviewedBy || null,
        updatedBy: doc.updatedBy || null,
        createdAt: toDate(doc.createdAt)
      }
    })
    count++
  }
  console.log(`[Migrate] Users: ${count}`)
}

async function migrateOrders() {
  const orders = await MongoOrder.find({})
  let count = 0
  for (const doc of orders) {
    const id = doc._id.toString()
    const data = {
      customerId: doc.customerId,
      customerName: doc.customerName,
      managerId: doc.managerId || null,
      managerName: doc.managerName || null,
      assignedDeveloperId: doc.assignedDeveloperId || null,
      assignedDeveloperName: doc.assignedDeveloperName || null,
      assignedDeveloperComment: doc.assignedDeveloperComment || '',
      serviceId: doc.serviceId || '',
      serviceType: doc.serviceType,
      description: doc.description,
      priority: doc.priority,
      status: doc.status || 'new',
      price: doc.price ?? 0,
      priceExplanation: doc.priceExplanation || '',
      paymentStatus: toPaymentStatus(doc.paymentStatus),
      developerPayout: doc.developerPayout ?? 0,
      payoutStatus: doc.payoutStatus || 'pending',
      customerRating: doc.customerRating ?? null,
      companyRating: doc.companyRating ?? null,
      customerReview: doc.customerReview || '',
      attachments: toAttachments(doc.attachments),
      completionAttachment: doc.completionAttachment || null,
      managerNotes: toNotes(doc.managerNotes),
      quoteConfirmedAt: doc.quoteConfirmedAt ? toDate(doc.quoteConfirmedAt) : null,
      assignedAt: doc.assignedAt ? toDate(doc.assignedAt) : null,
      viewedAt: doc.viewedAt ? toDate(doc.viewedAt) : null,
      confirmedAt: doc.confirmedAt ? toDate(doc.confirmedAt) : null,
      arrivedAt: doc.arrivedAt ? toDate(doc.arrivedAt) : null,
      startedAt: doc.startedAt ? toDate(doc.startedAt) : null,
      completedAt: doc.completedAt ? toDate(doc.completedAt) : null,
      managerApprovedAt: doc.managerApprovedAt ? toDate(doc.managerApprovedAt) : null,
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt || doc.createdAt)
    }
    await prisma.order.upsert({
      where: { id },
      create: { id, ...data },
      update: data
    })
    count++
  }
  console.log(`[Migrate] Orders: ${count}`)
}

async function migrateReviews() {
  const reviews = await MongoReview.find({})
  let count = 0
  for (const doc of reviews) {
    const id = doc._id.toString()
    await prisma.review.upsert({
      where: { id },
      create: {
        id,
        orderId: doc.orderId,
        rating: doc.rating,
        comment: doc.comment || '',
        customerName: doc.customerName,
        serviceType: doc.serviceType,
        assignedDeveloperId: doc.assignedDeveloperId,
        createdAt: toDate(doc.createdAt)
      },
      update: {
        orderId: doc.orderId,
        rating: doc.rating,
        comment: doc.comment || '',
        customerName: doc.customerName,
        serviceType: doc.serviceType,
        assignedDeveloperId: doc.assignedDeveloperId,
        createdAt: toDate(doc.createdAt)
      }
    })
    count++
  }
  console.log(`[Migrate] Reviews: ${count}`)
}

async function migrateSiteContent() {
  const docs = await MongoSiteContent.find({})
  let count = 0
  for (const doc of docs) {
    const id = doc._id.toString()
    await prisma.siteContent.upsert({
      where: { docId: doc.docId },
      create: {
        id,
        docId: doc.docId,
        content: doc.content || {}
      },
      update: {
        content: doc.content || {}
      }
    })
    count++
  }
  console.log(`[Migrate] Site content: ${count}`)
}

async function importFromMongo() {
  if (!MONGO_URI) {
    console.log('[Migrate] No MONGO_URI set — skipping MongoDB import.')
    return
  }

  console.log('[Migrate] Connecting to MongoDB...')
  await mongoose.connect(MONGO_URI)
  try {
    console.log('[Migrate] Connected to MongoDB.')
    await migrateUsers()
    await migrateOrders()
    await migrateReviews()
    await migrateSiteContent()
    console.log('[Migrate] Done.')
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectRun) {
  importFromMongo()
    .catch(err => {
      console.error('[Migrate] Failed:', err)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { importFromMongo }
