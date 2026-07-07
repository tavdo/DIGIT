import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  managerId: { type: String, default: null },
  managerName: { type: String, default: null },
  assignedDeveloperId: { type: String, default: null },
  assignedDeveloperName: { type: String, default: null },
  assignedDeveloperComment: { type: String, default: '' },
  serviceId: { type: String, default: '' },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['urgent', 'tomorrow', 'flexible'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'new',
      'quote_offered',
      'quote_confirmed',
      'quote_rejected',
      'assigned',
      'in_progress',
      'waiting_approval',
      'completed',
      'cancelled'
    ],
    default: 'new'
  },
  price: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  developerPayout: { type: Number, default: 0 },
  payoutStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  customerRating: { type: Number, default: null },
  attachments: { type: [String], default: [] },
  managerNotes: { type: [noteSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

// Update updatedAt pre-save hook
orderSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Order', orderSchema)
