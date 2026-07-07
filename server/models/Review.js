import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  customerName: { type: String, required: true },
  serviceType: { type: String, required: true },
  assignedDeveloperId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

export default mongoose.model('Review', reviewSchema)
